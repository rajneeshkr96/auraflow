import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import axios from "axios";
import { getOrCreateNeuralAgent, chatWithAgent } from "@/lib/neural";

const VERIFY_TOKEN = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN || "auraflow_token";

// ── Webhook Verification ──────────────────────────────────────────────────────
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

// ── Webhook Events ────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (body.object !== "instagram") {
      return NextResponse.json({ status: 404 }, { status: 404 });
    }

    // Return 200 immediately — process async
    processWebhook(body).catch((err) =>
      console.error("[Webhook] Processing error:", err)
    );

    return NextResponse.json({ received: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ── Core Processing ───────────────────────────────────────────────────────────
async function processWebhook(body: any) {
  for (const entry of body.entry ?? []) {
    const instagramAccountId: string = entry.id;

    if (entry.messaging) {
      for (const event of entry.messaging) {
        await handleDm(instagramAccountId, event);
      }
    }

    if (entry.changes) {
      for (const change of entry.changes) {
        if (change.field === "comments") {
          await handleComment(instagramAccountId, change.value);
        }
      }
    }
  }
}

// ── DM Handler ────────────────────────────────────────────────────────────────
async function handleDm(instagramAccountId: string, event: any) {
  const senderId: string = event.sender?.id;
  const messageText: string = event.message?.text;
  if (event.message?.is_echo || !messageText || senderId === instagramAccountId) return;

  const integration = await prisma.integration.findFirst({
    where: { instagramId: instagramAccountId },
  });
  if (!integration) return;

  // Upsert conversation
  const conversation = await prisma.conversation.upsert({
    where: { userId_recipientId: { userId: integration.userId, recipientId: senderId } },
    create: { userId: integration.userId, recipientId: senderId, integrationId: integration.id },
    update: {},
  });

  // Log user message
  await prisma.message.create({
    data: { conversationId: conversation.id, role: "USER", content: messageText },
  });

  // Find matching automation
  const automations = await prisma.automation.findMany({
    where: { userId: integration.userId, active: true },
    include: { triggers: true, keywords: true, listener: true },
  });

  const automation = matchAutomation(automations, "DM", messageText);
  if (!automation?.listener) return;

  const { listener } = automation;

  if (listener.listener === "MESSAGE") {
    const reply = listener.dmReply || "Thanks!";
    await sendDm(integration.token, senderId, reply, integration.pageId, integration.instagramId);
    await logAssistant(conversation.id, reply);
  } else if (listener.listener === "SMART_AI") {
    const agentId = await getOrCreateNeuralAgent(
      listener.id,
      integration.userId,
      listener.prompt || 'You are a helpful Instagram DM assistant.',
      automation.name,
      listener.neuralKbId ?? undefined
    );
    const sessionId = `auraflow-dm-${conversation.id}`;
    const aiReply = await chatWithAgent(agentId, messageText, sessionId);
    await sendDm(integration.token, senderId, aiReply, integration.pageId, integration.instagramId);
    await logAssistant(conversation.id, aiReply);
  }
}

// ── Comment Handler ───────────────────────────────────────────────────────────
async function handleComment(instagramAccountId: string, value: any) {
  const commenterId: string = value.from?.id;
  const commentText: string = value.text;
  const mediaId: string = value.media?.id;
  if (commenterId === instagramAccountId) return;

  const integration = await prisma.integration.findFirst({
    where: { instagramId: instagramAccountId },
  });
  if (!integration) return;

  const automations = await prisma.automation.findMany({
    where: { userId: integration.userId, active: true },
    include: { triggers: true, keywords: true, listener: true, posts: true },
  });

  const automation = matchAutomation(automations, "COMMENT", commentText, mediaId);
  if (!automation?.listener) return;

  const { listener } = automation;
  let replyText = "";

  if (listener.listener === "MESSAGE") {
    replyText = listener.commentReply || "Thanks!";
  } else if (listener.listener === "SMART_AI") {
    const agentId = await getOrCreateNeuralAgent(
      listener.id,
      integration.userId,
      listener.prompt || 'You are a helpful Instagram assistant replying to comments.',
      automation.name
    );
    replyText = await chatWithAgent(agentId, commentText, `auraflow-comment-${value.id}`);
  }

  if (replyText) {
    await sendCommentReply(integration.token, value.id, replyText);
  }

  if (listener.dmReply) {
    await sendDm(integration.token, commenterId, listener.dmReply, integration.pageId, integration.instagramId);
  }
}

// ── Matching Logic ────────────────────────────────────────────────────────────
function matchAutomation(
  automations: any[],
  triggerType: "DM" | "COMMENT",
  text: string,
  mediaId?: string
) {
  let best: any = null;
  let fallback: any = null;

  for (const auto of automations) {
    if (!auto.triggers.some((t: any) => t.type === triggerType)) continue;

    // For COMMENT: check if post matches (if posts are specified)
    if (triggerType === "COMMENT" && auto.posts?.length > 0) {
      if (!auto.posts.some((p: any) => p.postid === mediaId)) continue;
    }

    if (auto.keywords.length > 0) {
      if (auto.keywords.some((k: any) => text.toLowerCase().includes(k.word.toLowerCase()))) {
        best = auto;
        break;
      }
    } else {
      if (!fallback) fallback = auto;
    }
  }

  return best || fallback;
}

// ── Instagram API Helpers ─────────────────────────────────────────────────────
async function sendDm(
  token: string,
  recipientId: string,
  text: string,
  pageId?: string | null,
  instagramId?: string | null
) {
  // Instagram Business Login: use instagramId with graph.instagram.com
  // Facebook Login:           use pageId with graph.facebook.com
  const baseUrl = pageId
    ? `https://graph.facebook.com/v21.0/${pageId}/messages`
    : `https://graph.instagram.com/v21.0/${instagramId}/messages`;

  await axios
    .post(
      baseUrl,
      { recipient: { id: recipientId }, message: { text } },
      { params: { access_token: token } }
    )
    .catch((e) => console.error("[Webhook] DM send error:", e.response?.data || e.message));
}

async function sendCommentReply(token: string, commentId: string, text: string) {
  // Both Instagram Business Login and Facebook Login use the same replies endpoint structure.
  // The token type determines which host to use.
  const useInstagramLogin = !!process.env.INSTAGRAM_APP_CLIENT_ID;
  const baseUrl = useInstagramLogin
    ? `https://graph.instagram.com/v21.0/${commentId}/replies`
    : `https://graph.facebook.com/v21.0/${commentId}/replies`;

  await axios
    .post(
      baseUrl,
      { message: text },
      { params: { access_token: token } }
    )
    .catch((e) => console.error("[Webhook] Comment reply error:", e.response?.data || e.message));
}

async function logAssistant(conversationId: string, content: string) {
  await prisma.message.create({
    data: { conversationId, role: "ASSISTANT", content },
  });
}

// ── NeuralHub AI ─────────────────────────────────────────────────────────────
// Handled by lib/neural.ts — getOrCreateNeuralAgent() + chatWithAgent()
