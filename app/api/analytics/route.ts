import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/auth';
import { AnalyticsService } from '@/lib/analytics';

export async function GET() {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [stats, weeklyData, performance] = await Promise.all([
      AnalyticsService.getDashboardStats(userId),
      AnalyticsService.getWeeklyData(userId),
      AnalyticsService.getAutomationPerformance(userId)
    ]);

    return NextResponse.json({
      stats,
      weeklyData,
      performance
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { eventType, automationId, metadata } = await request.json();
    
    await AnalyticsService.recordEvent(userId, eventType, automationId, metadata);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics record error:', error);
    return NextResponse.json({ error: 'Failed to record event' }, { status: 500 });
  }
}