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

      if (needsIntegrationUpdate) {
        prisma.conversation.update({
          where: { id: conv.id },
          data: { integrationId },
        }).catch(() => null);
      }

      if (needsProfileUpdate && token) {
        // Fetch profile asynchronously without blocking the reply
        InstagramService.fetchUserProfile(recipientId, token).then((profile) => {
          if (profile.username || profile.fullName || profile.avatarUrl) {
            prisma.conversation.update({
              where: { id: conv!.id },
              data: {
                ...(profile.username && { username: profile.username }),
                ...(profile.fullName && { fullName: profile.fullName }),
                ...(profile.avatarUrl && { avatarUrl: profile.avatarUrl }),
              },
            }).catch(() => null);
          }
        }).catch(() => null);
      }

      return conv;
    }

    // Create conversation instantly with default placeholder
    const username = `@user_${recipientId.slice(-4)}`;
    const fullName = "Instagram User";

    const created = await prisma.conversation.create({
      data: {
        userId,
        recipientId,
        integrationId,
        username,
        fullName,
        aiActive: true,
      },
    });

    // Populate real profile asynchronously in background
    if (token) {
      InstagramService.fetchUserProfile(recipientId, token).then((profile) => {
        if (profile.username || profile.fullName || profile.avatarUrl) {
          prisma.conversation.update({
            where: { id: created.id },
            data: {
              ...(profile.username && { username: profile.username }),
              ...(profile.fullName && { fullName: profile.fullName }),
              ...(profile.avatarUrl && { avatarUrl: profile.avatarUrl }),
            },
          }).catch(() => null);
        }
      }).catch(() => null);
    }

    return created;
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
