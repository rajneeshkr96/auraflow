"use client";

/**
 * useAuraflowAccess
 * ─────────────────
 * Single source of truth for plan-based feature access in Auraflow.
 *
 * Plan hierarchy (from core-api):
 *   free       → static replies only; AI via points (deducted per use)
 *   standard   → unlimited DM/post automation; AI via points
 *   pro        → AI included (no point deduction); all features
 *   enterprise → AI included; multiple accounts; all features
 *
 * Points rule:
 *   - If plan includes AI (pro/enterprise) → points NOT deducted
 *   - Otherwise → points deducted per AI call (featureKey: "ai_reply")
 */

import { useMemo } from "react";
import { useCSWSubscriptions, useCSWCredits } from "@codeswayam/auth";

// ── Plan tier definitions ──────────────────────────────────────────────────────

export type AuraflowTier = "free" | "standard" | "pro" | "enterprise";

interface TierConfig {
  label: string;
  aiIncluded: boolean;          // true = no point deduction for AI
  maxAutomations: number;       // -1 = unlimited
  maxConnections: number;       // -1 = unlimited
  maxAiResponses: number;       // -1 = unlimited (only relevant when aiIncluded=false)
  canUseSmartAi: boolean;       // can select SMART_AI listener at all
  canExportLeads: boolean;
  canUseAnalytics: boolean;
}

const TIER_CONFIG: Record<AuraflowTier, TierConfig> = {
  free: {
    label: "Free",
    aiIncluded: false,
    maxAutomations: 5,
    maxConnections: 1,
    maxAiResponses: 50,
    canUseSmartAi: true,   // allowed but costs points
    canExportLeads: false,
    canUseAnalytics: false,
  },
  standard: {
    label: "Standard",
    aiIncluded: false,
    maxAutomations: -1,
    maxConnections: 1,
    maxAiResponses: 500,
    canUseSmartAi: true,   // allowed but costs points
    canExportLeads: false,
    canUseAnalytics: true,
  },
  pro: {
    label: "Pro",
    aiIncluded: true,      // AI is FREE — no point deduction
    maxAutomations: -1,
    maxConnections: 1,
    maxAiResponses: -1,
    canUseSmartAi: true,
    canExportLeads: true,
    canUseAnalytics: true,
  },
  enterprise: {
    label: "Enterprise",
    aiIncluded: true,      // AI is FREE — no point deduction
    maxAutomations: -1,
    maxConnections: -1,
    maxAiResponses: -1,
    canUseSmartAi: true,
    canExportLeads: true,
    canUseAnalytics: true,
  },
};

// ── Resolve tier from subscription planTier string ────────────────────────────

function resolveTier(planTier?: string | null): AuraflowTier {
  const t = (planTier || "free").toLowerCase();
  if (t.includes("enterprise")) return "enterprise";
  if (t.includes("pro")) return "pro";
  if (t.includes("standard")) return "standard";
  return "free";
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export interface AuraflowAccess {
  /** Resolved plan tier */
  tier: AuraflowTier;
  /** Human-readable plan label */
  planLabel: string;
  /** Whether the user has any active auraflow subscription */
  isSubscribed: boolean;
  /** Whether AI is included in the plan (no point deduction) */
  aiIncluded: boolean;
  /** Whether the user can use SMART_AI listener */
  canUseSmartAi: boolean;
  /** Whether the user can export leads */
  canExportLeads: boolean;
  /** Whether the user can access analytics */
  canUseAnalytics: boolean;
  /** Usage limits for the current tier */
  limits: {
    automations: number;
    connections: number;
    aiResponses: number;
  };
  /** Current credit balance */
  creditBalance: number;
  /** Whether user can afford one AI call (only relevant when aiIncluded=false) */
  canAffordAiCall: boolean;
  /** Cost of one AI reply in points (0 if aiIncluded) */
  aiCallCost: number;
  /** Whether subscription data has loaded */
  isLoaded: boolean;
  /** The active subscription object */
  subscription: any | null;
}

/** Cost in points for one AI reply when not included in plan */
const AI_REPLY_POINT_COST = 5;

export function useAuraflowAccess(): AuraflowAccess {
  const { subscriptions, isLoaded: subsLoaded } = useCSWSubscriptions();
  const { balance, isLoaded: creditsLoaded } = useCSWCredits();

  return useMemo(() => {
    const activeSub = subscriptions.find(
      (s) =>
        s.status === "active" &&
        (s.productSaasId?.includes("auraflow") ||
          (s as any).productFamily === "auraflow" ||
          s.planType === "BUNDLE")
    );

    const tier = resolveTier((activeSub as any)?.planTier ?? (activeSub ? "pro" : "free"));
    const config = TIER_CONFIG[tier];
    const aiCallCost = config.aiIncluded ? 0 : AI_REPLY_POINT_COST;

    return {
      tier,
      planLabel: config.label,
      isSubscribed: !!activeSub,
      aiIncluded: config.aiIncluded,
      canUseSmartAi: config.canUseSmartAi,
      canExportLeads: config.canExportLeads,
      canUseAnalytics: config.canUseAnalytics,
      limits: {
        automations: config.maxAutomations,
        connections: config.maxConnections,
        aiResponses: config.maxAiResponses,
      },
      creditBalance: balance,
      canAffordAiCall: config.aiIncluded || balance >= AI_REPLY_POINT_COST,
      aiCallCost,
      isLoaded: subsLoaded && creditsLoaded,
      subscription: activeSub ?? null,
    };
  }, [subscriptions, balance, subsLoaded, creditsLoaded]);
}
