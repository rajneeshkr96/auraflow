import { NextResponse } from 'next/server'
import axios from 'axios'

const AURA_API = process.env.NEXT_PUBLIC_AURA_API_URL || 'http://localhost:3005';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  try {
    const response = await axios.get(`${AURA_API}/webhooks/instagram`, {
      params: Object.fromEntries(searchParams.entries())
    });
    return new NextResponse(String(response.data), { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.response?.data || 'Forbidden' }, { status: error?.response?.status || 403 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    // Forward to Core API
    axios.post(`${AURA_API}/webhooks/instagram`, body).catch(err => {
      console.error('Error forwarding webhook to Core API:', err.message);
    });

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
