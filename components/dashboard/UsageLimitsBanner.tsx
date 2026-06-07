"use client";

import { useMemo } from 'react';
import { Zap, MessageSquare, TrendingUp, Crown, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface UsageStats {
  automations: number;
  dmsThisMonth: number;
  commentsThisMonth: number;
  triggersThisMonth: number;
  resetDate?: Date | string;
}

interface LimitConfig {
  automations: number;
  dmsPerMonth: number;
  commentsPerMonth: number;
  triggersPerMonth: number;
}

interface Props {
  usage: UsageStats;
  limits: LimitConfig;
  tier: string;
}

function UsageBar({
  icon: Icon, label, used, limit, color,
}: {
  icon: any;
  label: string;
  used: number;
  limit: number;
  color: string;
}) {
  const unlimited = limit < 0 || limit === Infinity;
  const pct = unlimited ? 0 : Math.min((used / limit) * 100, 100);
  const isWarning = !unlimited && pct >= 80;
  const isCritical = !unlimited && pct >= 95;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-foreground">
          <Icon className={cn("w-3.5 h-3.5", color)} />
          {label}
        </div>
        <span className={cn(
          "font-bold",
          isCritical ? "text-red-500" : isWarning ? "text-amber-500" : "text-muted-foreground"
        )}>
          {unlimited ? (
            <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Unlimited</span>
          ) : (
            `${used.toLocaleString()} / ${limit.toLocaleString()}`
          )}
        </span>
      </div>
      {!unlimited && (
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700",
              isCritical ? "bg-red-500" : isWarning ? "bg-amber-500" : color.replace('text-', 'bg-')
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default function UsageLimitsBanner({ usage, limits, tier }: Props) {
  const isOverLimit = useMemo(() => {
    if (limits.automations > 0 && usage.automations >= limits.automations) return true;
    if (limits.dmsPerMonth > 0 && usage.dmsThisMonth >= limits.dmsPerMonth) return true;
    if (limits.commentsPerMonth > 0 && usage.commentsThisMonth >= limits.commentsPerMonth) return true;
    return false;
  }, [usage, limits]);

  const isNearLimit = useMemo(() => {
    const check = (used: number, limit: number) => limit > 0 && used / limit >= 0.8;
    return check(usage.automations, limits.automations) ||
      check(usage.dmsThisMonth, limits.dmsPerMonth) ||
      check(usage.commentsThisMonth, limits.commentsPerMonth);
  }, [usage, limits]);

  const resetDate = usage.resetDate
    ? new Date(usage.resetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;

  return (
    <div className={cn(
      "rounded-[28px] border p-6 space-y-5 transition-all",
      isOverLimit
        ? "border-red-200 bg-red-50/50 dark:border-red-900/40 dark:bg-red-950/10"
        : isNearLimit
          ? "border-amber-200 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/10"
          : "border-border bg-secondary/30"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isOverLimit ? (
            <AlertTriangle className="w-5 h-5 text-red-500" />
          ) : isNearLimit ? (
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          ) : (
            <Zap className="w-5 h-5 text-primary" />
          )}
          <div>
            <p className="text-sm font-bold text-foreground">
              {isOverLimit ? 'Limit Reached' : isNearLimit ? 'Approaching Limit' : 'Usage This Month'}
            </p>
            {resetDate && (
              <p className="text-[10px] text-muted-foreground">Resets {resetDate}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest bg-secondary border border-border px-3 py-1.5 rounded-full text-muted-foreground">
            {tier} Plan
          </span>
          <Link
            href="/subscription"
            className="flex items-center gap-1.5 h-8 px-4 bg-foreground text-background text-xs font-bold rounded-full hover:bg-primary transition-colors"
          >
            <Crown className="w-3 h-3" /> Upgrade
          </Link>
        </div>
      </div>

      {/* Usage bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UsageBar
          icon={Zap}
          label="Automations"
          used={usage.automations}
          limit={limits.automations}
          color="text-primary"
        />
        <UsageBar
          icon={MessageSquare}
          label="DMs / month"
          used={usage.dmsThisMonth}
          limit={limits.dmsPerMonth}
          color="text-blue-500"
        />
        <UsageBar
          icon={TrendingUp}
          label="Comments / month"
          used={usage.commentsThisMonth}
          limit={limits.commentsPerMonth}
          color="text-violet-500"
        />
        <UsageBar
          icon={Zap}
          label="Triggers / month"
          used={usage.triggersThisMonth}
          limit={limits.triggersPerMonth}
          color="text-emerald-500"
        />
      </div>

      {/* CTA for over limit */}
      {isOverLimit && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-100/80 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold text-red-800 dark:text-red-400">
              You've hit your {tier} limit
            </p>
            <p className="text-xs text-red-700 dark:text-red-500">
              Some automations may have stopped sending. Upgrade to resume.
            </p>
          </div>
          <Link href="/subscription" className="shrink-0 h-9 px-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center gap-1.5 hover:bg-red-700 transition-colors">
            <Crown className="w-3.5 h-3.5" /> Upgrade Now
          </Link>
        </div>
      )}
    </div>
  );
}
