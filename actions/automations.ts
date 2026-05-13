"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getAuthUserId } from "@/lib/auth";

async function getCurrentUserId() {
  return getAuthUserId();
}

export async function getAutomations() {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  return prisma.automation.findMany({
    where: { userId },
    include: { triggers: true, keywords: true, listener: true, posts: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAutomationStats() {
  const userId = await getCurrentUserId();
  if (!userId) return { totalAutomations: 0, activeAutomations: 0, totalTriggers: 0, totalReplies: 0 };

  // Use simple counts for now to avoid analytics dependency
  const [total, active, triggers] = await Promise.all([
    prisma.automation.count({ where: { userId } }),
    prisma.automation.count({ where: { userId, active: true } }),
    prisma.trigger.count({
      where: { automation: { userId } },
    }),
  ]);

  return { 
    totalAutomations: total, 
    activeAutomations: active, 
    totalTriggers: triggers,
    totalReplies: 0 // Will be updated when analytics is fully set up
  };
}

export async function getAutomationById(id: string) {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  return prisma.automation.findFirst({
    where: { id, userId },
    include: { triggers: true, keywords: true, listener: true, posts: true },
  });
}

export async function createAutomation(name?: string) {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  // Simple automation count check for now
  const currentCount = await prisma.automation.count({ where: { userId } });
  const freeLimit = 5; // Free tier limit
  
  if (currentCount >= freeLimit) {
    return { 
      success: false, 
      error: `Automation limit reached (${currentCount}/${freeLimit}). Upgrade to create more automations.`,
      needsUpgrade: true
    };
  }

  const automation = await prisma.automation.create({
    data: { userId, name: name?.trim() || "Untitled" },
  });

  return { success: true, data: automation };
}

export async function updateAutomation(
  id: string,
  data: {
    name?: string;
    active?: boolean;
    triggerTypes?: ("DM" | "COMMENT")[];
    keywords?: string[];
    listenerType?: "MESSAGE" | "SMART_AI";
    reply?: string;
    dmReply?: string;
    prompt?: string;
    posts?: { postid: string; caption?: string; media?: string; mediaType?: string }[];
  }
) {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  const existing = await prisma.automation.findFirst({ where: { id, userId } });
  if (!existing) return { success: false, error: "Not found" };

  // Universal DM guard
  if (data.triggerTypes?.includes("DM") && (!data.keywords || data.keywords.length === 0) && data.active !== false) {
    const universalDm = await prisma.automation.findFirst({
      where: {
        userId,
        active: true,
        id: { not: id },
        triggers: { some: { type: "DM" } },
        keywords: { none: {} },
      },
    });
    if (universalDm) return { success: false, error: "Only one Universal DM automation is allowed." };
  }

  await prisma.$transaction(async (tx) => {
    // 1. Update base
    await tx.automation.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.active !== undefined && { active: data.active }),
      },
    });

    // 2. Triggers
    if (data.triggerTypes) {
      await tx.trigger.deleteMany({ where: { automationId: id } });
      if (data.triggerTypes.length > 0) {
        await tx.trigger.createMany({
          data: data.triggerTypes.map((type) => ({ type, automationId: id })),
        });
      }
    }

    // 3. Keywords
    if (data.keywords !== undefined) {
      await tx.keyword.deleteMany({ where: { automationId: id } });
      if (data.keywords.length > 0) {
        await tx.keyword.createMany({
          data: data.keywords.map((word) => ({ word, automationId: id })),
        });
      }
    }

    // 4. Listener
    if (data.listenerType) {
      const isDm = data.triggerTypes?.includes("DM");
      const isComment = data.triggerTypes?.includes("COMMENT");
      const listenerData = {
        listener: data.listenerType,
        prompt: data.listenerType === "SMART_AI" ? (data.prompt ?? null) : null,
        dmReply: isDm ? (data.reply ?? null) : (data.dmReply ?? null),
        commentReply: isComment ? (data.reply ?? null) : null,
      };

      const upserted = await tx.listener.upsert({
        where: { automationId: id },
        create: { automationId: id, ...listenerData },
        update: listenerData,
      });

      // If prompt changed and agent already exists, refresh it in background
      if (
        data.listenerType === 'SMART_AI' &&
        data.prompt &&
        upserted.neuralAgentId
      ) {
        const { refreshNeuralAgent } = await import('@/lib/neural');
        refreshNeuralAgent(
          upserted.id,
          existing.userId,
          data.prompt,
          existing.name
        ).catch(console.error);
      }
    }

    // 5. Posts
    if (data.posts !== undefined) {
      await tx.post.deleteMany({ where: { automationId: id } });
      if (data.posts.length > 0) {
        await tx.post.createMany({
          data: data.posts.map((p) => ({ ...p, automationId: id })),
        });
      }
    }
  });

  revalidatePath(`/automations/${id}`);
  revalidatePath("/automations");
  return { success: true };
}

export async function deleteAutomation(id: string) {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  const existing = await prisma.automation.findFirst({
    where: { id, userId },
    include: { listener: true },
  });
  if (!existing) return { success: false, error: "Not found" };

  // Clean up the neural agent if one was provisioned for this automation
  if (existing.listener?.neuralAgentId) {
    const { deleteNeuralAgent } = await import('@/lib/neural');
    await deleteNeuralAgent(existing.listener.neuralAgentId);
  }

  await prisma.automation.delete({ where: { id } });
  revalidatePath("/automations");
  return { success: true };
}

export async function toggleAutomation(id: string, active: boolean) {
  return updateAutomation(id, { active });
}

// New analytics actions
export async function getAnalyticsData() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const { AnalyticsService } = await import('@/lib/analytics');
  const [stats, weeklyData, performance] = await Promise.all([
    AnalyticsService.getDashboardStats(userId),
    AnalyticsService.getWeeklyData(userId),
    AnalyticsService.getAutomationPerformance(userId)
  ]);

  return { stats, weeklyData, performance };
}

export async function getUsageStats() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const { UsageTracker } = await import('@/lib/usage-tracker');
  return UsageTracker.getUsageStats(userId);
}
