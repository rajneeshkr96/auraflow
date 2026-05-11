"use client";

import { motion } from "framer-motion";
import {
  Bot, Sparkles, ArrowUpRight, Crown, ExternalLink,
  CreditCard, CheckCircle2, ChevronRight,
} from "lucide-react";
import {
  useCSWSubscriptions,
  useCSWCredits,
  useCSWCreditPacks,
  BuyCreditsModal,
  CreditBadge,
} from "@codeswayam/auth";
import { useState, useEffect } from "react";

const AUTH_URL = process.env.NEXT_PUBLIC_APP_AUTH_URL || "http://localhost:3003";

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function SubscriptionClient() {
  const { subscriptions, isLoaded: subsLoaded } = useCSWSubscriptions();
  const { balance, wallet, isLoaded: creditsLoaded } = useCSWCredits();
  const [buyCreditsOpen, setBuyCreditsOpen] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [subscriptionUrl, setSubscriptionUrl] = useState(`${AUTH_URL}/account/subscriptions`);

  useEffect(() => {
    const returnUrl = encodeURIComponent(`${window.location.origin}/dashboard`);
    setSubscriptionUrl(`${AUTH_URL}/account/subscriptions?returnUrl=${returnUrl}`);
  }, []);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const activeAuraflowSub = subscriptions.find(
    (s) =>
      s.status === "active" &&
      (
        s.productSaasId?.includes("auraflow") ||
        (s as any).productFamily === "auraflow" ||
        s.planType === "BUNDLE"
      )
  );

  return (
    <div className="space-y-12 w-full">
      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl text-sm font-bold ${
            toast.type === "success" ? "bg-primary text-white" : "bg-destructive text-white"
          }`}
        >
          <CheckCircle2 size={16} />
          {toast.msg}
        </motion.div>
      )}

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Subscription</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter leading-none mb-2">Manage your plan.</h1>
        <p className="text-muted-foreground font-medium">Upgrade, downgrade, or manage AI credits for Auraflow.</p>
      </div>

      {/* Plan Management Card — redirects to auth SSO */}
      {subsLoaded && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {activeAuraflowSub ? (
            // Active plan — show summary + manage link
            <div className="bg-white border border-border rounded-[32px] p-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Active Subscription</p>
                  <h3 className="text-2xl font-bold tracking-tighter">{activeAuraflowSub.productName || activeAuraflowSub.bundleName || "Pro Plan"}</h3>
                  <p className="text-sm text-muted-foreground font-medium mt-1">
                    {activeAuraflowSub.billingCycle} · {activeAuraflowSub.currency} {(activeAuraflowSub.amount / 100).toLocaleString()}
                  </p>
                </div>
                <span className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> {activeAuraflowSub.status}
                </span>
              </div>
              {activeAuraflowSub.expiresAt && (
                <p className="text-xs text-muted-foreground font-medium mb-6">
                  Renews {new Date(activeAuraflowSub.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              )}
              <a
                href={subscriptionUrl}
                className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
              >
                <CreditCard size={15} /> Manage or cancel subscription <ExternalLink size={13} />
              </a>
            </div>
          ) : (
            // No active plan — upgrade card
            <div className="bg-foreground text-background rounded-[32px] p-8 relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Crown className="w-5 h-5 text-white" />
                  <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Upgrade to Pro</span>
                </div>
                <h3 className="text-3xl font-bold tracking-tighter mb-2">Unlock everything.</h3>
                <p className="text-white/60 font-medium mb-8 leading-relaxed">
                  AI Closer Agents, unlimited automations, advanced analytics, and priority support.
                </p>
                <div className="space-y-2 mb-8">
                  {["Unlimited DM automation", "AI Closer Agents", "Advanced Analytics", "Priority Support"].map((f) => (
                    <div key={f} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm font-medium text-white/80">{f}</span>
                    </div>
                  ))}
                </div>
                <a
                  href={subscriptionUrl}
                  className="inline-flex items-center justify-center gap-2 w-full h-12 bg-white text-foreground rounded-full text-sm font-bold hover:scale-105 active:scale-95 transition-all"
                >
                  View Plans & Pricing <ChevronRight size={16} />
                </a>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
            </div>
          )}
        </motion.div>
      )}

      {/* Credits Section — auraflow-specific, stays here */}
      {creditsLoaded && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-border rounded-[32px] p-8">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">AI Credits</p>
            <div className="flex items-end justify-between mb-6">
              <div>
                <span className="text-5xl font-bold tracking-tighter">{balance.toLocaleString()}</span>
                <span className="text-sm font-bold text-muted-foreground ml-2">pts</span>
              </div>
              <Bot className="w-10 h-10 text-primary/20" />
            </div>
            <div className="space-y-2 mb-6 text-xs font-bold text-muted-foreground">
              <div className="flex justify-between"><span>Lifetime Earned</span><span>{wallet?.lifetimeEarned?.toLocaleString() ?? 0} pts</span></div>
              <div className="flex justify-between"><span>Lifetime Spent</span><span>{wallet?.lifetimeSpent?.toLocaleString() ?? 0} pts</span></div>
            </div>
            <button
              onClick={() => setBuyCreditsOpen(true)}
              className="w-full h-12 bg-primary text-white rounded-full text-sm font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
              <Sparkles size={16} /> Buy Credits
            </button>
          </div>

          <div className="bg-foreground text-background rounded-[32px] p-8 relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">AI Feature Costs</p>
              <div className="space-y-4">
                {[
                  { label: "Smart AI Reply", featureKey: "ai_reply" },
                  { label: "AI Closer Agent", featureKey: "ai_closer" },
                  { label: "Lead Analysis", featureKey: "lead_analysis" },
                ].map((item) => (
                  <div key={item.featureKey} className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white/80">{item.label}</span>
                    <CreditBadge saasId="auraflow" featureKey={item.featureKey} showAffordability />
                  </div>
                ))}
              </div>
              <button
                onClick={() => setBuyCreditsOpen(true)}
                className="mt-8 w-full h-12 bg-white text-foreground rounded-full text-sm font-bold hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                Top Up Credits <ArrowUpRight size={16} />
              </button>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
          </div>
        </motion.div>
      )}

      <BuyCreditsModal
        open={buyCreditsOpen}
        onClose={() => setBuyCreditsOpen(false)}
        onSuccess={(pts, bal) => showToast("success", `+${pts} credits added! Balance: ${bal} pts`)}
      />
    </div>
  );
}
