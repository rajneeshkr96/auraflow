"use server";

import { prisma } from "@/lib/db";
import { getAuthUserId } from "@/lib/auth";
import axios from "axios";
import { revalidatePath } from "next/cache";

async function sendInstagramDm(
  token: string,
  recipientId: string,
  text: string,
  pageId?: string | null,
  instagramId?: string | null
) {
  if (!token || !recipientId || !text.trim()) return;
  if (!pageId && !instagramId) {
    console.error("[sendInstagramDm] skipped — no pageId or instagramId");
    return;
  }

  const baseUrl = pageId
    ? `https://graph.facebook.com/v21.0/${pageId}/messages`
    : `https://graph.instagram.com/v21.0/${instagramId}/messages`;

  try {
    await axios.post(
      baseUrl,
      { recipient: { id: recipientId }, message: { text } },
      { params: { access_token: token } }
    );
    console.log("[sendInstagramDm] DM sent successfully to Meta API");
  } catch (e: any) {
    console.error("[sendInstagramDm] Meta DM send error:", e.response?.data || e.message);
  }
}

async function seedDemoConversations(userId: number) {
  const integration = await prisma.integration.findFirst({
    where: { userId },
  });

  const integrationId = integration?.id || null;

  const demoThreads = [
    {
      recipientId: "sarah_k_psid",
      username: "@sarah_k",
      fullName: "Sarah Jenkins",
      avatarUrl: null,
      aiActive: true,
      tags: ["Warm Lead", "Freebie", "Instagram"],
      notes: "Interested in the marketing automations guide. Reached out from the Instagram Reel about lead generation.",
      messages: [
        { role: "USER" as const, senderType: "user", content: "Hey, saw your reel on automation!" },
        { role: "ASSISTANT" as const, senderType: "bot", content: "Hi Sarah! Glad you liked it. We use AI to automate replies and drive 3x more conversions. Would you like to get our free templates checklist?" },
        { role: "USER" as const, senderType: "user", content: "Yes please, that would be awesome!" },
        { role: "ASSISTANT" as const, senderType: "bot", content: "Awesome! Please comment #freebie on our latest post, or just ask here and I can fetch the link for you." },
        { role: "USER" as const, senderType: "user", content: "Hey! Can I get the link to the templates?" },
      ],
    },
    {
      recipientId: "alex_dev_psid",
      username: "@alex_dev",
      fullName: "Alex Rivera",
      avatarUrl: null,
      aiActive: true,
      tags: ["SaaS User", "Tech Support"],
      notes: "Developer looking to integrate Auraflow webhooks with their custom CRM. Active subscriber since May 2026.",
      messages: [
        { role: "USER" as const, senderType: "user", content: "Are webhooks supported on the Pro plan?" },
        { role: "ASSISTANT" as const, senderType: "bot", content: "Yes, Alex! Our Pro plan supports full outbound webhooks for events like \"automation_triggered\" and \"message_sent\". You can configure them in Settings -> Developer." },
        { role: "USER" as const, senderType: "user", content: "Can I send payload parameters?" },
        { role: "ASSISTANT" as const, senderType: "bot", content: "Absolutely! The webhooks payload includes trigger details, commenter info, message content, and custom metadata variables from your flow." },
        { role: "USER" as const, senderType: "user", content: "Thanks, the setup worked perfectly!" },
      ],
    },
    {
      recipientId: "emily_w_psid",
      username: "@emily_w",
      fullName: "Emily Wong",
      avatarUrl: null,
      aiActive: false,
      tags: ["Hot Lead", "Pricing", "Priority"],
      notes: "Enterprise prospect. Wants to buy 5 licenses for her social media team. Taking over manually to ensure smooth closing.",
      messages: [
        { role: "USER" as const, senderType: "user", content: "Hello, do you offer agency discounts?" },
        { role: "ASSISTANT" as const, senderType: "bot", content: "Hi Emily! Yes, we have custom agency pricing starting at 5 accounts. I am handing you over to our customer success manager who will assist you shortly." },
        { role: "ASSISTANT" as const, senderType: "agent", content: "Hi Emily, CSM here! I see you are looking for agency accounts. I can set you up with a 20% discount code for annual plans. Let me know if you would like to proceed!" },
        { role: "USER" as const, senderType: "user", content: "Is the discount code still active?" },
      ],
    },
  ];

  for (const thread of demoThreads) {
    const createdConv = await prisma.conversation.create({
      data: {
        userId,
        recipientId: thread.recipientId,
        username: thread.username,
        fullName: thread.fullName,
        avatarUrl: thread.avatarUrl,
        aiActive: thread.aiActive,
        tags: thread.tags,
        notes: thread.notes,
        integrationId,
      },
    });

    let minutesOffset = thread.messages.length;
    for (const msg of thread.messages) {
      await prisma.message.create({
        data: {
          conversationId: createdConv.id,
          role: msg.role,
          senderType: msg.senderType,
          content: msg.content,
          createdAt: new Date(Date.now() - minutesOffset * 60 * 1000),
        },
      });
      minutesOffset--;
    }
  }
}

