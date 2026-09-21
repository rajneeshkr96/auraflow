"use server";

import { revalidatePath } from "next/cache";
import { getAuthUserId } from "@/lib/platform/auth";
import { AutomationService } from "@/lib/domain/automation/automation.service";
import { getPlatformEntitlements } from "@/lib/platform/entitlements";
import { UpdateAutomationDto } from "@/lib/domain/automation/automation.repository";

export async function getAutomations() {
  const userId = await getAuthUserId();
  if (!userId) return [];
  try {
    return await AutomationService.getAutomations(userId);
  } catch (error: any) {
    console.error("getAutomations error:", error?.message || error);
    return [];
  }
}

export async function getAutomationStats() {
  const userId = await getAuthUserId();
  if (!userId) {
    return { totalAutomations: 0, activeAutomations: 0, totalTriggers: 0, totalReplies: 0 };
  }
  try {
    return await AutomationService.getStats(userId);
  } catch (error: any) {
    console.error("getAutomationStats error:", error?.message || error);
    return { totalAutomations: 0, activeAutomations: 0, totalTriggers: 0, totalReplies: 0 };
  }
}

export async function getAutomationById(id: string) {
  const userId = await getAuthUserId();
  if (!userId) return null;
  try {
    return await AutomationService.getAutomationById(id, userId);
  } catch (error: any) {
    console.error("getAutomationById error:", error?.message || error);
    return null;
  }
}

export async function createAutomation(name?: string, shouldRevalidate: boolean = true) {
  const userId = await getAuthUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  const result = await AutomationService.createAutomation({
    userId,
    name: name?.trim() || "Untitled",
  });

  if (result.success && shouldRevalidate) {
    try {
      revalidatePath("/automations");
    } catch {
      // Ignore if called during server component render
    }
  }

  return result;
}

export async function updateAutomation(id: string, data: UpdateAutomationDto) {
  const userId = await getAuthUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  const result = await AutomationService.updateAutomation(id, userId, data);

  if (result.success) {
    revalidatePath(`/automations/${id}`);
    revalidatePath("/automations");
  }

  return result;
}

export async function deleteAutomation(id: string) {
  const userId = await getAuthUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  const result = await AutomationService.deleteAutomation(id, userId);

  if (result.success) {
    revalidatePath("/automations");
  }

  return result;
}

export async function toggleAutomation(id: string, active: boolean) {
  const userId = await getAuthUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  const result = await AutomationService.toggleAutomation(id, userId, active);

  if (result.success) {
    revalidatePath("/automations");
  }

  return result;
}

export async function getAnalyticsData() {
  const userId = await getAuthUserId();
  if (!userId) return null;

  try {
    const { AnalyticsService } = await import("@/lib/analytics");
    const [stats, weeklyData, performance] = await Promise.all([
      AnalyticsService.getDashboardStats(userId),
      AnalyticsService.getWeeklyData(userId),
      AnalyticsService.getAutomationPerformance(userId),
    ]);

    return { stats, weeklyData, performance };
  } catch {
    return null;
  }
}

export async function getUsageStats() {
  const entitlements = await getPlatformEntitlements();
  return {
    automations: entitlements.usage["automations"]?.used ?? 0,
    dmsThisMonth: entitlements.usage["dms"]?.used ?? 0,
    commentsThisMonth: entitlements.usage["comments"]?.used ?? 0,
    triggersThisMonth: entitlements.usage["triggers"]?.used ?? 0,
    resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
  };
}
