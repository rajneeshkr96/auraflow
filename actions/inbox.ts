"use server";

import { prisma } from "@/lib/db";
import { getAuthUserId } from "@/lib/platform/auth";
import axios from "axios";
import { revalidatePath } from "next/cache";

import { InstagramService } from "@/lib/domain/integration/instagram.service";

async function sendInstagramDm(
  token: string,
  recipientId: string,
  text: string,
  pageId?: string | null,
  instagramId?: string | null
) {
  return InstagramService.sendDm({
    token,
    recipientId,
    text,
    pageId,
    instagramId,
  });
}



export const getConversations = async (integrationId?: string) => {
  const userId = await getAuthUserId();
  if (!userId) return [];

  try {
    const DEMO_OR_DUMMY_RECIPIENTS = ["sarah_k_psid", "alex_dev_psid", "emily_w_psid", "0", "1231231234"];

    let conversations = await prisma.conversation.findMany({
      where: {
        userId,
        ...(integrationId ? { integrationId } : {}),
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
        integration: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Automatically clean up dummy / empty conversations
    const dummyIdsToDelete: string[] = [];
    const validConversations = conversations.filter((c) => {
      const isDummyRecipient = DEMO_OR_DUMMY_RECIPIENTS.includes(c.recipientId);
      const isEmpty = c.messages.length === 0;
      const isDummyPlaceholder = c.fullName?.startsWith("Instagram User") && c.messages.length === 0;

      if (isDummyRecipient || isEmpty || isDummyPlaceholder) {
        dummyIdsToDelete.push(c.id);
        return false;
      }
      return true;
    });

    // Delete dummy/empty records from database in background
    if (dummyIdsToDelete.length > 0) {
      prisma.message.deleteMany({
        where: { conversationId: { in: dummyIdsToDelete } },
      }).then(() => {
        prisma.conversation.deleteMany({
          where: { id: { in: dummyIdsToDelete }, userId },
        }).catch(() => null);
      }).catch(() => null);
    }

    // Sort by last message time or conversation created time
    return validConversations.sort((a, b) => {
      const aTime = a.messages.length > 0 ? new Date(a.messages[a.messages.length - 1].createdAt).getTime() : new Date(a.createdAt).getTime();
      const bTime = b.messages.length > 0 ? new Date(b.messages[b.messages.length - 1].createdAt).getTime() : new Date(b.createdAt).getTime();
      return bTime - aTime;
    });
  } catch (error: any) {
    console.error("getConversations Error:", error.message || error);
    return [];
  }
};

export const deleteConversation = async (conversationId: string) => {
  const userId = await getAuthUserId();
  if (!userId) throw new Error("Unauthorized");

  try {
    await prisma.message.deleteMany({
      where: { conversationId },
    });
    await prisma.conversation.delete({
      where: { id: conversationId, userId },
    });

    revalidatePath("/inbox");
    return { success: true };
  } catch (error: any) {
    console.error("deleteConversation Error:", error.message);
    return { success: false, error: error.message };
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
    const integration = conversation.integration || await prisma.integration.findFirst({
      where: { userId, name: "INSTAGRAM" },
    });

    if (integration) {
      await sendInstagramDm(
        integration.token,
        conversation.recipientId,
        text,
        integration.pageId,
        integration.instagramId
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
