import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUserId } from "@/lib/auth";
import { getRawAuthToken } from "@/lib/platform/auth";
import { sdk } from "@codeswayam/api-client";
import { getNeuralClient, PlatformNeuralService } from "@/lib/platform/neural";

const MAX_DAILY_TESTS = 5;

// GET /api/agent?listenerId=xxx
export async function GET(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const listenerId = req.nextUrl.searchParams.get("listenerId");
  if (!listenerId) return NextResponse.json({ error: "listenerId required" }, { status: 400 });

  const listener = await prisma.listener.findUnique({ where: { id: listenerId } });
  if (!listener) return NextResponse.json({ error: "Listener not found" }, { status: 404 });

  let neuralAgentId = listener.neuralAgentId;

  // Auto-provision agent immediately if listener is SMART_AI and not yet provisioned
  if (!neuralAgentId && listener.listener === "SMART_AI") {
    try {
      const automation = await prisma.automation.findUnique({ where: { id: listener.automationId } });
      neuralAgentId = await PlatformNeuralService.createAgent({
        name: automation?.name || `auraflow-${listener.id.slice(-6)}`,
        systemPrompt: listener.prompt || "You are a helpful Instagram assistant. Reply naturally and concisely.",
        userId,
      });
      await prisma.listener.update({ where: { id: listenerId }, data: { neuralAgentId } });
    } catch (err: any) {
      console.error("[Agent Route] Auto-provision on GET failed:", err.message);
    }
  }

  if (!neuralAgentId) return NextResponse.json({ agent: null, prompt: listener.prompt });

  // Also fetch active model request to show in UI
  const modelRequest = await (prisma as any).agentModelRequest?.findFirst({
    where: { userId, neuralAgentId },
    orderBy: { createdAt: "desc" },
  }).catch(() => null);

  // Fetch all approved model requests for this agent to enable switching in UI
  const approvedRequests = await (prisma as any).agentModelRequest?.findMany({
    where: { userId, neuralAgentId, status: "approved" },
    orderBy: { createdAt: "desc" },
  }).catch(() => []);

  try {
    const agent = await getNeuralClient().agents.get(neuralAgentId);
    return NextResponse.json({
      agent,
      prompt: listener.prompt,
      modelRequest: modelRequest ?? null,
      approvedRequests: approvedRequests ?? [],
    });
  } catch {
    return NextResponse.json({
      agent: null,
      prompt: listener.prompt,
      modelRequest: modelRequest ?? null,
      approvedRequests: approvedRequests ?? [],
    });
  }
}

