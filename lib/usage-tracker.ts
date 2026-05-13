import { prisma } from './db';
import { getSubscriptionLimits, type SubscriptionTier } from './subscription-limits';

export class UsageTracker {
  static async getUsage(userId: number) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    let usage = await prisma.subscriptionUsage.findUnique({
      where: { userId }
    });

    // Create or reset usage if needed
    if (!usage || usage.resetDate < startOfMonth) {
      usage = await prisma.subscriptionUsage.upsert({
        where: { userId },
        create: {
          userId,
          resetDate: new Date(now.getFullYear(), now.getMonth() + 1, 1),
          automationsUsed: 0,
          dmsThisMonth: 0,
          commentsThisMonth: 0,
          triggersThisMonth: 0,
        },
        update: {
          resetDate: new Date(now.getFullYear(), now.getMonth() + 1, 1),
          dmsThisMonth: 0,
          commentsThisMonth: 0,
          triggersThisMonth: 0,
        }
      });
    }

    return usage;
  }

  static async checkLimit(userId: number, tier: SubscriptionTier, type: 'automations' | 'dms' | 'comments' | 'triggers'): Promise<{ allowed: boolean; current: number; limit: number }> {
    const limits = getSubscriptionLimits(tier);
    const usage = await this.getUsage(userId);
    
    let current: number;
    let limit: number;

    switch (type) {
      case 'automations':
        current = await prisma.automation.count({ where: { userId } });
        limit = limits.automations;
        break;
      case 'dms':
        current = usage.dmsThisMonth;
        limit = limits.dmsPerMonth;
        break;
      case 'comments':
        current = usage.commentsThisMonth;
        limit = limits.commentsPerMonth;
        break;
      case 'triggers':
        current = usage.triggersThisMonth;
        limit = limits.triggersPerMonth;
        break;
    }

    return {
      allowed: limit === -1 || current < limit,
      current,
      limit: limit === -1 ? Infinity : limit
    };
  }

  static async incrementUsage(userId: number, type: 'dms' | 'comments' | 'triggers', amount = 1) {
    const usage = await this.getUsage(userId);
    
    const updateData: any = {};
    switch (type) {
      case 'dms':
        updateData.dmsThisMonth = usage.dmsThisMonth + amount;
        break;
      case 'comments':
        updateData.commentsThisMonth = usage.commentsThisMonth + amount;
        break;
      case 'triggers':
        updateData.triggersThisMonth = usage.triggersThisMonth + amount;
        break;
    }

    await prisma.subscriptionUsage.update({
      where: { userId },
      data: updateData
    });

    // Track analytics event
    await prisma.analyticsEvent.create({
      data: {
        userId,
        eventType: type === 'dms' ? 'DM_SENT' : type === 'comments' ? 'COMMENT_REPLIED' : 'AUTOMATION_TRIGGERED',
        metadata: { amount }
      }
    });
  }

  static async getUsageStats(userId: number) {
    const usage = await this.getUsage(userId);
    const automationCount = await prisma.automation.count({ where: { userId } });
    
    return {
      automations: automationCount,
      dmsThisMonth: usage.dmsThisMonth,
      commentsThisMonth: usage.commentsThisMonth,
      triggersThisMonth: usage.triggersThisMonth,
      resetDate: usage.resetDate
    };
  }
}