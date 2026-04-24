"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Zap,
    Bot,
    Link2,
    TrendingUp,
    ArrowUpRight,
    Crown,
    RefreshCw,
    CheckCircle2,
    AlertTriangle,
} from "lucide-react";
import Link from "next/link";

// ─── Default Fallback Limits ──────────────────────────────────────────────────
const DEFAULT_LIMITS = {
    aiResponses: 100,
    automations: 3,
    connections: 1,
    label: "Free",
    color: "#64748b"
};

interface UsageData {
    aiResponses: number;
    automations: number;
    connections: number;
}

interface UsageMeterProps {
    planTier?: string;
    usageLimits?: Record<string, number>;
    // Actual usage counts passed from parent or fetched
    usage?: Partial<UsageData>;
    authUrl?: string;
}

function ProgressBar({
    label,
    icon: Icon,
    used,
    limit,
}: {
    label: string;
    icon: React.ElementType;
    used: number;
    limit: number;
}) {
    const isUnlimited = limit === -1;
    const percentage = isUnlimited ? 0 : Math.min(100, Math.round((used / limit) * 100));

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-primary">
                        <Icon size={16} />
                    </div>
                    <span className="text-sm font-bold text-foreground">{label}</span>
                </div>
                <span className="text-xs font-bold text-muted-foreground">
                    {isUnlimited ? "Unlimited" : `${used} / ${limit}`}
                </span>
            </div>

            {!isUnlimited && (
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, ease: "circOut" }}
                        className="h-full bg-primary rounded-full"
                    />
                </div>
            )}
        </div>
    );
}

export default function UsageMeter({
    planTier = "free",
    usageLimits,
    usage,
    authUrl,
}: UsageMeterProps) {
    const [liveUsage, setLiveUsage] = useState<UsageData>({
        aiResponses: usage?.aiResponses ?? 0,
        automations: usage?.automations ?? 0,
        connections: usage?.connections ?? 0,
    });
    const [refreshing, setRefreshing] = useState(false);

    const tier = planTier?.toUpperCase() || "FREE";
    const limits = {
        aiResponses: usageLimits?.aiResponses ?? DEFAULT_LIMITS.aiResponses,
        automations: usageLimits?.automations ?? DEFAULT_LIMITS.automations,
        connections: usageLimits?.connections ?? DEFAULT_LIMITS.connections,
        label: tier,
        color: DEFAULT_LIMITS.color,
    };

    const upgradeUrl = authUrl
        ? `${authUrl}/profile/subscription`
        : "http://localhost:3003/profile/subscription";

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                   <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">Plan Limit</h3>
                   <div className="flex items-center gap-2">
                      <span className="text-xl font-bold tracking-tighter text-foreground">{limits.label}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                   </div>
                </div>
                <button
                    onClick={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 800); }}
                    className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary transition-all"
                >
                    <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                </button>
            </div>

            <div className="space-y-6">
                <ProgressBar
                    label="AI Responses"
                    icon={Bot}
                    used={liveUsage.aiResponses}
                    limit={limits.aiResponses}
                />
                <ProgressBar
                    label="Automations"
                    icon={Zap}
                    used={liveUsage.automations}
                    limit={limits.automations}
                />
                <ProgressBar
                    label="Connections"
                    icon={Link2}
                    used={liveUsage.connections}
                    limit={limits.connections}
                />
            </div>

            {tier === "free" && (
               <Link href={upgradeUrl} className="flex items-center justify-center gap-2 w-full h-14 bg-primary text-white font-bold rounded-full text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20">
                  Upgrade Plan <ArrowUpRight className="w-4 h-4" />
               </Link>
            )}
        </div>
    );
}
