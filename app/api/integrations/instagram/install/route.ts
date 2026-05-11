import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // INSTAGRAM_APP_CLIENT_ID = the Instagram App ID (from "API setup with Instagram login")
  // INSTAGRAM_CLIENT_ID     = the Facebook App ID (from "API setup with Facebook login")
  // Use whichever flow your Meta app is configured for.
  const client_id = process.env.INSTAGRAM_APP_CLIENT_ID || process.env.INSTAGRAM_CLIENT_ID
  const redirect_uri = process.env.INSTAGRAM_REDIRECT_URI

  if (!client_id || !redirect_uri) {
    return NextResponse.json({ error: 'Instagram config missing' }, { status: 500 })
  }

  // Detect which OAuth flow to use based on which client ID env var is set.
  // "API setup with Instagram login" → instagram.com/oauth/authorize
  // "API setup with Facebook login"  → facebook.com/dialog/oauth
  const useInstagramLogin = !!process.env.INSTAGRAM_APP_CLIENT_ID

  const scopes = useInstagramLogin
    ? [
        'instagram_business_basic',
        'instagram_business_manage_messages',
        'instagram_business_manage_comments',
        'instagram_business_content_publish',
      ].join(',')
    : [
        'instagram_basic',
        'instagram_manage_comments',
        'instagram_manage_messages',
        'pages_show_list',
        'pages_read_engagement',
        'pages_manage_metadata',
        'pages_read_user_content',
      ].join(',')

  const params = new URLSearchParams({
    client_id,
    redirect_uri,
    scope: scopes,
    state: String(userId),
    response_type: 'code',
  })

  const baseUrl = useInstagramLogin
    ? 'https://www.instagram.com/oauth/authorize'
    : 'https://www.facebook.com/v21.0/dialog/oauth'

  return NextResponse.redirect(`${baseUrl}?${params.toString()}`)
}
