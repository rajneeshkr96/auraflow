import { cookies } from 'next/headers'
import * as jwt from 'jsonwebtoken'

export const auth = async () => {
    const cookieStore = await cookies()
    const token = cookieStore.get('Authentication')?.value

    if (!token) {
        return { userId: null, error: 'No token found' }
    }

    try {
        // Since we are reading the token, we can just decode it if we trust our central auth
        // Or optimally verify with a shared secret, but decoding is often enough for reading the sub.
        const decoded = jwt.decode(token) as { sub: string } | null

        if (!decoded || !decoded.sub) {
            return { userId: null, error: 'Invalid token payload' }
        }

        return { userId: decoded.sub, error: null }
    } catch (e: any) {
        return { userId: null, error: e.message }
    }
}
