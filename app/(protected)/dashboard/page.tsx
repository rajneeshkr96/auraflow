import { onAuthenticatedUser } from '@/actions/user';
import { getAutomations } from '@/actions/automations';
import { redirect } from 'next/navigation';
import { getAutomationStats } from '@/actions/automations';
import DashboardClient from '@/components/dashboard/DashboardClient';

export default async function DashboardPage() {
  const user = await onAuthenticatedUser();
  if (!user || !user.id) redirect('/sign-in');

  const [automations, stats] = await Promise.all([
    getAutomations(),
    getAutomationStats(),
  ]);

  return (
    <DashboardClient
      user={user}
      automations={automations}
      stats={stats}
    />
  );
}