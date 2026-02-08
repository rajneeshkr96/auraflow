'use server'

import { client } from '@/lib/db'
import { currentUser } from '@clerk/nextjs/server'
import axios from 'axios'

export const getInstagramPosts = async () => {
    try {
        const user = await currentUser()
        if (!user) return { status: 401, data: [] }

        const dbUser = await client.user.findUnique({
            where: { clerkId: user.id },
            include: { integrations: true }
        })

        const token = dbUser?.integrations.find(i => i.name === 'INSTAGRAM')?.token
        const instagramId = dbUser?.integrations.find(i => i.name === 'INSTAGRAM')?.instagramId

        if (!token || !instagramId) {
            console.log('Missing credentials:', { token: !!token, instagramId })
            return { status: 404, data: [] }
        }
        console.log('Token:', token)
        console.log('Instagram ID:', instagramId)

        console.log(`Fetching posts for ID: ${instagramId}`)

        const response = await axios.get(`https://graph.facebook.com/v21.0/${instagramId}/media`, {
            params: {
                fields: 'id,caption,media_url,media_type,timestamp,thumbnail_url,permalink',
                access_token: token,
                limit: 20
            }
        })
        console.log('Posts fetched successfully:', response.data.data.length)

        return {
            status: 200,
            data: response.data.data
        }

    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error fetching Instagram posts:', error.response?.data || error.message)
        } else {
            console.error('Error fetching Instagram posts:', error)
        }
        return { status: 500, data: [] }
    }
}
