import * as jwt from "jsonwebtoken";
import { getRawAuthToken } from "./auth";

const CORE_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const JWT_SECRET = process.env.JWT_SECRET || "hgkjhkhjvb654gbhj";

function getServiceToken(userId: number): string {
  return jwt.sign(
    { sub: userId, email: `credits-${userId}@auraflow.internal`, role: "admin" },
    JWT_SECRET,
    { expiresIn: "60s" }
  );
}

/**
 * Checks if a user has sufficient points/credits in Core-API for a specific operation
 */
export async function canAffordFeature(userId: number, featureKey: string, requiredPoints = 5): Promise<boolean> {
  try {
    const userToken = await getRawAuthToken();
    const token = userToken || getServiceToken(userId);

    const res = await fetch(`${CORE_API_URL}/credits/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return true; // Graceful fallback
    const data = await res.json();
    const balance = data?.wallet?.balance ?? data?.balance ?? 0;
    return balance >= requiredPoints;
  } catch {
    return true;
  }
}

/**
 * Deducts credits from the user's Core-API wallet for pay-per-use operations (e.g. AI replies)
 */
export async function deductCredits(
  userId: number,
  featureKey: string,
  description = "Auraflow AI usage"
): Promise<{ success: boolean; balanceRemaining?: number }> {
  try {
    const userToken = await getRawAuthToken();
    const token = userToken || getServiceToken(userId);

    const res = await fetch(`${CORE_API_URL}/credits/use`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        saasId: "auraflow",
        featureKey,
        description,
      }),
    });

    if (!res.ok) {
      console.warn(`[PlatformCredits] Deduction returned status ${res.status}`);
      return { success: false };
    }

    const data = await res.json();
    return { success: true, balanceRemaining: data?.balanceAfter };
  } catch (error) {
    console.error("[PlatformCredits] Deduction error:", error);
    return { success: false };
  }
}
