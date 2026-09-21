import { AutomationRepository, CreateAutomationDto, UpdateAutomationDto } from "./automation.repository";
import { checkQuota } from "@/lib/platform/entitlements";
import { trackPlatformUsage } from "@/lib/platform/metering";
import { PlatformNeuralService } from "@/lib/platform/neural";

export class AutomationService {
  static async getAutomations(userId: number) {
    return AutomationRepository.findByUserId(userId);
  }

  static async getAutomationById(id: string, userId: number) {
    return AutomationRepository.findById(id, userId);
  }

  static async getStats(userId: number) {
    const [total, active] = await Promise.all([
      AutomationRepository.countByUserId(userId),
      AutomationRepository.countActiveByUserId(userId),
    ]);

    return {
      totalAutomations: total,
      activeAutomations: active,
      totalTriggers: 0,
      totalReplies: 0,
    };
  }

  static async createAutomation(dto: CreateAutomationDto) {
    // 1. Check user quota against Core-API entitlements
    const currentCount = await AutomationRepository.countByUserId(dto.userId);
    const quota = await checkQuota("automations", currentCount);

    if (!quota.allowed) {
      return {
        success: false,
        error: `Automation limit reached (${currentCount}/${quota.limit}). Upgrade your plan to create more automations.`,
        needsUpgrade: true,
        currentCount,
        limit: quota.limit,
      };
    }

    // 2. Persist in Auraflow MongoDB
    const automation = await AutomationRepository.create(dto);

    // 3. Track usage to Core-API counters asynchronously
    trackPlatformUsage("automations", 1, dto.userId, "async").catch(() => null);

    return { success: true, data: automation };
  }

  static async updateAutomation(id: string, userId: number, dto: UpdateAutomationDto) {
    const existing = await AutomationRepository.findById(id, userId);
    if (!existing) return { success: false, error: "Automation not found" };

    // Universal DM guard: only one active universal DM automation allowed per user
    if (dto.triggerTypes?.includes("DM") && (!dto.keywords || dto.keywords.length === 0) && dto.active !== false) {
      const universalDm = await AutomationRepository.findUniversalDm(userId, id);
      if (universalDm) {
        return { success: false, error: "Only one Universal DM automation is allowed at a time." };
      }
    }

    // Update in database
    await AutomationRepository.update(id, userId, dto);

    // If SMART_AI listener and prompt is set, ensure Neural agent is provisioned or updated
    if (dto.listenerType === "SMART_AI" && dto.prompt) {
      try {
        if (existing.listener?.neuralAgentId) {
          // Update prompt in-place
          await PlatformNeuralService.updatePrompt(existing.listener.neuralAgentId, dto.prompt);
        } else {
          // Provision dedicated agent
          const agentId = await PlatformNeuralService.createAgent({
            name: dto.name || existing.name,
            systemPrompt: dto.prompt,
            userId,
          });
          await AutomationRepository.updateListenerAgentId(id, agentId);
        }
      } catch (err: any) {
        console.error("[AutomationService] Neural agent sync error:", err.message);
      }
    }

    return { success: true };
  }

  static async deleteAutomation(id: string, userId: number) {
    const existing = await AutomationRepository.findById(id, userId);
    if (!existing) return { success: false, error: "Automation not found" };

    // Clean up associated Neural Agent if present
    if (existing.listener?.neuralAgentId) {
      PlatformNeuralService.deleteAgent(existing.listener.neuralAgentId).catch(() => null);
    }

    await AutomationRepository.delete(id, userId);

    return { success: true };
  }

  static async toggleAutomation(id: string, userId: number, active: boolean) {
    return this.updateAutomation(id, userId, { active });
  }
}
