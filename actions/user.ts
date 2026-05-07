'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { sdk } from '@codeswayam/api-client'

const AURA_API = process.env.NEXT_PUBLIC_AURA_API_URL || 'http://localhost:3005';
const CORE_API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function getAuthCookie() {
    const cookieStore = await cookies();
    return cookieStore.get('Authentication');
}

/** Helper to get an authorized SDK instance for server-side calls */
const getAuthorizedSDK = (token: string) => {
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Cookie': `Authentication=${token}`
        }
    };
};

/** Fetches comprehensive user context (profile, subscriptions, wallet, integrations) */
export const onAuthenticatedUser = async () => {
    const authCookie = await getAuthCookie();
    if (!authCookie) redirect('/sign-in');

    try {
        const authOptions = getAuthorizedSDK(authCookie.value);
        const fullProfile = await sdk.getFullProfile(authOptions);

        // Fetch integrations from Aura API (port 3005)
        const integrations = await getUserIntegrations();

        return {
            ...fullProfile.profile,
            subscriptions: fullProfile.subscriptions,
            wallet: fullProfile.wallet,
            integrations
        };
    } catch (error: any) {
        if (error.message === 'UNAUTHORIZED') {
            redirect('/sign-in');
        }
        console.error('onAuthenticatedUser Error:', error.message || error);
        return null;
    }
}

/** Fetches basic user profile from Core API */
export const getUserProfile = async () => {
    const authCookie = await getAuthCookie();
    if (!authCookie) return null;

    try {
        const authOptions = getAuthorizedSDK(authCookie.value);
        const profile = await sdk.auth.getProfile(authOptions);
        return profile?.data || profile;
    } catch (error: any) {
        if (error.message !== 'UNAUTHORIZED') {
            console.error('getUserProfile Error:', error.message || error);
        }
        return null;
    }
}

/** Update user profile via Core API */
export const updateUserProfile = async (data: { name?: string }) => {
    const authCookie = await getAuthCookie();
    if (!authCookie) return { success: false, error: 'Unauthorized' };

    try {
        const authOptions = getAuthorizedSDK(authCookie.value);
        const response = await sdk.request('/users/profile', {
            ...authOptions,
            method: 'PATCH',
            body: JSON.stringify(data)
        });
        return { success: true, data: response };
    } catch (error: any) {
        console.error('updateUserProfile Error:', error.message);
        return { success: false, error: error.message || 'Failed to update profile' };
    }
}

/** Fetches user integrations from Aura API */
export const getUserIntegrations = async () => {
    const authCookie = await getAuthCookie();
    if (!authCookie) return [];

    try {
        const response = await fetch(`${AURA_API}/integrations`, {
            headers: {
                'Authorization': `Bearer ${authCookie.value}`,
                'Cookie': `Authentication=${authCookie.value}`
            },
            credentials: 'include',
            cache: 'no-store'
        });

        if (!response.ok) {
            console.error(`Fetch integrations failed: ${response.status} ${response.statusText}`);
            return [];
        }
        const data = await response.json();
        return data || [];
    } catch (error: any) {
        console.error('Error fetching integrations from', AURA_API, ':', error?.message);
        return [];
    }
}
