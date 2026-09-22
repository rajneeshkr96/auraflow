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
    if ((body.object !== "instagram" && body.object !== "page") || !Array.isArray(body.entry)) return;

    for (const entry of body.entry) {
      const accountId = entry.id;

      // 1. Process Direct Messages via entry.messaging (standard Messenger / Instagram API)
      if (Array.isArray(entry.messaging)) {
        console.log(`[WebhookProcessor] Processing ${entry.messaging.length} messaging event(s) for account ${accountId}`);
        for (const event of entry.messaging) {
          await this.handleDm(accountId, event).catch((err) =>
            console.error("[WebhookProcessor] DM handling error:", err)
          );
        }
      }

      // 2. Process Changes (Comments and DMs sent via changes)
      if (Array.isArray(entry.changes)) {
        console.log(`[WebhookProcessor] Processing ${entry.changes.length} change event(s) for account ${accountId}`);
        for (const change of entry.changes) {
          if (change.field === "comments" && change.value) {
            await this.handleComment(accountId, change.value).catch((err) =>
              console.error("[WebhookProcessor] Comment handling error:", err)
            );
          } else if ((change.field === "messages" || change.field === "messaging") && change.value) {
            console.log(`[WebhookProcessor] Processing DM event from changes.field "${change.field}" for account ${accountId}`);
            await this.handleDm(accountId, change.value).catch((err) =>
              console.error("[WebhookProcessor] DM (from changes) handling error:", err)
            );
          } else {
            console.log(`[WebhookProcessor] Unhandled change field: "${change.field}"`);
          }
        }
      }
    }
  }

  /**
   * Handles an incoming DM event with resilient dual-ID lookup and strategy execution
   */
  private static async handleDm(instagramAccountId: string, event: any): Promise<void> {
    const senderId: string = event.sender?.id || event.from?.id;
    const recipientId: string = event.recipient?.id || event.to?.id;
    const messageText: string = event.message?.text || (typeof event.message === "string" ? event.message : event.text);
    const mid: string = event.message?.mid || event.id;
    const isEcho: boolean = !!event.message?.is_echo || !!event.is_echo;

    if (!senderId) return;

    if (!messageText) {
      console.log("[WebhookProcessor] Inbound DM has no text (attachment, reaction, or receipt):", {
        senderId,
        recipientId,
        mid,
        isEcho,
      });
      return;
    }

    console.log(`[WebhookProcessor] Inbound DM received: "${messageText}" from ${senderId} to account ${instagramAccountId}`);

    // 1. Dual-ID Integration lookup: check entry.id, then recipient.id
    let integration = await IntegrationRepository.findByAccountOrPageId(instagramAccountId);
    if (!integration && recipientId) {
      integration = await IntegrationRepository.findByAccountOrPageId(recipientId);
    }

    if (!integration) {
      console.warn("[WebhookProcessor] No integration found for:", {
        instagramAccountId,
        recipientId,
      });
      return;
    }

    // 2. Conversation find-or-create with profile resolution
    const conversation = await ConversationRepository.findOrCreate(
      integration.userId,
      senderId,
      integration.id,
      integration.token
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
      console.log(`[WebhookProcessor] Dropped DM (dedup): reason=${dedup.reason}`, {
        senderId,
        mid,
        text: messageText,
      });
      return;
    }

    // 4. Log User message
    await ConversationRepository.logMessage({
      conversationId: conversation.id,
      role: "USER",
      content: messageText,
      mid,
      senderType: "user",
    });

    // 5. Match Automation via Strategy Engine
    const automations = await AutomationRepository.findActiveByUserId(integration.userId);
    const matched = AutomationMatcher.match(automations as any, "DM", messageText);

    if (!matched?.listener) {
      console.log("[WebhookProcessor] No automation matched for inbound DM:", {
        userId: integration.userId,
        messageText,
        activeCount: automations.length,
        automations: automations.map((a: any) => ({
          name: a.name,
          keywords: a.keywords?.map((k: any) => k.word),
        })),
      });
      return;
    }

    const { listener } = matched;
    console.log(`[WebhookProcessor] Matched automation "${matched.name}" (listener: ${listener.listener}) for message: "${messageText}"`);

    // 6. Execute Listener Strategy (Polymorphic Action Dispatcher)
    if (listener.listener === "MESSAGE") {
      const reply = listener.dmReply || listener.commentReply || "Thanks for reaching out!";
      const sent = await InstagramService.sendDm({
        token: integration.token,
        recipientId: senderId,
        text: reply,
        pageId: integration.pageId,
        instagramId: integration.instagramId,
      });

      if (sent) {
        console.log(`[WebhookProcessor] Successfully sent DM reply to ${senderId}: "${reply}"`);
        await ConversationRepository.logMessage({
          conversationId: conversation.id,
          role: "ASSISTANT",
          content: reply,
          senderType: "bot",
        });

        trackPlatformUsage("dms", 1, integration.userId, "async").catch(() => null);
      }
    } else if (listener.listener === "SMART_AI") {
      // Check credit / tier entitlement
      const canProceed = await canAffordFeature(integration.userId, "ai_reply", 5);
      if (!canProceed) {
        console.warn("[WebhookProcessor] Insufficient credits for AI reply:", integration.userId);
        return;
      }

      // Build persona-tailored prompt (Sales Closer, Customer Support, Influencer Companion)
      const { buildPersonaPrompt } = await import("@/lib/platform/neural");
      const systemPrompt = buildPersonaPrompt(
        listener.personaType || "DEFAULT",
        listener.prompt,
        { brandName: integration.username || "our brand" }
      );

      const sessionId = `auraflow-dm-${conversation.id}`;
      const entityId = listener.neuralAgentId || listener.id;
      const aiReply = await PlatformNeuralService.chat(entityId, messageText, sessionId, {
        systemPrompt,
        knowledgeBaseId: (listener as any).neuralKbId ?? undefined,
        userId: integration.userId,
        name: matched.name,
      });

      const sent = await InstagramService.sendDm({
        token: integration.token,
        recipientId: senderId,
        text: aiReply,
        pageId: integration.pageId,
        instagramId: integration.instagramId,
      });

      if (sent) {
        await ConversationRepository.logMessage({
          conversationId: conversation.id,
          role: "ASSISTANT",
          content: aiReply,
          senderType: "bot",
        });

        deductCredits(integration.userId, "ai_reply", "Auraflow AI DM Reply").catch(() => null);
        trackPlatformUsage("dms", 1, integration.userId, "async").catch(() => null);
        trackPlatformUsage("ai_responses", 1, integration.userId, "async").catch(() => null);
      }
    } else if (listener.listener === "PRODUCT_CHECKOUT") {
      // Future-ready social commerce checkout strategy
      const checkoutText = listener.paymentLink
        ? `${listener.dmReply || "Here is the direct checkout link to complete your order:"}\n\n👉 ${listener.paymentLink}`
        : listener.dmReply || "Check out our latest products in our bio!";

      const sent = await InstagramService.sendDm({
        token: integration.token,
        recipientId: senderId,
        text: checkoutText,
        pageId: integration.pageId,
        instagramId: integration.instagramId,
      });

      if (sent) {
        await ConversationRepository.logMessage({
          conversationId: conversation.id,
          role: "ASSISTANT",
          content: checkoutText,
          senderType: "bot",
        });

        trackPlatformUsage("dms", 1, integration.userId, "async").catch(() => null);
      }
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
    if (commenterId === instagramAccountId) return; // Own reply guard

    // 1. Deduplication guard
    const isDup = await WebhookDedupService.isDuplicateComment(commentId);
    if (isDup) return;

    // 2. Dual-ID Integration lookup
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
      const { buildPersonaPrompt } = await import("@/lib/platform/neural");
      const systemPrompt = buildPersonaPrompt(
        listener.personaType || "DEFAULT",
        listener.prompt || "You are a helpful Instagram assistant replying to comments.",
        { brandName: integration.username || "our brand" }
      );

      const entityId = listener.neuralAgentId || listener.id;
      replyText = await PlatformNeuralService.chat(
        entityId,
        commentText,
        `auraflow-comment-${commentId}`,
        {
          systemPrompt,
          userId: integration.userId,
          name: matched.name,
        }
      );

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
