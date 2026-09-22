import { NextResponse } from "next/server";
import { WebhookProcessorService } from "@/lib/domain/webhook/webhook-processor.service";

const VERIFY_TOKEN = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN || "auraflow_token";

export const maxDuration = 30;

/**
 * Webhook Verification Handler (Instagram Challenge Verification)
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

/**
 * Webhook Event Consumer Handler
 * Immediately responds 200 to acknowledge delivery to Meta, then delegates
 * domain processing to WebhookProcessorService in the background.
 */
export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch (err: any) {
    console.error("[InstagramWebhook] JSON parse error:", err.message);
    return NextResponse.json({ received: true }, { status: 200 });
  }

  console.log("[InstagramWebhook] Incoming payload:", JSON.stringify(body));

  // Meta sends 'instagram' for Instagram Graph API or 'page' for Messenger-routed accounts
  if (body.object !== "instagram" && body.object !== "page") {
    console.log(`[InstagramWebhook] Ignoring non-Instagram object: "${body?.object}"`);
    return NextResponse.json({ received: true }, { status: 200 });
  }

  try {
    await WebhookProcessorService.processPayload(body);
    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (error: any) {
    console.error("[InstagramWebhook] Processing error:", error);
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
