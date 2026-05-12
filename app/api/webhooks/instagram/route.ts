import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import axios from "axios";
import { getOrCreateNeuralAgent, chatWithAgent } from "@/lib/neural";

const VERIFY_TOKEN = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN || "auraflow_token";

// ── Tell Vercel to allow up to 30s for this function ─────────────────────────
// Required so processWebhook (DB + Instagram API calls) has time to complete
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
export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (body.object !== "instagram") {
      return NextResponse.json({ status: 404 }, { status: 404 });
    }

    await processWebhook(body).catch((err) =>
      console.error("[Webhook] Processing error:", err)
    );

    return NextResponse.json({ received: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ── Core Processing ───────────────────────────────────────────────────────────
async function processWebhook(body: any) {
  console.log("[Webhook] processWebhook start. object:", body.object, "entries:", body.entry?.length);
  for (const entry of body.entry ?? []) {
    const instagramAccountId: string = entry.id;
    console.log("[Webhook] entry.id:", instagramAccountId, "has messaging:", !!entry.messaging, "has changes:", !!entry.changes);

    if (entry.messaging) {
      for (const event of entry.messaging) {
        console.log("[Webhook] DM event:", JSON.stringify(event).slice(0, 200));
        await handleDm(instagramAccountId, event);
      }
    }

    if (entry.changes) {
      for (const change of entry.changes) {
        console.log("[Webhook] change.field:", change.field);
        if (change.field === "comments") {
          await handleComment(instagramAccountId, change.value);
        }
      }
    }
  }
  console.log("[Webhook] processWebhook done.");
}

// ── DM Handler ────────────────────────────────────────────────────────────────
async function handleDm(instagramAccountId: string, event: any) {
  const senderId: string = event.sender?.id;
  const messageText: string = event.message?.text;

  console.log("[DM] sender:", senderId, "| is_echo:", event.message?.is_echo, "| text:", messageText);

  if (event.message?.is_echo || !messageText || senderId === instagramAccountId) {
    console.log("[DM] Skipped — echo / no text / self");
    return;
  }

  const integration = await prisma.integration.findFirst({
    where: { instagramId: instagramAccountId },
  });
  if (!integration) {
    console.error("[DM] ❌ No integration found for instagramId:", instagramAccountId);
    return;
  }
  console.log("[DM] ✅ Integration found | userId:", integration.userId, "| instagramId:", integration.instagramId, "| pageId:", integration.pageId);

  const conversation = await prisma.conversation.upsert({
    where: { userId_recipientId: { userId: integration.userId, recipientId: senderId } },
    create: { userId: integration.userId, recipientId: senderId, integrationId: integration.id },
    update: {},
  });

  await prisma.message.create({
    data: { conversationId: conversation.id, role: "USER", content: messageText },
  });

  const automations = await prisma.automation.findMany({
    where: { userId: integration.userId, active: true },
    include: { triggers: true, keywords: true, listener: true },
  });
  console.log("[DM] Active automations:", automations.length);

  const automation = matchAutomation(automations, "DM", messageText);
  if (!automation?.listener) {
    console.log("[DM] ❌ No automation matched for:", messageText);
    return;
  }
  console.log("[DM] ✅ Matched:", automation.name, "| type:", automation.listener.listener);

  const { listener } = automation;

  if (listener.listener === "MESSAGE") {
    const reply = listener.dmReply || "Thanks!";
    console.log("[DM] Sending MESSAGE reply:", reply);
    await sendDm(integration.token, senderId, reply, integration.pageId, integration.instagramId);
    await logAssistant(conversation.id, reply);
    console.log("[DM] ✅ Done.");
  } else if (listener.listener === "SMART_AI") {
    console.log("[DM] Getting SMART_AI agent...");
    const agentId = await getOrCreateNeuralAgent(
      listener.id,
      integration.userId,
      listener.prompt || 'You are a helpful Instagram DM assistant.',
      automation.name,
      listener.neuralKbId ?? undefined
    );
    const sessionId = `auraflow-dm-${conversation.id}`;
    const aiReply = await chatWithAgent(agentId, messageText, sessionId);
    console.log("[DM] AI reply:", aiReply?.slice(0, 100));
    await sendDm(integration.token, senderId, aiReply, integration.pageId, integration.instagramId);
    await logAssistant(conversation.id, aiReply);
    console.log("[DM] ✅ Done.");
  }
}


// ── Comment Handler ───────────────────────────────────────────────────────────
async function handleComment(instagramAccountId: string, value: any) {
  const commenterId: string = value.from?.id;
  const commentText: string = value.text;
  const mediaId: string = value.media?.id;
  const commentId: string = value.id;

  // Guard: skip own comments and events with missing required fields
  if (!commenterId || !commentText || !commentId) return;
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
    replyText = await chatWithAgent(agentId, commentText, `auraflow-comment-${commentId}`);
  }

  if (replyText) {
    await sendCommentReply(integration.token, commentId, replyText);
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
  let bestKeywordLen = 0;   // prefer longer (more specific) keyword matches
  let fallback: any = null;

  for (const auto of automations) {
    if (!auto.triggers.some((t: any) => t.type === triggerType)) continue;

    // For COMMENT: skip automations scoped to other posts
    if (triggerType === "COMMENT" && auto.posts?.length > 0) {
      if (!auto.posts.some((p: any) => p.postid === mediaId)) continue;
    }

    if (auto.keywords.length > 0) {
      // Pick the longest keyword that matches — longer = more specific
      const matched = auto.keywords
        .filter((k: any) => text.toLowerCase().includes(k.word.toLowerCase()))
        .sort((a: any, b: any) => b.word.length - a.word.length)[0];

      if (matched && matched.word.length > bestKeywordLen) {
        best = auto;
        bestKeywordLen = matched.word.length;
      }
    } else {
      // Universal fallback — only used if no keyword match found at all
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
  // Guard: never send if required fields are missing or text is empty
  if (!token || !recipientId || !text.trim()) {
    console.warn("[Webhook] sendDm skipped — missing token, recipientId, or text");
    return;
  }

  // Instagram Business Login: use instagramId with graph.instagram.com
  // Facebook Login:           use pageId with graph.facebook.com
  if (!pageId && !instagramId) {
    console.error("[Webhook] sendDm skipped — neither pageId nor instagramId is available");
    return;
  }

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
  // Guard: never send if required fields are missing or text is empty
  if (!token || !commentId || !text.trim()) {
    console.warn("[Webhook] sendCommentReply skipped — missing token, commentId, or text");
    return;
  }

  // Both flows use same URL structure — token type determines which host works
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
  // Wrap in try/catch so a DB failure doesn't crash the handler after the reply
  // has already been sent successfully to Instagram
  try {
    await prisma.message.create({
      data: { conversationId, role: "ASSISTANT", content },
    });
  } catch (e) {
    console.error("[Webhook] Failed to log assistant message:", e);
  }
}

// ── NeuralHub AI ─────────────────────────────────────────────────────────────
// Handled by lib/neural.ts — getOrCreateNeuralAgent() + chatWithAgent()
