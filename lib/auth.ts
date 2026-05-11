import { cookies } from 'next/headers'
import * as jwt from 'jsonwebtoken'

export const auth = async () => {
    const cookieStore = await cookies()
    const token = cookieStore.get('Authentication')?.value

    if (!token) {
        return { userId: null, error: 'No token found' }
    }

    try {
        const decoded = jwt.decode(token) as { sub: string } | null

        if (!decoded || !decoded.sub) {
            return { userId: null, error: 'Invalid token payload' }
        }

        return { userId: decoded.sub, error: null }
    } catch (e: any) {
        return { userId: null, error: e.message }
    }
}

// Helper: returns userId as number or null
export const getAuthUserId = async (): Promise<number | null> => {
    const { userId } = await auth()
    if (!userId) return null
    const parsed = parseInt(String(userId))
    return isNaN(parsed) ? null : parsed
}
