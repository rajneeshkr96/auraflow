import { onAuthenticatedUser } from '@/actions/user';
import { getAutomations } from '@/actions/automations';
import { redirect } from 'next/navigation';
import AutomationsClient from '@/components/automations/AutomationsClient';

export default async function AutomationsPage() {
    const user = await onAuthenticatedUser();
    if (!user || !user.id) redirect('/sign-in');
    const automations = await getAutomations();
    return <AutomationsClient automations={automations} />;
}
