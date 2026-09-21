import { getRawAuthToken } from "./auth";
import { PlatformEntitlements, FeatureAccessCheck, QuotaCheckResult } from "./types";

const CORE_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const DEFAULT_FREE_ENTITLEMENTS: PlatformEntitlements = {
  userId: 0,
  appId: "auraflow",
  role: "user",
  tier: { name: "free", label: "Free", aiIncluded: false },
  subscription: null,
  credits: { balance: 0, featureCosts: { ai_reply: 5, ai_caption: 10, ai_hashtag: 5 } },
  usage: {
    automations: { used: 0, limit: 5, remaining: 5, percentage: 0 },
    dms: { used: 0, limit: 100, remaining: 100, percentage: 0 },
  },
  features: {
    canUseSmartAi: false,
    canExportLeads: false,
    canUseAnalytics: false,
    maxConnections: 1,
  },
};

/**
 * Fetches the resolved entitlements for the current user and Auraflow from Core-API
 */
export async function getPlatformEntitlements(): Promise<PlatformEntitlements> {
  const token = await getRawAuthToken();
  if (!token) return DEFAULT_FREE_ENTITLEMENTS;

  try {
    const res = await fetch(`${CORE_API_URL}/v1/entitlements/me?appId=auraflow`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      next: { revalidate: 30 }, // Cache for 30s per request
    });

    if (!res.ok) {
      return DEFAULT_FREE_ENTITLEMENTS;
    }

    const data = await res.json();
    return {
      userId: data.userId || 0,
      appId: "auraflow",
      role: data.role || "user",
      tier: data.tier || { name: "free", label: "Free", aiIncluded: false },
      subscription: data.subscription || null,
      credits: data.credits || { balance: 0, featureCosts: {} },
      usage: data.usage || {},
      features: data.features || {},
    };
  } catch (error) {
    console.error("[PlatformEntitlements] Failed to fetch entitlements:", error);
    return DEFAULT_FREE_ENTITLEMENTS;
  }
}

/**
 * Checks if a specific feature is enabled for the user
 */
export async function checkFeatureAccess(featureKey: string): Promise<FeatureAccessCheck> {
  const entitlements = await getPlatformEntitlements();
  const isEnabled = !!entitlements.features[featureKey];

  if (!isEnabled) {
    return { allowed: false, reason: "FEATURE_DISABLED" };
  }

  // Check if feature incurs credit cost
  const creditCost = entitlements.credits.featureCosts[featureKey] ?? 0;
  if (!entitlements.tier.aiIncluded && creditCost > 0) {
    if (entitlements.credits.balance < creditCost) {
      return {
        allowed: false,
        reason: "INSUFFICIENT_CREDITS",
        creditCost,
        creditBalance: entitlements.credits.balance,
      };
    }
  }

  return { allowed: true, reason: null };
}

/**
 * Checks whether user has remaining quota for a given counter (e.g. 'automations')
 */
export async function checkQuota(counterKey: string, currentCount: number): Promise<QuotaCheckResult> {
  const entitlements = await getPlatformEntitlements();
  const counter = entitlements.usage[counterKey];

  // Limit of -1 means unlimited
  const limit = counter ? counter.limit : (counterKey === "automations" ? 5 : 100);

  if (limit === -1) {
    return { allowed: true, current: currentCount, limit: -1, remaining: Infinity };
  }

  const allowed = currentCount < limit;
  const remaining = Math.max(0, limit - currentCount);

  return { allowed, current: currentCount, limit, remaining };
}
