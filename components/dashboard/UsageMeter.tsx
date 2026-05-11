"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Bot, Link2, ArrowUpRight, RefreshCw, Crown, Sparkles } from "lucide-react";
import Link from "next/link";
import { useAuraflowAccess } from "@/lib/use-auraflow-access";

interface UsageMeterProps {
    usage?: {
        aiResponses?: number;
        automations?: number;
        connections?: number;
    };
    authUrl?: string;
    // legacy props kept for compat
    planTier?: string;
    usageLimits?: Record<string, number>;
}

function ProgressBar({
    label, icon: Icon, used, limit,
}: {
    label: string;
    icon: React.ElementType;
    used: number;
    limit: number;
}) {
    const isUnlimited = limit === -1;
    const percentage = isUnlimited ? 0 : Math.min(100, Math.round((used / limit) * 100));
    const isWarning = !isUnlimited && percentage >= 80;

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-primary">
                        <Icon size={16} />
                    </div>
                    <span className="text-sm font-bold text-foreground">{label}</span>
                </div>
                <span className={`text-xs font-bold ${
                    isWarning ? 'text-orange-500' : 'text-muted-foreground'
                }`}>
                    {isUnlimited ? "Unlimited" : `${used} / ${limit}`}
                </span>
            </div>
            {!isUnlimited && (
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, ease: "circOut" }}
                        className={`h-full rounded-full ${
                            isWarning ? 'bg-orange-500' : 'bg-primary'
                        }`}
                    />
                </div>
            )}
        </div>
    );
}

export default function UsageMeter({ usage, authUrl }: UsageMeterProps) {
    const access = useAuraflowAccess();
    const [refreshKey, setRefreshKey] = useState(0);

    const limits = access.limits;
    const tier = access.planLabel;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">Plan Usage</h3>
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold tracking-tighter text-foreground">{tier}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        {access.aiIncluded && (
                            <span className="text-[9px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1">
                                <Crown size={8} /> AI Free
                            </span>
                        )}
                    </div>
                </div>
                <button
                    onClick={() => setRefreshKey(k => k + 1)}
                    className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary transition-all"
                >
                    <RefreshCw size={16} />
                </button>
            </div>

            <div className="space-y-6">
                <ProgressBar
                    label="AI Responses"
                    icon={Bot}
                    used={usage?.aiResponses ?? 0}
                    limit={limits.aiResponses}
                />
                <ProgressBar
                    label="Automations"
                    icon={Zap}
                    used={usage?.automations ?? 0}
                    limit={limits.automations}
                />
                <ProgressBar
                    label="Connections"
                    icon={Link2}
                    used={usage?.connections ?? 0}
                    limit={limits.connections}
                />
            </div>

            {!access.aiIncluded && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-muted-foreground">AI Credits</span>
                        <span className="text-foreground">{access.creditBalance.toLocaleString()} pts</span>
                    </div>
                    <Link
                        href="/subscription"
                        className="flex items-center justify-center gap-2 w-full h-12 bg-primary text-white font-bold rounded-full text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
                    >
                        {access.isSubscribed ? (
                            <><Sparkles className="w-4 h-4" /> Buy AI Credits</>
                        ) : (
                            <><Crown className="w-4 h-4" /> Upgrade Plan</>  
                        )}
                    </Link>
                </div>
            )}
        </div>
    );
}
