import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUserId } from "@/lib/auth";
import NeuralClient from "@codeswayam/neural";

const MAX_DAILY_TESTS = 5;

function neural() {
  return new NeuralClient({
    apiKey: process.env.NEURAL_API_KEY!,
    baseUrl: process.env.NEURAL_API_URL || "http://localhost:3006",
  });
}

// GET /api/agent?listenerId=xxx
export async function GET(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const listenerId = req.nextUrl.searchParams.get("listenerId");
  if (!listenerId) return NextResponse.json({ error: "listenerId required" }, { status: 400 });

  const listener = await prisma.listener.findUnique({ where: { id: listenerId } });
  if (!listener?.neuralAgentId) return NextResponse.json({ agent: null });

  // Also fetch active model request to show in UI
  const modelRequest = await (prisma as any).agentModelRequest?.findFirst({
    where: { userId, neuralAgentId: listener.neuralAgentId },
    orderBy: { createdAt: "desc" },
  }).catch(() => null);

  // Fetch all approved model requests for this agent to enable switching in UI
  const approvedRequests = await (prisma as any).agentModelRequest?.findMany({
    where: { userId, neuralAgentId: listener.neuralAgentId, status: "approved" },
    orderBy: { createdAt: "desc" },
  }).catch(() => []);

  try {
    const agent = await neural().agents.get(listener.neuralAgentId);
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

// PATCH /api/agent — update prompt and/or active model
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
  if (!listener?.neuralAgentId)
    return NextResponse.json({ error: "No agent found" }, { status: 404 });

  const updatePayload: any = {};
  if (prompt !== undefined) {
    if (!prompt.trim()) return NextResponse.json({ error: "Prompt cannot be empty" }, { status: 400 });
    updatePayload.systemPrompt = prompt;
  }

  if (model !== undefined) {
    // Security check: is this model the default platform model ("gemini-1.5-flash") or an approved custom model?
    const isPlatform = model === "gemini-1.5-flash";
    let isApproved = false;
    if (!isPlatform) {
      const request = await (prisma as any).agentModelRequest.findFirst({
        where: {
          userId,
          neuralAgentId: listener.neuralAgentId,
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
  await neural().agents.update(listener.neuralAgentId, updatePayload);

  // If prompt was updated, also update listener record in auraflow db
  if (prompt !== undefined) {
    await prisma.listener.update({ where: { id: listenerId }, data: { prompt } });
  }

  return NextResponse.json({ success: true });
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

  // ── Server-side rate limit: 5 test messages per user per agent per day ──
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  try {
    const usage = await (prisma as any).dailyTestUsage.findUnique({
      where: { userId_agentId_date: { userId, agentId, date: today } },
    });

    if (usage && usage.count >= MAX_DAILY_TESTS) {
      return NextResponse.json(
        {
          error: `Daily test limit reached (${MAX_DAILY_TESTS}/day). Come back tomorrow or use the full NeuralHub playground.`,
          limitReached: true,
          limit: MAX_DAILY_TESTS,
        },
        { status: 429 }
      );
    }
  } catch {
    // DailyTestUsage table may not exist yet (before migration) — allow through
    console.warn("[Agent Test] DailyTestUsage check failed — table may not exist yet");
  }

  try {
    const result = await neural().agents.chat(String(numericId), message, { sessionId });

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
