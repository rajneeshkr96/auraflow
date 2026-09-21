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
  } catch {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  if (body.object !== "instagram") {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  // Non-blocking asynchronous processing
  WebhookProcessorService.processPayload(body).catch((err) =>
    console.error("[InstagramWebhookRoute] Processing error:", err)
  );

  // Return 200 immediately to prevent Meta retry loop
  return NextResponse.json({ received: true }, { status: 200 });
}
