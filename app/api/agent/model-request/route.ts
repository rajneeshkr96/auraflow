import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUserId } from "@/lib/auth";

/**
 * GET /api/agent/model-request?listenerId=xxx
 * Returns the current model request status for an agent
 */
export async function GET(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const listenerId = req.nextUrl.searchParams.get("listenerId");
  if (!listenerId) return NextResponse.json({ error: "listenerId required" }, { status: 400 });

  try {
    const request = await (prisma as any).agentModelRequest.findFirst({
      where: { userId, listenerId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ request: request ?? null });
  } catch {
    return NextResponse.json({ request: null });
  }
}

/**
 * POST /api/agent/model-request
 * Submit a request to use a BYOK model for an automation agent.
 * Admin must approve before the model is switched.
 */
export async function POST(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { listenerId, requestedModelId, requestedModelName } = await req.json();
  if (!listenerId || !requestedModelId || !requestedModelName) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Look up the listener to get neuralAgentId
  const listener = await prisma.listener.findUnique({ where: { id: listenerId } });
  if (!listener?.neuralAgentId) {
    return NextResponse.json({ error: "No agent provisioned yet for this automation" }, { status: 404 });
  }

  // Check if there's already a pending request
  const existing = await (prisma as any).agentModelRequest.findFirst({
    where: { userId, listenerId, status: "pending" },
  }).catch(() => null);

  if (existing) {
    return NextResponse.json(
      { error: "You already have a pending model request for this automation" },
      { status: 409 }
    );
  }

  try {
    const request = await (prisma as any).agentModelRequest.create({
      data: {
        userId,
        listenerId,
        neuralAgentId: listener.neuralAgentId,
        requestedModelId,
        requestedModelName,
        status: "pending",
      },
    });
    return NextResponse.json({ request, message: "Request submitted. Awaiting admin approval." });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to submit request" }, { status: 500 });
  }
}
