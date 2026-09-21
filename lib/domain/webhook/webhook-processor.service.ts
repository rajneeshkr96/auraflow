import { IntegrationRepository } from "../integration/integration.repository";
import { AutomationRepository } from "../automation/automation.repository";
import { ConversationRepository } from "../conversation/conversation.repository";
import { InstagramService } from "../integration/instagram.service";
import { WebhookDedupService } from "./webhook-dedup.service";
import { AutomationMatcher } from "./automation-matcher";
import { PlatformNeuralService } from "@/lib/platform/neural";
import { trackPlatformUsage } from "@/lib/platform/metering";
import { canAffordFeature, deductCredits } from "@/lib/platform/credits";

export class WebhookProcessorService {
  /**
   * Main entry point for processing incoming Instagram webhook payloads
   */
  static async processPayload(body: any): Promise<void> {
    if (body.object !== "instagram" || !Array.isArray(body.entry)) return;

    for (const entry of body.entry) {
      const accountId = entry.id;

      // 1. Process Direct Messages
      if (Array.isArray(entry.messaging)) {
        for (const event of entry.messaging) {
          await this.handleDm(accountId, event).catch((err) =>
            console.error("[WebhookProcessor] DM handling error:", err)
          );
        }
      }

      // 2. Process Comments
      if (Array.isArray(entry.changes)) {
        for (const change of entry.changes) {
          if (change.field === "comments" && change.value) {
            await this.handleComment(accountId, change.value).catch((err) =>
              console.error("[WebhookProcessor] Comment handling error:", err)
            );
          }
        }
      }
    }
  }

  /**
   * Handles an incoming DM event
   */
  private static async handleDm(instagramAccountId: string, event: any): Promise<void> {
    const senderId: string = event.sender?.id;
    const messageText: string = event.message?.text;
    const mid: string = event.message?.mid;
    const isEcho: boolean = !!event.message?.is_echo;

    // 1. Integration lookup
    const integration = await IntegrationRepository.findByAccountOrPageId(instagramAccountId);
    if (!integration) {
      console.warn("[WebhookProcessor] No integration found for:", instagramAccountId);
      return;
    }

    // 2. Conversation find-or-create
    const conversation = await ConversationRepository.findOrCreate(
      integration.userId,
      senderId,
      integration.id
    );

    // 3. Deduplication & Loop Guard
    const dedup = await WebhookDedupService.isDuplicateDm({
      conversationId: conversation.id,
      senderId,
      instagramAccountId,
      isEcho,
      mid,
      text: messageText,
    });

    if (dedup.isDuplicate) {
      return;
    }

    // 4. Log User message
    await ConversationRepository.logMessage({
      conversationId: conversation.id,
      role: "USER",
      content: messageText,
      mid,
    });

    // 5. Match Automation
    const automations = await AutomationRepository.findActiveByUserId(integration.userId);
    const matched = AutomationMatcher.match(automations as any, "DM", messageText);

    if (!matched?.listener) {
      return;
    }

    const { listener } = matched;

    // 6. Execute Listener Strategy
    if (listener.listener === "MESSAGE") {
      const reply = listener.dmReply || "Thanks for reaching out!";
      await InstagramService.sendDm({
        token: integration.token,
        recipientId: senderId,
        text: reply,
        pageId: integration.pageId,
        instagramId: integration.instagramId,
      });

      await ConversationRepository.logMessage({
        conversationId: conversation.id,
        role: "ASSISTANT",
        content: reply,
      });

      // Track DM usage to Core-API
      trackPlatformUsage("dms", 1, integration.userId, "async").catch(() => null);
    } else if (listener.listener === "SMART_AI") {
      // Check if user has sufficient credits if on credit-based plan
      const canProceed = await canAffordFeature(integration.userId, "ai_reply", 5);
      if (!canProceed) {
        console.warn("[WebhookProcessor] User has insufficient credits for AI reply:", integration.userId);
        return;
      }

      // Generate AI response via entity-bound Neural Chat
      const sessionId = `auraflow-dm-${conversation.id}`;
      const entityId = listener.neuralAgentId || listener.id;
      const aiReply = await PlatformNeuralService.chat(entityId, messageText, sessionId, {
        systemPrompt: listener.prompt || "You are a helpful Instagram DM assistant.",
        knowledgeBaseId: (listener as any).neuralKbId ?? undefined,
        userId: integration.userId,
        name: matched.name,
      });

      // Send reply
      await InstagramService.sendDm({
        token: integration.token,
        recipientId: senderId,
        text: aiReply,
        pageId: integration.pageId,
        instagramId: integration.instagramId,
      });

      // Record in conversation
      await ConversationRepository.logMessage({
        conversationId: conversation.id,
        role: "ASSISTANT",
        content: aiReply,
      });

      // Deduct credits and track usage to Core-API
      deductCredits(integration.userId, "ai_reply", "Auraflow AI DM Reply").catch(() => null);
      trackPlatformUsage("dms", 1, integration.userId, "async").catch(() => null);
      trackPlatformUsage("ai_responses", 1, integration.userId, "async").catch(() => null);
    }
  }

  /**
   * Handles an incoming Comment event
   */
  private static async handleComment(instagramAccountId: string, value: any): Promise<void> {
    const commenterId: string = value.from?.id;
    const commentText: string = value.text;
    const mediaId: string = value.media?.id;
    const commentId: string = value.id;

    if (!commenterId || !commentText?.trim() || !commentId) return;
    if (commenterId === instagramAccountId) return; // Own reply

    // 1. Deduplication guard
    const isDup = await WebhookDedupService.isDuplicateComment(commentId);
    if (isDup) return;

    // 2. Integration lookup
    const integration = await IntegrationRepository.findByAccountOrPageId(instagramAccountId);
    if (!integration) return;

    // 3. Match automation
    const automations = await AutomationRepository.findActiveByUserId(integration.userId);
    const matched = AutomationMatcher.match(automations as any, "COMMENT", commentText, mediaId);

    if (!matched?.listener) return;

    const { listener } = matched;
    let replyText = "";

    if (listener.listener === "MESSAGE") {
      replyText = listener.commentReply || "Thanks!";
    } else if (listener.listener === "SMART_AI") {
      const entityId = listener.neuralAgentId || listener.id;
      replyText = await PlatformNeuralService.chat(
        entityId,
        commentText,
        `auraflow-comment-${commentId}`,
        {
          systemPrompt: listener.prompt || "You are a helpful Instagram assistant replying to comments.",
          userId: integration.userId,
          name: matched.name,
        }
      );

      // Deduct credits & track usage
      deductCredits(integration.userId, "ai_reply", "Auraflow AI Comment Reply").catch(() => null);
      trackPlatformUsage("ai_responses", 1, integration.userId, "async").catch(() => null);
    }

    // 4. Send comment reply
    if (replyText) {
      await InstagramService.sendCommentReply(integration.token, commentId, replyText);
      trackPlatformUsage("comments", 1, integration.userId, "async").catch(() => null);
    }

    // 5. Send DM if configured
    if (listener.dmReply) {
      await InstagramService.sendDm({
        token: integration.token,
        recipientId: commenterId,
        text: listener.dmReply,
        pageId: integration.pageId,
        instagramId: integration.instagramId,
      });
      trackPlatformUsage("dms", 1, integration.userId, "async").catch(() => null);
    }
  }
}
