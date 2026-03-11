'use server'

import { redirect } from 'next/navigation'
import axios from 'axios'
import { cookies } from 'next/headers'

const AURA_API = process.env.NEXT_PUBLIC_AURA_API_URL || 'http://localhost:3005';

export const onAuthenticatedUser = async () => {
    const cookieStore = await cookies()
    const authCookie = cookieStore.get('Authentication')

    if (!authCookie) redirect('/sign-in')

    try {
        const response = await axios.get(`${AURA_API}/user/profile`, {
            headers: {
                Cookie: `Authentication=${authCookie.value}`
            }
        });

        const userExist = response.data;
        if (userExist) return userExist;

        return null;
    } catch (error) {
        console.error('Core API User Fetch Error:', error);
        return null;
    }
}
