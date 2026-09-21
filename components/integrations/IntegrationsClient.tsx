"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Instagram,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Facebook,
  Youtube,
  MessageCircle,
  Clock,
  Plus,
  Crown,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import ActiveIntegration from "./active-integration";
import UpgradeModal from "@/components/global/upgrade-modal";
import { useAuraflowAccess } from "@/lib/use-auraflow-access";

interface IntegrationsClientProps {
  integrations?: any[];
  instagramIntegration?: any | null;
}

const COMING_SOON = [
  {
    name: "Facebook",
    icon: Facebook,
    emoji: "🔵",
    desc: "Automate Facebook DMs and comment replies",
    color: "text-blue-600",
    bg: "from-blue-500 to-blue-600",
  },
  {
    name: "WhatsApp Business",
    icon: MessageCircle,
    emoji: "🟢",
    desc: "Auto-reply to WhatsApp Business messages",
    color: "text-emerald-600",
    bg: "from-emerald-500 to-teal-600",
  },
  {
    name: "YouTube",
    icon: Youtube,
    emoji: "🔴",
    desc: "Respond to YouTube comments automatically",
    color: "text-red-600",
    bg: "from-red-500 to-rose-600",
  },
];

export default function IntegrationsClient({
  integrations = [],
  instagramIntegration,
}: IntegrationsClientProps) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const access = useAuraflowAccess();

  // Normalize list of Instagram integrations
  const instagramAccounts = (
    integrations.length > 0
      ? integrations.filter((i) => i.name === "INSTAGRAM")
      : instagramIntegration
      ? [instagramIntegration]
      : []
  );

  const isConnected = instagramAccounts.length > 0;
  const connectionsCount = instagramAccounts.length;
  const maxConnections = access.limits.connections ?? (access.tier === "enterprise" ? -1 : access.tier === "pro" ? 2 : 1);
  const canAddMore = maxConnections === -1 || connectionsCount < maxConnections;

  const handleAddAccountClick = (e: React.MouseEvent) => {
    if (!canAddMore) {
      e.preventDefault();
      setShowUpgradeModal(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12 w-full"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">
              External Apps & Social Channels
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-foreground tracking-tighter leading-none">
            Social <br />
            <span className="text-muted-foreground">Integrations.</span>
          </h1>
        </div>

        {/* Plan / Multi-account status badge */}
        <div className="flex flex-wrap items-center gap-3">
          {access.tier === "enterprise" ? (
            <div className="flex items-center gap-2 bg-purple-50 text-purple-700 border border-purple-200 px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wider">
              <Crown className="w-4 h-4 text-purple-600" />
              Enterprise: Unlimited Accounts
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-secondary text-muted-foreground border border-border px-4 py-2 rounded-full font-semibold text-xs">
              <ShieldCheck className="w-4 h-4 text-primary" />
              Connected: {connectionsCount} / {maxConnections === -1 ? "∞" : maxConnections} Accounts
            </div>
          )}
        </div>
      </div>

      {/* Instagram Integration Card / Multi-Account Dashboard */}
      <div className="bg-white border border-border rounded-[48px] p-8 md:p-12 overflow-hidden shadow-sm">
        {/* Card Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10 pb-8 border-b border-border/60">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-[32px] bg-linear-to-br from-[#f09433] via-[#e6683c] via-[#dc2743] via-[#cc2366] to-[#bc1888] flex items-center justify-center shadow-xl shadow-pink-500/20">
              <Instagram className="w-10 h-10 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tighter">Instagram</h2>
                {isConnected && (
                  <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100 font-bold uppercase tracking-widest text-[9px]">
                    Live Connection ({connectionsCount})
                  </span>
                )}
              </div>
              <p className="text-muted-foreground font-medium text-base md:text-lg mt-1">
                Automate DMs, sales conversion, and comment replies across your Instagram accounts.
              </p>
            </div>
          </div>

          {/* Action button */}
          <div className="flex items-center gap-4 shrink-0">
            {canAddMore ? (
              <Link
                href="/api/integrations/instagram/install"
                prefetch={false}
                className="h-14 px-8 bg-linear-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] text-white rounded-full flex items-center justify-center gap-2 font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-pink-500/20"
              >
                <Plus className="w-4 h-4" />
                {isConnected ? "Connect Another Account" : "Connect Account"}
              </Link>
            ) : (
              <button
                onClick={handleAddAccountClick}
                className="h-14 px-8 bg-foreground text-background rounded-full flex items-center justify-center gap-2 font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg"
              >
                <Crown className="w-4 h-4 text-amber-400" />
                Upgrade for Multi-Account
              </button>
            )}
          </div>
        </div>

        {/* Connected Accounts List */}
        {isConnected ? (
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">
              Connected Accounts ({connectionsCount})
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {instagramAccounts.map((account) => {
                const displayName = account.username
                  ? `@${account.username.replace(/^@/, "")}`
                  : `@${account.instagramId}`;
                const title = account.fullName || displayName;

                return (
                  <div
                    key={account.id}
                    className="bg-secondary/40 hover:bg-secondary/60 transition-colors rounded-[32px] p-6 md:p-8 border border-border flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center border border-border shadow-sm overflow-hidden shrink-0">
                        {account.profilePic ? (
                          <img
                            src={account.profilePic}
                            alt={displayName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Instagram className="w-8 h-8 text-primary" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xl font-bold tracking-tight text-foreground">
                            {displayName}
                          </p>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground font-medium">
                          <span>{title}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            Connected {new Date(account.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Link
                        href="/automations/new"
                        className="h-12 px-6 bg-foreground text-background rounded-full flex items-center justify-center gap-2 font-bold text-xs hover:scale-105 active:scale-95 transition-all"
                      >
                        Create Flow <Plus className="w-3.5 h-3.5" />
                      </Link>
                      <ActiveIntegration
                        id={account.id}
                        name="Instagram"
                        detail={displayName}
                        type="INSTAGRAM"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            <p className="text-xl text-muted-foreground font-medium leading-relaxed max-w-2xl">
              Scale your Instagram engagement with AI-powered replies. Connect your Business account to unlock automated workflows.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Keyword Triggers", desc: "Auto-reply to specific words in comments" },
                { label: "DM Automation", desc: "Handle support & sales via direct messages" },
                { label: "Smart AI Closer", desc: "Let AI negotiate and close deals for you" },
              ].map((f) => (
                <div key={f.label} className="p-8 bg-secondary/50 rounded-[32px] border border-border">
                  <p className="text-lg font-bold text-foreground mb-2">{f.label}</p>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
            <Link
              href="/api/integrations/instagram/install"
              prefetch={false}
              className="inline-flex items-center justify-center gap-3 h-16 px-10 bg-linear-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] text-white font-bold rounded-full hover:scale-105 active:scale-95 transition-all text-lg shadow-xl shadow-pink-500/20"
            >
              <Instagram className="w-6 h-6" />
              Connect Instagram account
              <ExternalLink className="w-5 h-5 ml-2 opacity-50" />
            </Link>
          </div>
        )}
      </div>

      {/* Coming Soon Roadmap */}
      <div className="space-y-8">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
            Next on Roadmap
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {COMING_SOON.map((platform) => (
            <div
              key={platform.name}
              className="bg-white border border-border rounded-[40px] p-8 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-not-allowed group"
            >
              <div
                className={`w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500`}
              >
                <platform.icon className={cn("w-8 h-8", platform.color)} />
              </div>
              <h3 className="text-2xl font-bold tracking-tighter mb-2">{platform.name}</h3>
              <p className="text-muted-foreground font-medium mb-6 leading-relaxed">
                {platform.desc}
              </p>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 border border-border px-3 py-1 rounded-full">
                Development Stage
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic Upgrade Modal for Multi-Account */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title="Multi-Account Instagram Scale"
        description={`You have connected ${connectionsCount} Instagram account(s). Upgrade to Enterprise to connect unlimited brand accounts, manage multiple client channels, and deploy team workspaces.`}
        targetTier="enterprise"
        featureName="Multi-Account Instagram Support"
      />
    </motion.div>
  );
}
