import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUserId } from "@/lib/auth";
import NeuralClient from "@codeswayam/neural";

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

  try {
    const agent = await neural().agents.get(listener.neuralAgentId);
    return NextResponse.json({ agent, prompt: listener.prompt });
  } catch {
    return NextResponse.json({ agent: null, prompt: listener.prompt });
  }
}

// PATCH /api/agent — update prompt only (model is locked)
export async function PATCH(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { listenerId, prompt } = await req.json();
  if (!listenerId || !prompt?.trim())
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const listener = await prisma.listener.findUnique({ where: { id: listenerId } });
  if (!listener?.neuralAgentId)
    return NextResponse.json({ error: "No agent found" }, { status: 404 });

  // Only systemPrompt is editable — model/guardrails are platform-locked
  await neural().agents.update(listener.neuralAgentId, { systemPrompt: prompt });
  await prisma.listener.update({ where: { id: listenerId }, data: { prompt } });

  return NextResponse.json({ success: true });
}

// POST /api/agent — test chat (max 5 messages enforced client-side, agentId validated)
export async function POST(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { agentId, message, sessionId } = await req.json();
  if (!agentId || !message?.trim())
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const numericId = parseInt(agentId);
  if (isNaN(numericId))
    return NextResponse.json({ error: "Invalid agentId" }, { status: 400 });

  try {
    const result = await neural().agents.chat(String(numericId), message, { sessionId });
    return NextResponse.json({ text: result.text });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
