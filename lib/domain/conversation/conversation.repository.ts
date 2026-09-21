import { prisma } from "@/lib/db";
import { MessageRole } from "@prisma/client";

export class ConversationRepository {
  static async findOrCreate(userId: number, recipientId: string, integrationId?: string) {
    return prisma.conversation.upsert({
      where: { userId_recipientId: { userId, recipientId } },
      create: { userId, recipientId, integrationId },
      update: integrationId ? { integrationId } : {},
    });
  }

  static async logMessage(params: {
    conversationId: string;
    role: MessageRole;
    content: string;
    mid?: string | null;
    senderType?: string;
  }) {
    return prisma.message.create({
      data: {
        conversationId: params.conversationId,
        role: params.role,
        content: params.content,
        mid: params.mid ?? null,
        senderType: params.senderType ?? (params.role === "USER" ? "user" : "bot"),
      },
    });
  }

  static async findMessageByMid(conversationId: string, mid: string) {
    return prisma.message.findFirst({
      where: { conversationId, mid },
    });
  }

  static async findRecentDuplicate(conversationId: string, content: string, windowMinutes = 2) {
    const cutoff = new Date(Date.now() - windowMinutes * 60 * 1000);
    return prisma.message.findFirst({
      where: {
        conversationId,
        role: "USER",
        content,
        createdAt: { gte: cutoff },
      },
    });
  }

  static async getConversationsForUser(userId: number) {
    return prisma.conversation.findMany({
      where: { userId },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getConversationById(id: string, userId: number) {
    return prisma.conversation.findFirst({
      where: { id, userId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });
  }
}
