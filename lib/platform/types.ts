/**
 * CodeSwayam Platform — Core Types & Contracts
 * ─────────────────────────────────────────────
 * Canonical definitions shared across all CodeSwayam SaaS products.
 */

export type PlatformRole = "user" | "admin" | "superadmin" | "developer";

export interface AuthUser {
  userId: number;
  email: string;
  role: PlatformRole;
  name?: string;
  access_scopes?: string[];
}

export interface AuthSession {
  user: AuthUser | null;
  token: string | null;
  error?: string | null;
}

export interface PlatformTier {
  name: string;
  label: string;
  aiIncluded: boolean;
}

export interface PlatformSubscription {
  id: number;
  status: string;
  planType: string;
  planTier?: string;
  productSaasId?: string;
  expiresAt: string | null;
  billingCycle: string;
}

export interface PlatformUsageCounter {
  used: number;
  limit: number;
  remaining: number;
  percentage: number;
}

export interface PlatformCrossAppGrant {
  id: number;
  sourceFamily: string;
  sourceAppId: string;
  sourcePlanType: string;
  featureCategory: string;
  grantedAt: string;
}

export interface PlatformEntitlements {
  userId: number;
  appId: string;
  role: string;
  tier: PlatformTier;
  subscription: PlatformSubscription | null;
  crossAppGrants?: PlatformCrossAppGrant[];
  credits: {
    balance: number;
    featureCosts: Record<string, number>;
  };
  usage: Record<string, PlatformUsageCounter>;
  features: Record<string, boolean | number>;
}

export interface FeatureAccessCheck {
  allowed: boolean;
  reason: "TIER_TOO_LOW" | "FEATURE_DISABLED" | "INSUFFICIENT_CREDITS" | "USAGE_LIMIT_REACHED" | null;
  method?: "subscription" | "cross_app_grant" | "credit_deduct" | "denied";
  grantedBy?: string;
  creditCost?: number;
  creditBalance?: number;
}

export interface QuotaCheckResult {
  allowed: boolean;
  current: number;
  limit: number;
  remaining: number;
}
