import { onAuthenticatedUser } from '@/actions/user';
import { getAutomations, getAutomationStats, getUsageStats } from '@/actions/automations';
import { redirect } from 'next/navigation';
import DashboardClient from '@/components/dashboard/DashboardClient';
import { getSubscriptionLimits } from '@/lib/subscription-limits';
import { getSsoLoginUrl } from '@/lib/platform/sso';

export default async function DashboardPage() {
  const user = await onAuthenticatedUser();
  if (!user || !user.id) redirect(getSsoLoginUrl('/dashboard'));

  const [automations, stats, usageStats] = await Promise.all([
    getAutomations(),
    getAutomationStats(),
    getUsageStats().catch(() => null),
  ]);

  // Resolve active Auraflow subscription and tier
  const activeSub = (user as any).subscriptions?.find((s: any) => {
    if (s.status !== 'active') return false;
    if (s.expiresAt && new Date(s.expiresAt).getTime() < Date.now()) return false;
    return s.productSaasId?.includes('auraflow') || s.productFamily === 'auraflow' || s.planType === 'BUNDLE';
  });

  const rawTier = (activeSub?.productName?.toLowerCase().includes('pro') ? 'pro' :
                  activeSub?.productName?.toLowerCase().includes('standard') ? 'standard' :
                  activeSub?.plan?.toLowerCase()) || 'free';
  const tierKey = rawTier as 'free' | 'standard' | 'pro' | 'enterprise';
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