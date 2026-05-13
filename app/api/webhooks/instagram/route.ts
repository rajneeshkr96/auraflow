import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import axios from "axios";
import { getOrCreateNeuralAgent, chatWithAgent } from "@/lib/neural";

const VERIFY_TOKEN = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN || "auraflow_token";

export const maxDuration = 30;

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
// CRITICAL: Always return 200 immediately.
// If Instagram doesn't get 200 within ~5s it retries — causing infinite loops.
// We fire-and-forget processWebhook in the background.
export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    // Malformed body — ack anyway so Instagram doesn't retry
    return NextResponse.json({ received: true }, { status: 200 });
  }

  if (body.object !== "instagram") {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  // Fire-and-forget — never await, never let it block the 200 response
  processWebhook(body).catch((err) =>
    console.error("[Webhook] Processing error:", err)
  );

  // Instagram requires 200 back FAST — return before any DB/AI work
  return NextResponse.json({ received: true }, { status: 200 });
}

// ── Core Processing ───────────────────────────────────────────────────────────
async function processWebhook(body: any) {
  console.log("[Webhook] start. entries:", body.entry?.length);

  for (const entry of body.entry ?? []) {
    const instagramAccountId: string = entry.id;

    if (entry.messaging) {
      for (const event of entry.messaging) {
        await handleDm(instagramAccountId, event).catch((e) =>
          console.error("[Webhook] handleDm error:", e)
        );
      }
    }

    if (entry.changes) {
      for (const change of entry.changes) {
        if (change.field === "comments") {
          await handleComment(instagramAccountId, change.value).catch((e) =>
            console.error("[Webhook] handleComment error:", e)
          );
        }
      }
    }
  }
}

// ── DM Handler ────────────────────────────────────────────────────────────────
async function handleDm(instagramAccountId: string, event: any) {
  const senderId: string = event.sender?.id;
  const messageText: string = event.message?.text;
  const mid: string = event.message?.mid;

  // ── Loop guard 1: skip echoes (our own sent messages come back as echoes)
  if (event.message?.is_echo) {
    console.log("[DM] Skipped — echo");
    return;
  }

  // ── Loop guard 2: skip if no text (reactions, stickers, etc.)
  if (!messageText?.trim()) {
    console.log("[DM] Skipped — no text");
    return;
  }

  // ── Loop guard 3: skip if sender is the account itself
  if (senderId === instagramAccountId) {
    console.log("[DM] Skipped — self message");
    return;
  }

  const integration = await prisma.integration.findFirst({
    where: {
      OR: [
        { instagramId: instagramAccountId },
        { pageId: instagramAccountId },
      ],
    },
  });
  if (!integration) {
    console.error("[DM] No integration for:", instagramAccountId);
    return;
  }

  const conversation = await prisma.conversation.upsert({
    where: { userId_recipientId: { userId: integration.userId, recipientId: senderId } },
    create: { userId: integration.userId, recipientId: senderId, integrationId: integration.id },
    update: {},
  });

  // ── Loop guard 4: dedup by message ID (mid) — Instagram retries send the same mid
  if (mid) {
    const alreadyProcessed = await prisma.message.findFirst({
      where: { conversationId: conversation.id, mid },
    });
    if (alreadyProcessed) {
      console.log("[DM] Skipped — duplicate mid:", mid);
      return;
    }
  }

  // ── Loop guard 5: dedup by content+time window (fallback when mid is absent)
  const recentDup = await prisma.message.findFirst({
    where: {
      conversationId: conversation.id,
      role: "USER",
      content: messageText,
      createdAt: { gte: new Date(Date.now() - 2 * 60 * 1000) },
    },
  });
  if (recentDup) {
    console.log("[DM] Skipped — duplicate content within 2 min");
    return;
  }

  // Record the inbound message (with mid for future dedup)
  await prisma.message.create({
    data: { conversationId: conversation.id, role: "USER", content: messageText, mid: mid ?? null },
  });

  const automations = await prisma.automation.findMany({
    where: { userId: integration.userId, active: true },
    include: { triggers: true, keywords: true, listener: true },
  });

  const automation = matchAutomation(automations, "DM", messageText);
  if (!automation?.listener) {
    console.log("[DM] No automation matched for:", messageText);
    return;
  }
  console.log("[DM] Matched:", automation.name, "| type:", automation.listener.listener);

  const { listener } = automation;

  if (listener.listener === "MESSAGE") {
    const reply = listener.dmReply || "Thanks!";
    await sendDm(integration.token, senderId, reply, integration.pageId, integration.instagramId);
    await logAssistant(conversation.id, reply);
    console.log("[DM] ✅ MESSAGE reply sent");
  } else if (listener.listener === "SMART_AI") {
    console.log("[DM] Getting SMART_AI agent...");
    const agentId = await getOrCreateNeuralAgent(
      listener.id,
      integration.userId,
      listener.prompt || "You are a helpful Instagram DM assistant.",
      automation.name,
      (listener as any).neuralKbId ?? undefined
    );
    const sessionId = `auraflow-dm-${conversation.id}`;
    const aiReply = await chatWithAgent(agentId, messageText, sessionId);
    console.log("[DM] AI reply:", aiReply?.slice(0, 80));
    await sendDm(integration.token, senderId, aiReply, integration.pageId, integration.instagramId);
    await logAssistant(conversation.id, aiReply);
    console.log("[DM] ✅ SMART_AI reply sent");
  }
}

