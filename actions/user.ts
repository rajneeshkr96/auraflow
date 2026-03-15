'use server'

import { redirect } from 'next/navigation'
import axios from 'axios'
import { cookies } from 'next/headers'

const AURA_API = process.env.NEXT_PUBLIC_AURA_API_URL || 'http://localhost:3005';
const CORE_API = process.env.NEXT_PUBLIC_CORE_API_URL || 'http://localhost:3000';

async function getAuthCookie() {
    const cookieStore = await cookies();
    return cookieStore.get('Authentication');
}

/** Fetches full user profile (with integrations & subscription) from Aura API */
export const onAuthenticatedUser = async () => {
    const authCookie = await getAuthCookie();
    if (!authCookie) redirect('/sign-in');

    try {
        const response = await fetch(`${CORE_API}/users/profile`, {
            headers: {
                'Authorization': `Bearer ${authCookie.value}`,
            },
            credentials: 'include',
            cache: 'no-store'
        });

        if (!response.ok) throw new Error(`API error: ${response.status}`);
        return await response.json();
    } catch (error: any) {
        console.error('Aura API User Fetch Error:', {
            status: error?.response?.status,
            statusText: error?.response?.statusText,
            data: error?.response?.data,
            message: error?.message,
            url: `${CORE_API}/users/profile`
        });
        return null;
    }
}

/** Fetches basic user profile (name, email, id) from Core API */
export const getUserProfile = async () => {
    const authCookie = await getAuthCookie();
    if (!authCookie) return null;

    try {
        const response = await axios.get(`${CORE_API}/users/profile`, {
            headers: {
                'Authorization': `Bearer ${authCookie.value}`,
            },
            withCredentials: true
        });
        return response.data ?? null;
    } catch (error: any) {
        console.error('Core API User Profile Error:', {
            status: error?.response?.status,
            statusText: error?.response?.statusText,
            data: error?.response?.data,
            message: error?.message,
            url: `${CORE_API}/users/profile`
        });
        return null;
    }
}

/** Update user profile via Core API */
export const updateUserProfile = async (data: { name?: string }) => {
    const authCookie = await getAuthCookie();
    if (!authCookie) return { success: false, error: 'Unauthorized' };

    try {
        const response = await axios.patch(`${CORE_API}/users/profile`, data, {
            headers: {
                'Authorization': `Bearer ${authCookie.value}`,
            },
            withCredentials: true
        });
        return { success: true, data: response.data };
    } catch (error: any) {
        console.error('Core API Update Profile Error:', error?.response?.data || error);
        return { success: false, error: error?.response?.data?.message || 'Failed to update profile' };
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

        if (!response.ok) return [];
        const data = await response.json();
        return data || [];
    } catch (error: any) {
        console.error('Error fetching integrations:', error?.message);
        return [];
    }
}
