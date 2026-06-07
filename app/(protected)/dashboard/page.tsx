import { onAuthenticatedUser } from '@/actions/user';
import { getAutomations, getAutomationStats, getUsageStats } from '@/actions/automations';
import { redirect } from 'next/navigation';
import DashboardClient from '@/components/dashboard/DashboardClient';
import { getSubscriptionLimits } from '@/lib/subscription-limits';

export default async function DashboardPage() {
  const user = await onAuthenticatedUser();
  if (!user || !user.id) redirect('/sign-in');

  const [automations, stats, usageStats] = await Promise.all([
    getAutomations(),
    getAutomationStats(),
    getUsageStats().catch(() => null),
  ]);

  // Resolve subscription tier
  const sub = (user as any).subscriptions?.[0];
  const tierKey = (sub?.plan?.toLowerCase() || 'free') as 'free' | 'standard' | 'pro' | 'enterprise';
  const limits = getSubscriptionLimits(tierKey);

  return (
    <DashboardClient
      user={user}
      automations={automations}
      stats={stats}
      usageStats={usageStats}
      limits={limits}
      tier={tierKey}
    />
  );
}