import { NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import * as jwt from "jsonwebtoken";

async function getUserIdFromCookie(): Promise<number | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("Authentication")?.value;
  if (!token) return null;
  try {
    const decoded = jwt.decode(token) as { sub?: string } | null;
    if (!decoded?.sub) return null;
    const parsed = parseInt(decoded.sub);
    return isNaN(parsed) ? null : parsed;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  try {
    let userId: number | null = await getUserIdFromCookie();
    if (!userId && state) {
      const parsed = parseInt(state);
      if (!isNaN(parsed)) userId = parsed;
    }
    if (!userId) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/integrations?error=unauthorized`);
    }

    const useInstagramLogin = !!process.env.INSTAGRAM_APP_CLIENT_ID;
    const client_id = process.env.INSTAGRAM_APP_CLIENT_ID || process.env.INSTAGRAM_CLIENT_ID!;
    const client_secret = process.env.INSTAGRAM_APP_CLIENT_SECRET || process.env.INSTAGRAM_CLIENT_SECRET!;
    const redirect_uri = process.env.INSTAGRAM_REDIRECT_URI!;

    let accessToken: string;
    let instagramId: string | null = null;
    let pageId: string | null = null;
    let pageAccessToken: string | null = null;

    if (useInstagramLogin) {
      // ── Instagram Login flow ─────────────────────────────────────────
      // Step 1: Exchange code for short-lived token
      const tokenRes = await axios.post(
        "https://api.instagram.com/oauth/access_token",
        new URLSearchParams({ client_id, client_secret, grant_type: "authorization_code", redirect_uri, code }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );
      const shortToken: string = tokenRes.data.access_token;

      // IMPORTANT: tokenRes.data.user_id is an App-Scoped User ID and does NOT match
      // the Instagram Business Account ID that the webhook sends in entry.id.
      // We must call /me to get the canonical Instagram Business Account ID.
      const meRes = await axios.get("https://graph.instagram.com/me", {
        params: { fields: "id,username", access_token: shortToken },
      });
      instagramId = String(meRes.data.id);
      console.log("[OAuth] Instagram /me → id:", instagramId, "username:", meRes.data.username);

      // Step 2: Exchange for long-lived token
      const longRes = await axios.get("https://graph.instagram.com/access_token", {
        params: { grant_type: "ig_exchange_token", client_secret, access_token: shortToken },
      });
      accessToken = longRes.data.access_token;
    } else {
      // ── Facebook Login flow ──────────────────────────────────────────
      const tokenResponse = await axios.get("https://graph.facebook.com/v21.0/oauth/access_token", {
        params: { client_id, redirect_uri, client_secret, code },
      });
      accessToken = tokenResponse.data.access_token;

      // Get connected Instagram Business Account via Pages
      const pagesResponse = await axios.get("https://graph.facebook.com/v21.0/me/accounts", {
        params: { fields: "id,name,instagram_business_account,access_token", access_token: accessToken },
      });
      const pages: any[] = pagesResponse.data.data ?? [];

      const pageWithIg = pages.find((p) => p.instagram_business_account);
      if (pageWithIg) {
        instagramId = pageWithIg.instagram_business_account.id;
        pageAccessToken = pageWithIg.access_token;
        pageId = pageWithIg.id;
      } else {
        for (const page of pages) {
          try {
            const detail = await axios.get(`https://graph.facebook.com/v21.0/${page.id}`, {
              params: { fields: "instagram_business_account", access_token: page.access_token },
            });
            if (detail.data.instagram_business_account) {
              instagramId = detail.data.instagram_business_account.id;
              pageAccessToken = page.access_token;
              pageId = page.id;
              break;
            }
          } catch {}
        }
      }

      // Subscribe page to webhooks
      if (pageId && pageAccessToken) {
        await axios
          .post(`https://graph.facebook.com/v21.0/${pageId}/subscribed_apps`, null, {
            params: {
              subscribed_fields: "messages,messaging_postbacks,messaging_optins,message_deliveries,message_reads",
              access_token: pageAccessToken,
            },
          })
          .catch((e) => console.error("[OAuth] Webhook subscription failed:", e.response?.data || e.message));
      }
    }

    if (!instagramId) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/integrations?error=no_instagram_account`);
    }

    // Save integration
    await prisma.integration.deleteMany({ where: { userId, name: "INSTAGRAM" } });
    await prisma.integration.deleteMany({ where: { instagramId } });
    await prisma.integration.create({
      data: {
        userId,
        token: pageAccessToken || accessToken,
        instagramId,
        pageId,
        name: "INSTAGRAM",
      },
    });

    revalidatePath("/integrations");
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/integrations`);
  } catch (error: any) {
    console.error("[OAuth] Error:", error?.response?.data || error.message);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/integrations?error=oauth_failed`);
  }
}
