import { onAuthenticatedUser, getUserIntegrations } from '@/actions/user';
import { getAutomations } from '@/actions/automations';
import { redirect } from 'next/navigation';
import { getAutomationStats } from '@/actions/automations';
import DashboardClient from '@/components/dashboard/DashboardClient';

export default async function DashboardPage() {
  const user = await onAuthenticatedUser();
  if (!user || !user.id) redirect('/sign-in');

  const [automations, stats, integrations] = await Promise.all([
    getAutomations(),
    getAutomationStats(),
    getUserIntegrations(),
  ]);

  return (
    <DashboardClient
      user={{ ...user, integrations }}
      automations={automations}
      stats={stats}
    />
  );
}