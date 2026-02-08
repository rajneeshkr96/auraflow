import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const client_id = process.env.INSTAGRAM_CLIENT_ID
  const redirect_uri = process.env.INSTAGRAM_REDIRECT_URI

  if (!client_id || !redirect_uri) {
    return NextResponse.json({ error: 'Instagram config missing' }, { status: 500 })
  }

  // Construct the Instagram OAuth URL
  // Scopes: instagram_basic, instagram_manage_messages, instagram_manage_comments, pages_show_list, pages_manage_metadata (via Facebook Login for Business usually)
  // PRD says "Instagram Graph API". Usually requires Facebook Login.
  // We'll use common scopes for automation.

  const scopes = [
    'instagram_basic',
    'instagram_manage_comments',
    'instagram_manage_messages',
    'pages_show_list',
    'pages_read_engagement',
    'pages_manage_metadata',
    'pages_read_user_content'
  ].join(',')

  const url = `https://www.facebook.com/v17.0/dialog/oauth?client_id=${client_id}&redirect_uri=${redirect_uri}&scope=${scopes}&state=${userId}&response_type=code`

  return NextResponse.redirect(url)
}
