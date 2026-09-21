import { onAuthenticatedUser } from "@/actions/user";
import { getAnalyticsData } from "@/actions/automations";
import { redirect } from "next/navigation";
import RealAnalytics from "@/components/analytics/RealAnalytics";
import { getPlatformEntitlements } from "@/lib/platform/entitlements";
import { Sparkles, Crown, ArrowRight, BarChart3 } from "lucide-react";
import { getUpgradeUrl } from "@/lib/platform/sso";

export default async function AnalyticsPage() {
  const user = await onAuthenticatedUser();
  if (!user) redirect("/sign-in");

  const entitlements = await getPlatformEntitlements();
  const canAccessAnalytics =
    !!entitlements.features.canUseAnalytics ||
    entitlements.tier.name === "standard" ||
    entitlements.tier.name === "pro" ||
    entitlements.tier.name === "enterprise";

  if (!canAccessAnalytics) {
    const upgradeUrl = getUpgradeUrl("standard", "/analytics");

    return (
      <div className="space-y-8 w-full">
        {/* Upgrade Banner for Free Tier */}
        <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-card via-card to-primary/5 border border-primary/20 p-8 md:p-12 shadow-xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-2xl relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black tracking-widest uppercase">
              <Crown size={12} /> Standard & Pro Feature
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Deep Conversion & Performance Analytics
            </h1>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Track conversion rates, DM engagement curves, active leads generated from comments, and Instagram automation response times in real time.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <a
                href={upgradeUrl}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/25 hover:bg-primary/90 transition-transform active:scale-95"
              >
                <Sparkles size={16} /> Upgrade to Standard <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </div>

        {/* Blurred Preview of Analytics */}
        <div className="relative rounded-[36px] overflow-hidden">
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
              <BarChart3 size={24} />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">Live Analytics Locked</h3>
            <p className="text-xs text-muted-foreground max-w-sm mb-4">
              Upgrade to Standard or Pro plan to view automation throughput and engagement charts.
            </p>
            <a
              href={upgradeUrl}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              View Plan Options <ArrowRight size={12} />
            </a>
          </div>

          <div className="opacity-40 filter blur-[2px] pointer-events-none">
            <RealAnalytics
              data={{
                stats: {
                  triggers: { current: 1420, change: 18.5 },
                  dms: { current: 840, change: 12.3 },
                  comments: { current: 580, change: 24.1 },
                  conversions: { current: 210, change: 9.8 },
                  responseRate: { current: 98, change: 2.1 },
                },
                weeklyData: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => ({
                  day,
                  triggers: (i + 1) * 45,
                  replies: (i + 1) * 38,
                  dms: (i + 1) * 20,
                  conversions: (i + 1) * 8,
                })),
                performance: [],
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Fetch real analytics data from DB
  const analyticsData = await getAnalyticsData().catch(() => null);

  const data = analyticsData ?? {
    stats: {
      triggers: { current: 0, change: 0 },
      dms: { current: 0, change: 0 },
      comments: { current: 0, change: 0 },
      conversions: { current: 0, change: 0 },
      responseRate: { current: 0, change: 0 },
    },
    weeklyData: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => ({
      day,
      triggers: 0,
      replies: 0,
      dms: 0,
      conversions: 0,
    })),
    performance: [],
  };

  return <RealAnalytics data={data} />;
}
