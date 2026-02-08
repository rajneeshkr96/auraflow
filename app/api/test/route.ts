import { NextResponse } from 'next/server'
import { client } from '@/lib/db'
import { currentUser } from '@clerk/nextjs/server'

export async function GET() {
    const user = await currentUser()

    if (!user) return NextResponse.json({ status: 404 })

    try {
        const userSubscribed = await client.user.findUnique({
            where: {
                clerkId: user.id
            },
            select: {
                subscription: {
                    select: {
                        plan: true,
                    }
                }
            }
        })

        if (userSubscribed) {
            return NextResponse.json({
                plan: userSubscribed.subscription?.plan,
            })
        }
        return NextResponse.json({ status: 404, message: 'User not found' })
    } catch (error) {
        return NextResponse.json({ status: 500, error: 'Internal Server Error' })
    }
}
