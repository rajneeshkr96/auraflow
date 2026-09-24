import { getRawAuthToken } from "./auth";
import { PlatformEntitlements, FeatureAccessCheck, QuotaCheckResult } from "./types";

const CORE_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const DEFAULT_FREE_ENTITLEMENTS: PlatformEntitlements = {
  userId: 0,
  appId: "auraflow",
  role: "user",
  tier: { name: "free", label: "Free", aiIncluded: false },
  subscription: null,
  crossAppGrants: [],
  credits: { balance: 0, featureCosts: { ai_reply: 1, ai_caption: 1, ai_hashtag: 1, workflow_create: 2, workflow_update: 1 } },
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
 * Fetches the resolved entitlements for the current user and Auraflow from Core-API,
 * including active subscriptions, cross-app grants (e.g. from Neural Web), credit wallet, and limits.
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
      crossAppGrants: Array.isArray(data.crossAppGrants) ? data.crossAppGrants : [],
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
 * Evaluates whether a user can execute a given feature or AI action using the
 * multi-tier decision hierarchy:
 *
 * 1. Direct AuraFlow Subscription:
 *    If user has an active direct subscription with the feature/AI included -> ALLOWED (0 credits)
 *
 * 2. Cross-App Subscription Grant (e.g. Neural Web subscriber visiting AuraFlow):
 *    If user holds an active Neural Web sub that grants 'ai_features' or '*' -> ALLOWED (0 credits)
 *
 * 3. Universal Pay-Per-Use Credits:
 *    If user has neither subscription, check universal credit balance (e.g. 1 credit/chat, 2 credits/automation).
 *    If balance >= cost -> ALLOWED via credits
 *
 * 4. Denial:
 *    If insufficient credits and no subscription -> DENIED with prompt to recharge or subscribe.
 */
export async function checkFeatureAccess(
  featureKey: string,
  options?: {
    grantedCategory?: string;
    requiredTier?: string;
    creditCost?: number;
  },
): Promise<FeatureAccessCheck> {
  const entitlements = await getPlatformEntitlements();

  // Tier ranking
  const TIER_ORDER: Record<string, number> = {
    free: 0,
    standard: 1,
    pro: 2,
    enterprise: 3,
  };

  const userTierWeight = TIER_ORDER[entitlements.tier.name] ?? 0;
  const reqTierWeight = options?.requiredTier ? (TIER_ORDER[options.requiredTier] ?? 0) : 0;
  const isDirectSub = entitlements.subscription?.status === "active";

  // Check 1: Direct Subscription Tier match
  if (isDirectSub && userTierWeight >= reqTierWeight) {
    // If AI feature and aiIncluded is true, or standard feature enabled
    if (featureKey.startsWith("ai_") || featureKey === "canUseSmartAi") {
      if (entitlements.tier.aiIncluded) {
        return { allowed: true, reason: null, method: "subscription" };
      }
    } else if (entitlements.features[featureKey] !== false) {
      return { allowed: true, reason: null, method: "subscription" };
    }
  }

  // Check 2: Cross-App Grants (e.g. Neural Web subscriber accessing AI or workflows in AuraFlow)
  const categoryToCheck = options?.grantedCategory || (
    featureKey.startsWith("ai_") || featureKey === "canUseSmartAi"
      ? "ai_features"
      : undefined
  );

  if (categoryToCheck && entitlements.crossAppGrants && entitlements.crossAppGrants.length > 0) {
    const matchedGrant = entitlements.crossAppGrants.find((g) => {
      return g.featureCategory === "*" || g.featureCategory === categoryToCheck;
    });

    if (matchedGrant) {
      return {
        allowed: true,
        reason: null,
        method: "cross_app_grant",
        grantedBy: matchedGrant.sourceFamily,
      };
    }
  }

  // Check 3: Universal Pay-Per-Use Credits
  const cost = options?.creditCost ?? entitlements.credits.featureCosts[featureKey] ?? (
    featureKey.startsWith("ai_") ? 1 : 2
  );

  if (cost > 0) {
    if (entitlements.credits.balance >= cost) {
      return {
        allowed: true,
        reason: null,
        method: "credit_deduct",
        creditCost: cost,
        creditBalance: entitlements.credits.balance,
      };
    }

    return {
      allowed: false,
      reason: "INSUFFICIENT_CREDITS",
      method: "denied",
      creditCost: cost,
      creditBalance: entitlements.credits.balance,
    };
  }

  // Default feature flag check if no credits defined
  const isEnabled = !!entitlements.features[featureKey];
  if (!isEnabled && reqTierWeight > userTierWeight) {
    return { allowed: false, reason: "TIER_TOO_LOW", method: "denied" };
  }

  return { allowed: true, reason: null, method: "subscription" };
}

/**
 * Deducts universal credits for pay-per-use feature execution when method is 'credit_deduct'.
 * Calls the central Core-API `/credits/use` endpoint.
 */
export async function consumeFeatureCredits(
  featureKey: string,
  quantity = 1,
  metadata?: Record<string, any>,
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  const token = await getRawAuthToken();
  if (!token) return { success: false, error: "Unauthorized" };

  try {
    const res = await fetch(`${CORE_API_URL}/credits/use`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        saasId: "auraflow",
        featureKey,
        quantity,
        metadata,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.message || "Failed to deduct credits" };
    }

    return { success: true, newBalance: data.balance };
  } catch (err: any) {
    console.error("[PlatformEntitlements] consumeFeatureCredits error:", err);
    return { success: false, error: err.message };
  }
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
