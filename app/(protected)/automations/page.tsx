import { onAuthenticatedUser } from '@/actions/user';
import { getAutomations } from '@/actions/automations';
import { redirect } from 'next/navigation';
import AutomationsClient from '@/components/automations/AutomationsClient';
import { getSsoLoginUrl } from '@/lib/platform/sso';

export default async function AutomationsPage() {
    const user = await onAuthenticatedUser();
    if (!user || !user.id) redirect(getSsoLoginUrl('/automations'));
    const automations = await getAutomations();
    return <AutomationsClient automations={automations} />;
}
