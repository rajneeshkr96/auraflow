import { redirect } from 'next/navigation';
import { getProfileUrl } from '@/lib/platform/sso';

export default function SettingsPage() {
    redirect(getProfileUrl());
}