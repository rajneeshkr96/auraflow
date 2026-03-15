import { redirect } from 'next/navigation';

export default function SettingsPage() {
    const authUrl = process.env.NEXT_PUBLIC_APP_AUTH_URL || 'http://localhost:3003';
    redirect(`${authUrl}/profile`);
}