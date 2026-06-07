import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import NeuralClient from "@codeswayam/neural";
import { sdk } from "@codeswayam/api-client";

/** Verify the caller is an admin/superadmin via core-api JWT */
async function verifyAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("Authentication")?.value;
    if (!token) return false;

    const profile = await sdk.auth.getProfile({
      headers: {
        Authorization: `Bearer ${token}`,
        Cookie: `Authentication=${token}`,
      },
    });

    const user = profile?.data || profile;
    return user?.role === "admin" || user?.role === "superadmin";
  } catch {
    return false;
  }
}

function neural() {
  return new NeuralClient({
    apiKey: process.env.NEURAL_API_KEY!,
    baseUrl: process.env.NEURAL_API_URL || "http://localhost:3006",
  });
}

/**
 * GET /api/agent/admin/model-requests?status=pending|approved|rejected|all
 * Lists BYOK model requests — admin only
 */
export async function GET(req: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 });
  }

  const status = req.nextUrl.searchParams.get("status") || "pending";

  try {
    const requests = await (prisma as any).agentModelRequest.findMany({
      where: status === "all" ? {} : { status },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return NextResponse.json({ requests });
  } catch (err: any) {
    console.error("[Admin Model Requests GET]", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * PATCH /api/agent/admin/model-requests
 * Approve or reject a model request — admin only
 * Body: { requestId, action: "approve"|"reject", adminNote? }
 */
export async function PATCH(req: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 });
  }

  const { requestId, action, adminNote } = await req.json();

  if (!requestId || !["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid payload: requestId and action required" }, { status: 400 });
  }

  try {
    const request = await (prisma as any).agentModelRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (request.status !== "pending") {
      return NextResponse.json(
        { error: `Request already ${request.status}` },
        { status: 409 }
      );
    }

    if (action === "approve") {
      let allowedModels = "";
      try {
        const agentInfo = await neural().agents.get(request.neuralAgentId);
        allowedModels = agentInfo.allowedModels || "";
      } catch (err: any) {
        console.warn("[Admin Model Requests PATCH] Failed to fetch current agent:", err.message);
      }

      const allowedList = allowedModels ? allowedModels.split(",") : [];
      if (!allowedList.includes(request.requestedModelId)) {
        allowedList.push(request.requestedModelId);
      }
      const newAllowedModels = allowedList.join(",");

      // Update the neural agent's model and allowedModels list in neural-api
      await neural().agents.update(request.neuralAgentId, {
        model: request.requestedModelId,
        allowedModels: newAllowedModels,
      });
    }

    const updated = await (prisma as any).agentModelRequest.update({
      where: { id: requestId },
      data: {
        status: action === "approve" ? "approved" : "rejected",
        adminNote: adminNote?.trim() || null,
      },
    });

    return NextResponse.json({
      request: updated,
      message:
        action === "approve"
          ? `✅ Model switched to "${request.requestedModelName}" for agent ${request.neuralAgentId}`
          : `❌ Request rejected`,
    });
  } catch (err: any) {
    console.error("[Admin Model Requests PATCH]", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
