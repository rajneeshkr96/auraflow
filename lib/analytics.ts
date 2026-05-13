import { prisma } from './db';

export class AnalyticsService {
  static async getDashboardStats(userId: number) {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get current week stats
    const thisWeekEvents = await prisma.analyticsEvent.findMany({
      where: {
        userId,
        timestamp: { gte: weekAgo }
      }
    });

    // Get previous week for comparison
    const prevWeekStart = new Date(weekAgo.getTime() - 7 * 24 * 60 * 60 * 1000);
    const prevWeekEvents = await prisma.analyticsEvent.findMany({
      where: {
        userId,
        timestamp: { gte: prevWeekStart, lt: weekAgo }
      }
    });

    // Calculate metrics
    const thisWeekTriggers = thisWeekEvents.filter(e => e.eventType === 'AUTOMATION_TRIGGERED').length;
    const thisWeekDMs = thisWeekEvents.filter(e => e.eventType === 'DM_SENT').length;
    const thisWeekComments = thisWeekEvents.filter(e => e.eventType === 'COMMENT_REPLIED').length;
    const thisWeekConversions = thisWeekEvents.filter(e => e.eventType === 'CONVERSION').length;

    const prevWeekTriggers = prevWeekEvents.filter(e => e.eventType === 'AUTOMATION_TRIGGERED').length;
    const prevWeekDMs = prevWeekEvents.filter(e => e.eventType === 'DM_SENT').length;
    const prevWeekComments = prevWeekEvents.filter(e => e.eventType === 'COMMENT_REPLIED').length;
    const prevWeekConversions = prevWeekEvents.filter(e => e.eventType === 'CONVERSION').length;

    // Calculate percentage changes
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    return {
      triggers: {
        current: thisWeekTriggers,
        change: calculateChange(thisWeekTriggers, prevWeekTriggers)
      },
      dms: {
        current: thisWeekDMs,
        change: calculateChange(thisWeekDMs, prevWeekDMs)
      },
      comments: {
        current: thisWeekComments,
        change: calculateChange(thisWeekComments, prevWeekComments)
      },
      conversions: {
        current: thisWeekConversions,
        change: calculateChange(thisWeekConversions, prevWeekConversions)
      },
      responseRate: {
        current: thisWeekTriggers > 0 ? Math.round(((thisWeekDMs + thisWeekComments) / thisWeekTriggers) * 100) : 0,
        change: 0 // Calculate based on previous week if needed
      }
    };
  }

  static async getWeeklyData(userId: number) {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const dailyStats = await prisma.dailyStats.findMany({
      where: {
        userId,
        date: { gte: weekAgo }
      },
      orderBy: { date: 'asc' }
    });

    // Fill in missing days with zero values
    const weeklyData = [];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekAgo.getTime() + i * 24 * 60 * 60 * 1000);
      const dayStats = dailyStats.find(s => 
        s.date.toDateString() === date.toDateString()
      );

      weeklyData.push({
        day: days[date.getDay() === 0 ? 6 : date.getDay() - 1], // Adjust for Monday start
        triggers: dayStats?.triggers || 0,
        replies: (dayStats?.dmsSent || 0) + (dayStats?.commentsSent || 0),
        dms: dayStats?.dmsSent || 0,
        conversions: dayStats?.conversions || 0
      });
    }

    return weeklyData;
  }

  static async getAutomationPerformance(userId: number) {
    const automations = await prisma.automation.findMany({
      where: { userId, active: true },
      include: {
        _count: {
          select: {
            triggers: true,
            keywords: true
          }
        }
      }
    });

    const performance = await Promise.all(
      automations.map(async (automation) => {
        const events = await prisma.analyticsEvent.findMany({
          where: {
            userId,
            automationId: automation.id,
            timestamp: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          }
        });

        const triggers = events.filter(e => e.eventType === 'AUTOMATION_TRIGGERED').length;
        const responses = events.filter(e => 
          e.eventType === 'DM_SENT' || e.eventType === 'COMMENT_REPLIED'
        ).length;
        const conversions = events.filter(e => e.eventType === 'CONVERSION').length;

        return {
          id: automation.id,
          name: automation.name,
          triggers,
          responses,
          conversions,
          responseRate: triggers > 0 ? Math.round((responses / triggers) * 100) : 0,
          conversionRate: responses > 0 ? Math.round((conversions / responses) * 100) : 0
        };
      })
    );

    return performance.sort((a, b) => b.triggers - a.triggers);
  }

  static async recordEvent(userId: number, eventType: 'AUTOMATION_TRIGGERED' | 'DM_SENT' | 'COMMENT_REPLIED' | 'CONVERSION', automationId?: string, metadata?: any) {
    await prisma.analyticsEvent.create({
      data: {
        userId,
        eventType,
        automationId,
        metadata
      }
    });

    // Update daily stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const updateData: any = {};
    switch (eventType) {
      case 'AUTOMATION_TRIGGERED':
        updateData.triggers = { increment: 1 };
        break;
      case 'DM_SENT':
        updateData.dmsSent = { increment: 1 };
        break;
      case 'COMMENT_REPLIED':
        updateData.commentsSent = { increment: 1 };
        break;
      case 'CONVERSION':
        updateData.conversions = { increment: 1 };
        break;
    }

    await prisma.dailyStats.upsert({
      where: {
        userId_date: { userId, date: today }
      },
      create: {
        userId,
        date: today,
        ...Object.fromEntries(
          Object.entries(updateData).map(([key, value]) => [key, 1])
        )
      },
      update: updateData
    });
  }
}