// ── Comment Handler ───────────────────────────────────────────────────────────
async function handleComment(instagramAccountId: string, value: any) {
  const commenterId: string = value.from?.id;
  const commentText: string = value.text;
  const mediaId: string = value.media?.id;
  const commentId: string = value.id;

  // ── Loop guard 1: skip if missing required fields
  if (!commenterId || !commentText?.trim() || !commentId) return;

  // ── Loop guard 2: skip own comments (our replies fire another change event)
  if (commenterId === instagramAccountId) {
    console.log("[Comment] Skipped — own comment");
    return;
  }

  // ── Loop guard 3: dedup by commentId — Instagram retries send the same id
  const alreadyHandled = await prisma.processedComment.findUnique({
    where: { commentId },
  }).catch(() => null); // table may not exist yet — safe fallback

  if (alreadyHandled) {
    console.log("[Comment] Skipped — already processed:", commentId);
    return;
  }

  // Mark as processed immediately (before any async work) to prevent race conditions
  await prisma.processedComment.create({ data: { commentId } }).catch(() => null);

  const integration = await prisma.integration.findFirst({
    where: {
      OR: [
        { instagramId: instagramAccountId },
        { pageId: instagramAccountId },
      ],
    },
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
      listener.prompt || "You are a helpful Instagram assistant replying to comments.",
      automation.name
    );
    replyText = await chatWithAgent(agentId, commentText, `auraflow-comment-${commentId}`);
  }

  if (replyText) {
    await sendCommentReply(integration.token, commentId, replyText);
  }

  if (listener.dmReply) {
    await sendDm(integration.token, commenterId, listener.dmReply, integration.pageId, integration.instagramId);
  }

  console.log("[Comment] ✅ Done for commentId:", commentId);
}

// ── Matching Logic ────────────────────────────────────────────────────────────
function matchAutomation(
  automations: any[],
  triggerType: "DM" | "COMMENT",
  text: string,
  mediaId?: string
) {
  let best: any = null;
  let bestKeywordLen = 0;
  let fallback: any = null;

  for (const auto of automations) {
    if (!auto.triggers.some((t: any) => t.type === triggerType)) continue;

    if (triggerType === "COMMENT" && auto.posts?.length > 0) {
      if (!auto.posts.some((p: any) => p.postid === mediaId)) continue;
    }

    if (auto.keywords.length > 0) {
      const matched = auto.keywords
        .filter((k: any) => text.toLowerCase().includes(k.word.toLowerCase()))
        .sort((a: any, b: any) => b.word.length - a.word.length)[0];

      if (matched && matched.word.length > bestKeywordLen) {
        best = auto;
        bestKeywordLen = matched.word.length;
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
  if (!token || !recipientId || !text.trim()) return;
  if (!pageId && !instagramId) {
    console.error("[Webhook] sendDm skipped — no pageId or instagramId");
    return;
  }

  const baseUrl = pageId
    ? `https://graph.facebook.com/v21.0/${pageId}/messages`
    : `https://graph.instagram.com/v21.0/${instagramId}/messages`;

  await axios
    .post(baseUrl, { recipient: { id: recipientId }, message: { text } }, { params: { access_token: token } })
    .catch((e) => console.error("[Webhook] DM send error:", e.response?.data || e.message));
}

async function sendCommentReply(token: string, commentId: string, text: string) {
  if (!token || !commentId || !text.trim()) return;

  const baseUrl = `https://graph.instagram.com/v21.0/${commentId}/replies`;

  await axios
    .post(baseUrl, { message: text }, { params: { access_token: token } })
    .catch((e) => console.error("[Webhook] Comment reply error:", e.response?.data || e.message));
}

async function logAssistant(conversationId: string, content: string) {
  try {
    await prisma.message.create({
      data: { conversationId, role: "ASSISTANT", content },
    });
  } catch (e) {
    console.error("[Webhook] Failed to log assistant message:", e);
  }
}
