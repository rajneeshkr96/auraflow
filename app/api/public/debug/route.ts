import { NextResponse } from 'next/server'
import { client } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const automations = await client.automation.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                trigger: true,
                listener: true,
                keywords: true,
                posts: true,
            }
        })
        return NextResponse.json(automations, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: 'Failed', details: JSON.stringify(error) }, { status: 500 })
    }
}
