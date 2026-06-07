import { onAuthenticatedUser } from '@/actions/user';
import { getAnalyticsData } from '@/actions/automations';
import { redirect } from 'next/navigation';
import RealAnalytics from '@/components/analytics/RealAnalytics';

export default async function AnalyticsPage() {
  const user = await onAuthenticatedUser();
  if (!user) redirect('/sign-in');

  // Fetch real analytics data from DB — falls back to zeros gracefully if no events yet
  const analyticsData = await getAnalyticsData().catch(() => null);

  // Shape defaults so RealAnalytics never crashes
  const data = analyticsData ?? {
    stats: {
      triggers: { current: 0, change: 0 },
      dms: { current: 0, change: 0 },
      comments: { current: 0, change: 0 },
      conversions: { current: 0, change: 0 },
      responseRate: { current: 0, change: 0 },
    },
    weeklyData: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
      day, triggers: 0, replies: 0, dms: 0, conversions: 0,
    })),
    performance: [],
  };

  return <RealAnalytics data={data} />;
}
