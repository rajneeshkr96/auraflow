import { onAuthenticatedUser, getUserIntegrations } from '@/actions/user';
import { redirect } from 'next/navigation';
import IntegrationsClient from '@/components/integrations/IntegrationsClient';
import { getSsoLoginUrl } from '@/lib/platform/sso';

export default async function IntegrationsPage() {
  const dbUser = await onAuthenticatedUser();
  if (!dbUser) return redirect(getSsoLoginUrl('/integrations'));

  const integrations = await getUserIntegrations();

  return (
    <IntegrationsClient
      integrations={integrations || []}
    />
  );
}