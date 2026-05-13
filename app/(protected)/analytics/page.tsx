import RealAnalytics from '@/components/analytics/RealAnalytics';

export default async function AnalyticsPage() {
  // Mock data for now to prevent runtime errors
  const mockAnalyticsData = {
    stats: {
      triggers: { current: 268, change: 14 },
      dms: { current: 110, change: 8 },
      comments: { current: 132, change: 12 },
      conversions: { current: 23, change: 5 },
      responseRate: { current: 90, change: 2 }
    },
    weeklyData: [
      { day: 'Mon', triggers: 24, replies: 20, dms: 8, conversions: 2 },
      { day: 'Tue', triggers: 38, replies: 35, dms: 14, conversions: 4 },
      { day: 'Wed', triggers: 18, replies: 16, dms: 6, conversions: 1 },
      { day: 'Thu', triggers: 52, replies: 48, dms: 22, conversions: 6 },
      { day: 'Fri', triggers: 64, replies: 58, dms: 30, conversions: 8 },
      { day: 'Sat', triggers: 42, replies: 38, dms: 18, conversions: 3 },
      { day: 'Sun', triggers: 30, replies: 27, dms: 12, conversions: 2 }
    ],
    performance: [
      { id: '1', name: 'Lead Magnet DM', triggers: 45, responses: 42, conversions: 8, responseRate: 93, conversionRate: 19 },
      { id: '2', name: 'Customer Support', triggers: 32, responses: 30, conversions: 5, responseRate: 94, conversionRate: 17 },
      { id: '3', name: 'Engagement Booster', triggers: 28, responses: 25, conversions: 3, responseRate: 89, conversionRate: 12 }
    ]
  };

  return <RealAnalytics data={mockAnalyticsData} />;
}
