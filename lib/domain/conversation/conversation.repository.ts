import { prisma } from "@/lib/db";
import { MessageRole } from "@prisma/client";
import { InstagramService } from "../integration/instagram.service";

export class ConversationRepository {
  static async findOrCreate(userId: number, recipientId: string, integrationId?: string, token?: string) {
    let conv = await prisma.conversation.findUnique({
      where: { userId_recipientId: { userId, recipientId } },
    });

    if (conv) {
      // If conversation exists but profile details are missing or integrationId needs linking
      const needsIntegrationUpdate = integrationId && conv.integrationId !== integrationId;
      const needsProfileUpdate = (!conv.username || conv.username.startsWith("@user_")) && token;

      if (needsIntegrationUpdate || needsProfileUpdate) {
        const updateData: any = {};
        if (needsIntegrationUpdate) updateData.integrationId = integrationId;
        if (needsProfileUpdate && token) {
          const profile = await InstagramService.fetchUserProfile(recipientId, token);
          if (profile.username) updateData.username = profile.username;
          if (profile.fullName) updateData.fullName = profile.fullName;
          if (profile.avatarUrl) updateData.avatarUrl = profile.avatarUrl;
        }

        if (Object.keys(updateData).length > 0) {
          conv = await prisma.conversation.update({
            where: { id: conv.id },
            data: updateData,
          });
        }
      }
      return conv;
    }

    // Try fetching profile from Instagram
    let username = `@user_${recipientId.slice(-4)}`;
    let fullName = "Instagram User";
    let avatarUrl: string | null = null;

    if (token) {
      const profile = await InstagramService.fetchUserProfile(recipientId, token);
      if (profile.username) username = profile.username;
      if (profile.fullName) fullName = profile.fullName;
      if (profile.avatarUrl) avatarUrl = profile.avatarUrl;
    }

    return prisma.conversation.create({
      data: {
        userId,
        recipientId,
        integrationId,
        username,
        fullName,
        avatarUrl,
        aiActive: true,
      },
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
