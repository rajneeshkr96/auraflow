"use server";

import { getAuthUserId } from "@/lib/platform/auth";
import { checkQuota } from "@/lib/platform/entitlements";
import { AutomationRepository } from "@/lib/domain/automation/automation.repository";
import { trackPlatformUsage } from "@/lib/platform/metering";
import { TemplateService } from "@/lib/templates";
import { revalidatePath } from "next/cache";

export async function getTemplates(tier?: string, category?: string) {
  return TemplateService.getTemplates(tier, category);
}

export async function getTemplate(id: string) {
  return TemplateService.getTemplate(id);
}

export async function useTemplate(templateId: string) {
  const userId = await getAuthUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  // Check quota before creating automation from template
  const currentCount = await AutomationRepository.countByUserId(userId);
  const quota = await checkQuota("automations", currentCount);

  if (!quota.allowed) {
    return {
      success: false,
      error: `Automation limit reached (${currentCount}/${quota.limit}). Upgrade your plan to add more automations.`,
      needsUpgrade: true,
      currentCount,
      limit: quota.limit,
    };
  }

  try {
    const automation = await TemplateService.useTemplate(templateId, userId);
    trackPlatformUsage("automations", 1, userId, "async").catch(() => null);
    revalidatePath("/automations");
    return { success: true, data: automation };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to use template" };
  }
}

export async function getTemplateCategories() {
  return TemplateService.getCategories();
}

export async function seedTemplates() {
  if (process.env.NODE_ENV !== "development") {
    return { success: false, error: "Not allowed in production" };
  }

  await TemplateService.seedDefaultTemplates();
  return { success: true };
}