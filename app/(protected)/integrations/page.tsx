import { onAuthenticatedUser, getUserIntegrations } from '@/actions/user';
import { redirect } from 'next/navigation';
import IntegrationsClient from '@/components/integrations/IntegrationsClient';

export default async function IntegrationsPage() {
  const dbUser = await onAuthenticatedUser();
  if (!dbUser) return redirect('/sign-in');

  const integrations = await getUserIntegrations();

  const instagramIntegration = integrations?.find((i: any) => i.name === 'INSTAGRAM');

  return (
    <IntegrationsClient
      instagramIntegration={instagramIntegration ?? null}
    />
  );
}