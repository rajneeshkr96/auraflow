import * as jwt from "jsonwebtoken";
import { getRawAuthToken } from "./auth";

const CORE_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const JWT_SECRET = process.env.JWT_SECRET || "hgkjhkhjvb654gbhj";

/**
 * Creates an authorized header for Core-API calls.
 * Uses existing user token if present; otherwise mints a short-lived service token for background tasks.
 */
function getCoreApiToken(userId?: number): string {
  if (userId) {
    return jwt.sign(
      { sub: userId, email: `service-${userId}@auraflow.internal`, role: "admin" },
      JWT_SECRET,
      { expiresIn: "60s" }
    );
  }
  return "";
}

/**
 * Reports usage consumption to Core-API's centralized Redis/PostgreSQL counters.
 *
 * @param counterKey Counter to increment (e.g. 'dms', 'automations', 'comments')
 * @param increment Number to increment (default 1)
 * @param userId User for whom to increment (required for background jobs like webhooks)
 * @param mode 'async' (fire-and-forget, zero latency) or 'sync' (blocking check)
 */
export async function trackPlatformUsage(
  counterKey: string,
  increment = 1,
  userId?: number,
  mode: "sync" | "async" = "async"
): Promise<{ allowed: boolean; current?: number; limit?: number }> {
  try {
    const userToken = await getRawAuthToken();
    const token = userToken || (userId ? getCoreApiToken(userId) : null);

    if (!token) {
      console.warn("[PlatformMetering] Cannot track usage: no token and no userId provided");
      return { allowed: true };
    }

    const res = await fetch(`${CORE_API_URL}/v1/usage/track`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        appId: "auraflow",
        counterKey,
        increment,
        mode,
        ...(userId ? { userId } : {}),
      }),
    });

    if (!res.ok) {
      console.error(`[PlatformMetering] Usage track error (${res.status}):`, await res.text());
      return { allowed: true };
    }

    const data = await res.json();
    return {
      allowed: data.allowed ?? true,
      current: data.current,
      limit: data.limit,
    };
  } catch (error) {
    console.error("[PlatformMetering] Failed to track usage:", error);
    return { allowed: true };
  }
}
