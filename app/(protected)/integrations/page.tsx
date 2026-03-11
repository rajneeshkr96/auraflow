import { onAuthenticatedUser } from '@/actions/user';
import { redirect } from 'next/navigation';
import IntegrationsClient from '@/components/integrations/IntegrationsClient';

export default async function IntegrationsPage() {
  const dbUser = await onAuthenticatedUser();
  if (!dbUser) return redirect('/sign-in');

  const instagramIntegration = dbUser.integrations?.find((i: any) => i.name === 'INSTAGRAM');

  return (
    <IntegrationsClient
      instagramIntegration={instagramIntegration ?? null}
    />
  );
}