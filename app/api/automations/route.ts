import { NextResponse, NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    // Logic here
    return NextResponse.json({ status: 200, message: 'Success' })
  } catch (error) {
    return NextResponse.json({ status: 500, message: 'Internal Server Error' })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    // Logic here
    return NextResponse.json({ status: 200, data: body })
  } catch (error) {
    return NextResponse.json({ status: 500, message: 'Internal Server Error' })
  }
}