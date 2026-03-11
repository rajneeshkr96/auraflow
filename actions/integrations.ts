'use server'

import { revalidatePath } from 'next/cache'
import axios from 'axios'
import { cookies } from 'next/headers'

const AURA_API = process.env.NEXT_PUBLIC_AURA_API_URL || 'http://localhost:3005';

export const onDisconnectIntegration = async (id: string) => {
    try {
        const cookieStore = await cookies();
        const authCookie = cookieStore.get('Authentication');

        if (!authCookie) return { status: 401, message: 'Unauthorized' };

        await axios.delete(`${AURA_API}/integrations/${id}`, {
            headers: {
                Cookie: `Authentication=${authCookie.value}`
            }
        });

        revalidatePath('/integrations')
        return { status: 200, message: 'Disconnected successfully' }
    } catch (error) {
        console.error('Error disconnecting integration:', error)
        return { status: 500, message: 'Failed to disconnect' }
    }
}