// PATCH /api/agent — update prompt and/or active model (auto-provisions if missing)
export async function PATCH(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { listenerId, prompt, model } = await req.json();
  if (!listenerId)
    return NextResponse.json({ error: "Missing listenerId" }, { status: 400 });

  if (prompt === undefined && model === undefined) {
    return NextResponse.json({ error: "Either prompt or model must be provided" }, { status: 400 });
  }

  const listener = await prisma.listener.findUnique({ where: { id: listenerId } });
  if (!listener) return NextResponse.json({ error: "Listener not found" }, { status: 404 });

  let neuralAgentId = listener.neuralAgentId;

  // Auto-provision if agent doesn't exist yet
  if (!neuralAgentId) {
    try {
      const automation = await prisma.automation.findUnique({ where: { id: listener.automationId } });
      neuralAgentId = await PlatformNeuralService.createAgent({
        name: automation?.name || `auraflow-${listener.id.slice(-6)}`,
        systemPrompt: prompt || listener.prompt || "You are a helpful Instagram assistant. Reply naturally and concisely.",
        userId,
      });
      await prisma.listener.update({
        where: { id: listenerId },
        data: {
          neuralAgentId,
          ...(prompt !== undefined ? { prompt } : {}),
        },
      });
    } catch (err: any) {
      return NextResponse.json({ error: `Failed to provision AI agent: ${err.message}` }, { status: 500 });
    }
  } else {
    const updatePayload: any = {};
    if (prompt !== undefined) {
      if (!prompt.trim()) return NextResponse.json({ error: "Prompt cannot be empty" }, { status: 400 });
      updatePayload.systemPrompt = prompt;
    }

    if (model !== undefined) {
      const isPlatform = model === "gemini-1.5-flash" || model === "gemini-2.0-flash" || model === "gemini-2.5-flash";
      let isApproved = false;
      if (!isPlatform) {
        const request = await (prisma as any).agentModelRequest.findFirst({
          where: {
            userId,
            neuralAgentId,
            requestedModelId: model,
            status: "approved",
          },
        });
        if (request) isApproved = true;
      }

      if (!isPlatform && !isApproved) {
        return NextResponse.json({ error: "Model choice not approved or invalid" }, { status: 403 });
      }

      updatePayload.model = model;
    }

    // Update in neural-api
    await getNeuralClient().agents.update(neuralAgentId, updatePayload);

    // If prompt was updated, also update listener record in auraflow db
    if (prompt !== undefined) {
      await prisma.listener.update({ where: { id: listenerId }, data: { prompt } });
    }
  }

  // Fetch updated agent to return in response
  let updatedAgent = null;
  try {
    updatedAgent = await getNeuralClient().agents.get(neuralAgentId);
  } catch {
    // Non-fatal
  }

  return NextResponse.json({ success: true, agent: updatedAgent, prompt: prompt ?? listener.prompt });
}

// POST /api/agent — test chat with server-side 5/day rate limit
export async function POST(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { agentId, message, sessionId } = await req.json();
  if (!agentId || !message?.trim())
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const numericId = parseInt(agentId);
  if (isNaN(numericId))
    return NextResponse.json({ error: "Invalid agentId" }, { status: 400 });

  // ── Server-side rate limit check ──
  // Enterprise / Pro plan users are exempt from the 5-message test cap
  const token = await getRawAuthToken();
  let isPremiumTier = false;
  if (token) {
    try {
      const fullProfile = await sdk.getFullProfile({
        headers: { Authorization: `Bearer ${token}`, Cookie: `Authentication=${token}` },
      });
      isPremiumTier = !!fullProfile?.subscriptions?.some(
        (s: any) =>
          s.status === "active" &&
          (s.planTier === "enterprise" ||
            s.planTier === "pro" ||
            s.productSaasId?.includes("enterprise") ||
            s.productSaasId?.includes("pro") ||
            s.features?.includes("ai_agents"))
      );
    } catch {
      // Non-fatal fallback
    }
  }

  const effectiveLimit = isPremiumTier ? 500 : MAX_DAILY_TESTS;
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  try {
    const usage = await (prisma as any).dailyTestUsage.findUnique({
      where: { userId_agentId_date: { userId, agentId, date: today } },
    });

    if (usage && usage.count >= effectiveLimit) {
      return NextResponse.json(
        {
          error: `Daily test limit reached (${effectiveLimit}/day). Come back tomorrow or use the full NeuralHub playground.`,
          limitReached: true,
          limit: effectiveLimit,
        },
        { status: 429 }
      );
    }
  } catch {
    // DailyTestUsage table may not exist yet (before migration) — allow through
    console.warn("[Agent Test] DailyTestUsage check failed — table may not exist yet");
  }

  try {
    const result = await getNeuralClient().agents.chat(String(numericId), message, { sessionId });

    // Increment usage counter
    try {
      await (prisma as any).dailyTestUsage.upsert({
        where: { userId_agentId_date: { userId, agentId, date: today } },
        create: { userId, agentId, date: today, count: 1 },
        update: { count: { increment: 1 } },
      });
    } catch {
      // Non-fatal — just log and continue
      console.warn("[Agent Test] Failed to increment DailyTestUsage counter");
    }

    return NextResponse.json({ text: result.text });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