export const getConversations = async () => {
  const userId = await getAuthUserId();
  if (!userId) return [];

  try {
    let conversations = await prisma.conversation.findMany({
      where: { userId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" }, // Sort by creation date
    });

    // If no conversations exist, seed demo conversations to show a working and beautiful inbox instantly
    if (conversations.length === 0) {
      await seedDemoConversations(userId);
      conversations = await prisma.conversation.findMany({
        where: { userId },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      });
    }

    // Sort by last message time or conversation created time
    return conversations.sort((a, b) => {
      const aTime = a.messages.length > 0 ? new Date(a.messages[a.messages.length - 1].createdAt).getTime() : new Date(a.createdAt).getTime();
      const bTime = b.messages.length > 0 ? new Date(b.messages[b.messages.length - 1].createdAt).getTime() : new Date(b.createdAt).getTime();
      return bTime - aTime;
    });
  } catch (error: any) {
    console.error("getConversations Error:", error.message || error);
    return [];
  }
};

export const toggleConversationAi = async (conversationId: string) => {
  const userId = await getAuthUserId();
  if (!userId) throw new Error("Unauthorized");

  try {
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, userId },
    });

    if (!conversation) throw new Error("Conversation not found");

    const updated = await prisma.conversation.update({
      where: { id: conversationId },
      data: { aiActive: !conversation.aiActive },
    });

    revalidatePath("/inbox");
    return { success: true, aiActive: updated.aiActive };
  } catch (error: any) {
    console.error("toggleConversationAi Error:", error.message);
    return { success: false, error: error.message };
  }
};

export const addConversationTag = async (conversationId: string, tag: string) => {
  const userId = await getAuthUserId();
  if (!userId) throw new Error("Unauthorized");

  try {
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, userId },
    });

    if (!conversation) throw new Error("Conversation not found");
    if (conversation.tags.includes(tag)) return { success: true };

    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        tags: [...conversation.tags, tag],
      },
    });

    revalidatePath("/inbox");
    return { success: true };
  } catch (error: any) {
    console.error("addConversationTag Error:", error.message);
    return { success: false, error: error.message };
  }
};

export const removeConversationTag = async (conversationId: string, tag: string) => {
  const userId = await getAuthUserId();
  if (!userId) throw new Error("Unauthorized");

  try {
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, userId },
    });

    if (!conversation) throw new Error("Conversation not found");

    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        tags: conversation.tags.filter((t) => t !== tag),
      },
    });

    revalidatePath("/inbox");
    return { success: true };
  } catch (error: any) {
    console.error("removeConversationTag Error:", error.message);
    return { success: false, error: error.message };
  }
};

export const updateConversationNotes = async (conversationId: string, notes: string) => {
  const userId = await getAuthUserId();
  if (!userId) throw new Error("Unauthorized");

  try {
    await prisma.conversation.update({
      where: { id: conversationId, userId },
      data: { notes },
    });

    revalidatePath("/inbox");
    return { success: true };
  } catch (error: any) {
    console.error("updateConversationNotes Error:", error.message);
    return { success: false, error: error.message };
  }
};

export const sendInboxMessage = async (conversationId: string, text: string) => {
  const userId = await getAuthUserId();
  if (!userId) throw new Error("Unauthorized");

  try {
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, userId },
      include: { integration: true },
    });

    if (!conversation) throw new Error("Conversation not found");

    // Send via Meta API if integration is configured
    if (conversation.integration) {
      await sendInstagramDm(
        conversation.integration.token,
        conversation.recipientId,
        text,
        conversation.integration.pageId,
        conversation.integration.instagramId
      );
    }

    // Save message locally
    const message = await prisma.message.create({
      data: {
        conversationId,
        role: "ASSISTANT",
        senderType: "agent",
        content: text,
      },
    });

    revalidatePath("/inbox");
    return { success: true, message };
  } catch (error: any) {
    console.error("sendInboxMessage Error:", error.message);
    return { success: false, error: error.message };
  }
};
