import { getUserProfile } from '@/actions/user';
import SettingsClient from '@/components/global/settings-client';

export default async function SettingsPage() {
    const user = await getUserProfile();
    return <SettingsClient user={user} />;
}