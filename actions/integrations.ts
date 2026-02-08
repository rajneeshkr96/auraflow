'use server'

import { client } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export const onDisconnectIntegration = async (id: string) => {
    try {
        await client.integration.delete({
            where: {
                id,
            },
        })
        revalidatePath('/integrations')
        return { status: 200, message: 'Disconnected successfully' }
    } catch (error) {
        console.error('Error disconnecting integration:', error)
        return { status: 500, message: 'Failed to disconnect' }
    }
}
