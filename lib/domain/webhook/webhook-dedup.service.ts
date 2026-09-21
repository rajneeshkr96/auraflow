import { prisma } from "@/lib/db";
import { ConversationRepository } from "../conversation/conversation.repository";

export class WebhookDedupService {
  /**
   * Checks if an inbound DM is a duplicate or an echo
   */
  static async isDuplicateDm(params: {
    conversationId: string;
    senderId: string;
    instagramAccountId: string;
    isEcho?: boolean;
    mid?: string;
    text: string;
  }): Promise<{ isDuplicate: boolean; reason?: string }> {
    if (params.isEcho) {
      return { isDuplicate: true, reason: "echo" };
    }

    if (params.senderId === params.instagramAccountId) {
      return { isDuplicate: true, reason: "self_message" };
    }

    if (!params.text?.trim()) {
      return { isDuplicate: true, reason: "empty_text" };
    }

    if (params.mid) {
      const existing = await ConversationRepository.findMessageByMid(params.conversationId, params.mid);
      if (existing) {
        return { isDuplicate: true, reason: "duplicate_mid" };
      }
    }

    const recent = await ConversationRepository.findRecentDuplicate(params.conversationId, params.text, 2);
    if (recent) {
      return { isDuplicate: true, reason: "duplicate_content_window" };
    }

    return { isDuplicate: false };
  }

  /**
   * Checks and locks a comment ID to prevent multiple executions
   */
  static async isDuplicateComment(commentId: string): Promise<boolean> {
    const existing = await prisma.processedComment.findUnique({
      where: { commentId },
    }).catch(() => null);

    if (existing) return true;

    // Immediately record to prevent concurrent races
    await prisma.processedComment.create({
      data: { commentId },
    }).catch(() => null);

    return false;
  }
}
