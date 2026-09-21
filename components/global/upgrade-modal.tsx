"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Check, Crown, ArrowRight, X, ShieldCheck } from "lucide-react";
import { getUpgradeUrl } from "@/lib/platform/sso";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  targetTier?: "standard" | "pro" | "enterprise";
  featureName?: string;
}

const TIER_BENEFITS: Record<string, { name: string; tag: string; features: string[] }> = {
  standard: {
    name: "Standard Plan",
    tag: "Essential Growth",
    features: [
      "Up to 25 Automated Workflows",
      "1,000 Direct Messages & Comments / month",
      "Full Performance Analytics & Conversion Tracking",
      "Multi-keyword Trigger Rules",
      "Priority Community Support",
    ],
  },
  pro: {
    name: "Pro Plan",
    tag: "Most Popular",
    features: [
      "Up to 100 Automated Workflows",
      "Unlimited Direct Messages & Comments",
      "AI Closer Agents Powered by Neural Hub (No point deduction)",
      "Lead Magnet Export & CRM Sync",
      "Advanced Multi-account Support",
      "Dedicated High-priority Processing",
    ],
  },
  enterprise: {
    name: "Enterprise Plan",
    tag: "Maximum Scale",
    features: [
      "Unlimited Automated Workflows",
      "Unlimited AI Agents with Custom Fine-tuned Models",
      "Multiple Instagram & Social Accounts",
      "Team Member Workspaces with Granular Roles",
      "Custom SLA & Dedicated Account Manager",
    ],
  },
};

export default function UpgradeModal({
  isOpen,
  onClose,
  title = "Unlock Premium Capabilities",
  description = "You've reached your plan's limit. Upgrade today to unlock more automations, higher messaging volume, and autonomous AI agents.",
  targetTier = "pro",
  featureName,
}: UpgradeModalProps) {
  if (!isOpen) return null;

  const tierInfo = TIER_BENEFITS[targetTier] || TIER_BENEFITS.pro;
  const upgradeHref = typeof window !== "undefined"
    ? getUpgradeUrl(targetTier, window.location.pathname)
    : `/subscription`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-lg bg-card border border-border/80 rounded-[32px] p-6 md:p-8 shadow-2xl overflow-hidden"
        >
          {/* Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-9 h-9 rounded-full bg-secondary/80 hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={16} />
          </button>

          {/* Header */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black tracking-widest uppercase mb-3">
              <Crown size={12} /> {tierInfo.tag}
            </div>
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground leading-tight">
              {featureName ? `Unlock ${featureName}` : title}
            </h3>
            <p className="text-sm text-muted-foreground font-medium mt-2 leading-relaxed">
              {description}
            </p>
          </div>

          {/* Features list */}
          <div className="bg-secondary/40 border border-border/50 rounded-2xl p-4 md:p-5 mb-6 space-y-3">
            <p className="text-[11px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-primary" /> What's included in {tierInfo.name}:
            </p>
            <ul className="space-y-2">
              {tierInfo.features.map((feat, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-muted-foreground font-medium">
                  <div className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={10} strokeWidth={3} />
                  </div>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <a
              href={upgradeHref}
              className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-lg shadow-primary/25 flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
            >
              <Sparkles size={16} /> Upgrade to {tierInfo.name} <ArrowRight size={16} />
            </a>
            <button
              onClick={onClose}
              className="w-full sm:w-auto py-3.5 px-5 rounded-2xl bg-secondary hover:bg-secondary/80 text-foreground font-semibold text-sm transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
