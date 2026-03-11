import { NextResponse } from 'next/server'
import axios from 'axios'
import { cookies } from 'next/headers'

export async function GET(req: Request) {
    // Need to handle the callback
    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state') // Should be userId

    if (!code || !state) {
        return NextResponse.json({ error: 'Missing code or state' }, { status: 400 })
    }

    try {
        const client_id = process.env.INSTAGRAM_CLIENT_ID
        const client_secret = process.env.INSTAGRAM_CLIENT_SECRET
        const redirect_uri = process.env.INSTAGRAM_REDIRECT_URI

        // Exchange code for token
        const tokenResponse = await axios.get(`https://graph.facebook.com/v21.0/oauth/access_token`, {
            params: {
                client_id,
                redirect_uri,
                client_secret,
                code
            }
        })

        const accessToken = tokenResponse.data.access_token

        // Check Permissions
        const permissionsResponse = await axios.get(`https://graph.facebook.com/v21.0/me/permissions`, {
            params: { access_token: accessToken }
        })
        console.log('Granted Permissions:', JSON.stringify(permissionsResponse.data.data, null, 2))

        // Get User Pages to find connected Instagram Account
        const pagesResponse = await axios.get(`https://graph.facebook.com/v21.0/me/accounts`, {
            params: {
                fields: 'id,name,instagram_business_account,access_token', // Added access_token
                access_token: accessToken
            }
        })

        const pages = pagesResponse.data.data
        console.log('Fetched Pages:', JSON.stringify(pages, null, 2))

        let instagramId = null;
        let pageAccessToken = null;
        let pageId = null;

        // Strategy 1: Check if field is present in the list
        const pageWithInstagram = pages.find((page: any) => page.instagram_business_account)
        if (pageWithInstagram) {
            instagramId = pageWithInstagram.instagram_business_account.id
            pageAccessToken = pageWithInstagram.access_token
            pageId = pageWithInstagram.id
            console.log('Strategy 1 Success: Found in list.', instagramId)
        } else {
            // Strategy 2: If missing, try fetching specifically using Page Token
            // Sometimes permissions work better with the Page's own token
            console.log('Strategy 1 failed. Trying Strategy 2: Fetching per-page details...')

            for (const page of pages) {
                try {
                    const pageDetails = await axios.get(`https://graph.facebook.com/v21.0/${page.id}`, {
                        params: {
                            fields: 'instagram_business_account',
                            access_token: page.access_token // Use Page Token
                        }
                    })

                    if (pageDetails.data.instagram_business_account) {
                        instagramId = pageDetails.data.instagram_business_account.id
                        pageAccessToken = page.access_token
                        pageId = page.id
                        console.log(`Strategy 2 Success: Found IG ID ${instagramId} on page ${page.name} using Page Token`)
                        break
                    }
                } catch (e) {
                    // console.log(`Failed to fetch details for page ${page.name}`)
                }
            }
        }

        if (!instagramId) {
            console.log('No page has instagram_business_account field (checked both strategies).')
            return NextResponse.json({ error: 'No Instagram Business Account found' }, { status: 404 })
        }

        console.log('Final Instagram Business ID:', instagramId)

        // SUBSCRIBE TO WEBHOOKS FOR THIS PAGE using Page Access Token
        if (pageId && pageAccessToken) {
            console.log(`Subscribing Page ${pageId} to Webhooks...`)
            try {
                const subscribeResponse = await axios.post(`https://graph.facebook.com/v21.0/${pageId}/subscribed_apps`, null, {
                    params: {
                        subscribed_fields: 'messages,messaging_postbacks,messaging_optins,message_deliveries,message_reads',
                        access_token: pageAccessToken
                    }
                })
                console.log('Page Subscription Result:', subscribeResponse.data)
            } catch (error: any) {
                console.error('Failed to subscribe page to webhooks:', error?.response?.data || error.message)
            }
        }

        // 1. Get Authentication Cookie from request
        const cookieStore = await cookies();
        const authCookie = cookieStore.get('Authentication');
        
        let headers: Record<string, string> = {};
        if (authCookie) {
            headers['Cookie'] = `Authentication=${authCookie.value}`;
        } else {
            // Also try fallback to the request cookie header if needed, but normally use explicit
            const cookieHeader = req.headers.get('cookie');
            if (cookieHeader) headers['Cookie'] = cookieHeader;
        }

        const AURA_API = process.env.NEXT_PUBLIC_AURA_API_URL || 'http://localhost:3005';

        // 2. Save Integration in Core API
        await axios.post(`${AURA_API}/integrations`, {
            token: pageAccessToken || accessToken,
            instagramId: instagramId,
            pageId: pageId,
            name: 'INSTAGRAM'
        }, { headers });

        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`)

    } catch (error: any) {
        console.error('OAuth Error', error?.response?.data || error.message)
        return NextResponse.json({ error: 'OAuth Failed' }, { status: 500 })
    }
}
