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
    // ── 1. Get current user from JWT cookie ──────────────────────────
    let userId: number | null = await getUserIdFromCookie();

    // Fallback: state param carries userId (set during install redirect)
    if (!userId && state) {
      const parsed = parseInt(state);
      if (!isNaN(parsed)) userId = parsed;
    }

    if (!userId) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/integrations?error=unauthorized`);
    }

    // ── 2. Exchange code for access token ────────────────────────────
    const tokenResponse = await axios.get("https://graph.facebook.com/v21.0/oauth/access_token", {
      params: {
        client_id: process.env.INSTAGRAM_CLIENT_ID,
        redirect_uri: process.env.INSTAGRAM_REDIRECT_URI,
        client_secret: process.env.INSTAGRAM_CLIENT_SECRET,
        code,
      },
    });

    const accessToken: string = tokenResponse.data.access_token;

    // ── 3. Get connected Instagram Business Account ──────────────────
    const pagesResponse = await axios.get("https://graph.facebook.com/v21.0/me/accounts", {
      params: {
        fields: "id,name,instagram_business_account,access_token",
        access_token: accessToken,
      },
    });

    const pages: any[] = pagesResponse.data.data ?? [];
    let instagramId: string | null = null;
    let pageAccessToken: string | null = null;
    let pageId: string | null = null;

    // Strategy 1: direct field
    const pageWithIg = pages.find((p) => p.instagram_business_account);
    if (pageWithIg) {
      instagramId = pageWithIg.instagram_business_account.id;
      pageAccessToken = pageWithIg.access_token;
      pageId = pageWithIg.id;
    } else {
      // Strategy 2: per-page fetch
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

    if (!instagramId) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/integrations?error=no_instagram_account`
      );
    }

    // ── 4. Subscribe page to webhooks ────────────────────────────────
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

    // ── 5. Save integration to MongoDB via Prisma ────────────────────
    // Remove old integrations for this user
    await prisma.integration.deleteMany({ where: { userId, name: "INSTAGRAM" } });
    // Remove any integration with same instagramId (cross-user reconnect)
    if (instagramId) {
      await prisma.integration.deleteMany({ where: { instagramId } });
    }

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
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/integrations?error=oauth_failed`
    );
  }
}
