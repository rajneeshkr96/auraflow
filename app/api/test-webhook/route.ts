import { NextResponse } from 'next/server'

export async function GET() {
    try {
        // Use a relative URL for internal fetch if possible, but Next.js server-side fetch needs absolute URL.
        // Default to localhost:3000 for dev. 
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

        // 1. Send Handshake Request
        const params = new URLSearchParams({
            'hub.mode': 'subscribe',
            'hub.verify_token': process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN!,
            'hub.challenge': '1234567890'
        })

        const response = await fetch(`${baseUrl}/api/webhooks/instagram?${params}`)
        const challenge = await response.text()

        if (response.status === 200 && challenge === '1234567890') {
            return NextResponse.json({
                success: true,
                message: 'Webhook handshake verified successfully'
            })
        } else {
            return NextResponse.json({
                success: false,
                message: 'Webhook handshake failed',
                status: response.status,
                response: challenge
            })
        }
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: 'Internal Error during test',
            error: error instanceof Error ? error.message : String(error)
        })
    }
}
