'use server'

import axios from 'axios'
import { cookies } from 'next/headers'

const AURA_API = process.env.NEXT_PUBLIC_AURA_API_URL || 'http://localhost:3005';

export const getInstagramPosts = async () => {
    try {
        const cookieStore = await cookies();
        const authCookie = cookieStore.get('Authentication');

        if (!authCookie) return { status: 401, data: [] };

        const response = await axios.get(`${AURA_API}/integrations/instagram/posts`, {
            headers: {
                Cookie: `Authentication=${authCookie.value}`
            }
        });

        return {
            status: 200,
            data: response.data.data
        };

    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error fetching Instagram posts:', error.response?.data || error.message);
        } else {
            console.error('Error fetching Instagram posts:', error);
        }
        return { status: 500, data: [] };
    }
}
