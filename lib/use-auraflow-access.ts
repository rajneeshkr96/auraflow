"use client";

import { useMemo } from "react";
import { useAppAccess, AppAccess } from "@codeswayam/access";

export type AuraflowTier = "free" | "standard" | "pro" | "enterprise";

export interface AuraflowAccess {
  /** Resolved plan tier name */
  tier: AuraflowTier;
  /** Human-readable plan label */
  planLabel: string;
  /** Whether the user has an active auraflow subscription */
  isSubscribed: boolean;
  /** Whether AI is included in the plan without deducting credits */
  aiIncluded: boolean;
  /** Whether the user can use SMART_AI listener */
  canUseSmartAi: boolean;
  /** Whether the user can export leads */
  canExportLeads: boolean;
  /** Whether the user can access analytics */
  canUseAnalytics: boolean;
  /** Usage limits resolved from Core-API */
  limits: {
    automations: number;
    connections: number;
    aiResponses: number;
  };
  /** Current credit balance */
  creditBalance: number;
  /** Whether user can afford one AI call (or if AI is included) */
  canAffordAiCall: boolean;
  /** Cost of one AI reply in points (0 if included in plan) */
  aiCallCost: number;
  /** Whether entitlements data has loaded */
  isLoaded: boolean;
  /** The active subscription object from Core-API */
  subscription: any | null;
  /** Raw @codeswayam/access AppAccess context */
  access: AppAccess;
  /** Re-fetch entitlements from Core-API */
  refresh: () => void;
}

/**
 * useAuraflowAccess
 * ─────────────────
 * Unified facade connecting Auraflow to the Core-API Entitlements engine.
 * Eliminates client-side hardcoded tiers and string guessing.
 */
export function useAuraflowAccess(): AuraflowAccess {
  const access = useAppAccess("auraflow");

  return useMemo(() => {
    const tierName = (access.tier?.name?.toLowerCase() || "free") as AuraflowTier;
    const aiIncluded = !!access.tier?.aiIncluded;

    const automationsLimit = access.usage["automations"]?.limit ?? (access.hasTier("pro") ? -1 : 5);
    const connectionsLimit = (access.features["maxConnections"] as number) ?? (access.hasTier("pro") ? -1 : 1);
    const aiResponsesLimit = access.usage["ai_responses"]?.limit ?? (aiIncluded ? -1 : 50);

    const aiPointCost = aiIncluded ? 0 : (access.credits.featureCosts["ai_reply"] ?? 5);
    const canAffordAiCall = aiIncluded || access.credits.balance >= aiPointCost;

    return {
      tier: tierName,
      planLabel: access.tier?.label || "Free",
      isSubscribed: !!access.subscription && access.subscription.status === "active",
      aiIncluded,
      canUseSmartAi: access.hasFeature("canUseSmartAi") || access.hasTier("standard"),
      canExportLeads: access.hasFeature("canExportLeads") || access.hasTier("pro"),
      canUseAnalytics: access.hasFeature("canUseAnalytics") || access.hasTier("standard"),
      limits: {
        automations: automationsLimit,
        connections: connectionsLimit,
        aiResponses: aiResponsesLimit,
      },
      creditBalance: access.credits.balance,
      canAffordAiCall,
      aiCallCost: aiPointCost,
      isLoaded: access.isLoaded,
      subscription: access.subscription,
      access,
      refresh: access.refresh,
    };
  }, [access]);
}
