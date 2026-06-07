import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import NeuralClient from "@codeswayam/neural";

/**
 * GET /api/agent/byok-models
 * Returns the authenticated user's BYOK models from neural-api.
 * Used by the AgentPanel "Request Custom Model" modal.
 */
export async function GET(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const neural = new NeuralClient({
      apiKey: process.env.NEURAL_API_KEY!,
      baseUrl: process.env.NEURAL_API_URL || "http://localhost:3006",
    });

    // Fetch models from neural-api — filter to user's BYOK models only
    const models = await neural.models.list(
      { capability: "chat" },
      { headers: { "x-user-id": String(userId) } }
    );
    const byokModels = (models as any).user ?? [];

    return NextResponse.json({
      models: byokModels.map((m: any) => ({
        id: m.modelId,
        name: m.name,
        provider: m.provider,
        supportsChat: m.supportsChat,
      })).filter((m: any) => m.supportsChat),
    });
  } catch (err: any) {
    console.error("[BYOK Models] Failed to fetch:", err.message);
    return NextResponse.json({ models: [] });
  }
}
