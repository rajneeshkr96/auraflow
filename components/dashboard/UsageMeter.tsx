"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Bot, Link2, RefreshCw, Crown, Sparkles } from "lucide-react";
import Link from "next/link";
import { useAuraflowAccess } from "@/lib/use-auraflow-access";

interface UsageMeterProps {
  usage?: {
    aiResponses?: number;
    automations?: number;
    connections?: number;
  };
  authUrl?: string;
  planTier?: string;
  usageLimits?: Record<string, number>;
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
  const percentage = isUnlimited ? 0 : Math.min(100, Math.round((used / Math.max(1, limit)) * 100));
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
        <span className={`text-xs font-bold ${isWarning ? "text-orange-500" : "text-muted-foreground"}`}>
          {isUnlimited ? "Unlimited" : `${used} / ${limit}`}
        </span>
      </div>
      {!isUnlimited && (
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: "circOut" }}
            className={`h-full rounded-full ${isWarning ? "bg-orange-500" : "bg-primary"}`}
          />
        </div>
      )}
    </div>
  );
}

export default function UsageMeter({ usage }: UsageMeterProps) {
  const access = useAuraflowAccess();
  const [refreshing, setRefreshing] = useState(false);

  const limits = access.limits;
  const tier = access.planLabel;

  const handleRefresh = async () => {
    setRefreshing(true);
    access.refresh();
    setTimeout(() => setRefreshing(false), 600);
  };

  const automationsUsed = usage?.automations ?? access.access.usage["automations"]?.used ?? 0;
  const aiResponsesUsed = usage?.aiResponses ?? access.access.usage["ai_responses"]?.used ?? 0;
  const connectionsUsed = usage?.connections ?? access.access.usage["connections"]?.used ?? 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">
            Platform Plan Usage
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tighter text-foreground">{tier}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            {access.aiIncluded && (
              <span className="text-[9px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1">
                <Crown size={8} /> AI Included
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleRefresh}
          title="Refresh Quotas"
          className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary transition-all active:scale-95"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin text-primary" : ""} />
        </button>
      </div>

      <div className="space-y-6">
        <ProgressBar
          label="Automations"
          icon={Zap}
          used={automationsUsed}
          limit={limits.automations}
        />
        <ProgressBar
          label="AI Responses"
          icon={Bot}
          used={aiResponsesUsed}
          limit={limits.aiResponses}
        />
        <ProgressBar
          label="Connections"
          icon={Link2}
          used={connectionsUsed}
          limit={limits.connections}
        />
      </div>

      {!access.aiIncluded && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-muted-foreground">AI Credit Balance</span>
            <span className="text-foreground">{access.creditBalance.toLocaleString()} pts</span>
          </div>
          <Link
            href="/subscription"
            className="flex items-center justify-center gap-2 w-full h-12 bg-primary text-white font-bold rounded-2xl text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20"
          >
            {access.isSubscribed ? (
              <>
                <Sparkles className="w-4 h-4" /> Buy AI Credits
              </>
            ) : (
              <>
                <Crown className="w-4 h-4" /> Upgrade Plan
              </>
            )}
          </Link>
        </div>
      )}
    </div>
  );
}
