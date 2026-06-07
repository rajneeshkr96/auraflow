"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  LayoutDashboard, Zap, Plug, BarChart3, Settings,
  Sparkles, ChevronRight, Crown, ShieldCheck, Database,
  Inbox, Activity,
} from "lucide-react";
import { useCSWSubscriptions } from "@codeswayam/auth";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type User = {
  id?: number;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  subscription?: { plan?: string } | null;
}

const appNavItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Inbox", icon: Inbox, href: "/inbox" },
  { label: "Automations", icon: Zap, href: "/automations" },
  { label: "Execution Logs", icon: Activity, href: "/logs" },
  { label: "Templates", icon: Sparkles, href: "/templates", badge: "New" },
  { label: "Analytics", icon: BarChart3, href: "/analytics", badge: "Beta" },
  { label: "Integrations", icon: Plug, href: "/integrations" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

export default function Sidebar({ user }: { user?: User | null }) {
  const pathname = usePathname();
  const { subscriptions } = useCSWSubscriptions();
  const [subscriptionUrl, setSubscriptionUrl] = useState("");

  useEffect(() => {
    const returnUrl = encodeURIComponent(`${window.location.origin}/dashboard`);
    setSubscriptionUrl(`${process.env.NEXT_PUBLIC_APP_AUTH_URL || "http://localhost:3003"}/account/subscriptions?returnUrl=${returnUrl}`);
  }, []);

  const displayName = user?.name || user?.email?.split('@')[0] || 'My Account';
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : (user?.email?.[0]?.toUpperCase() || 'U');

  const activeSub = subscriptions.find(
    (s) => s.status === 'active' && (s.productSaasId === 'auraflow' || s.planType === 'BUNDLE')
  );
  const plan = activeSub ? (activeSub.productName || activeSub.bundleName || 'Pro') : 'Free';
  const isPro = !!activeSub;

  return (
    <aside className="flex flex-col h-full w-72 bg-background border-r border-border shrink-0">
      {/* Brand */}
      <div className="px-8 py-10">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tighter text-foreground block leading-none">Auraflow</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 block">Automation OS</span>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        <div className="px-4 pb-4">
           <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Platform</p>
        </div>
        {appNavItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200",
                isActive
                  ? "bg-secondary text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )}
            >
              <div className={cn(
                "w-6 h-6 flex items-center justify-center transition-colors",
                isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
              )}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
              {isActive && (
                <motion.div 
                  layoutId="sidebar-active"
                  className="w-1.5 h-1.5 rounded-full bg-primary"
                />
              )}
            </Link>
          );
        })}

        {/* Admin section — only for admin/superadmin */}
        {(user?.role === "admin" || user?.role === "superadmin") && (
          <div className="pt-4 mt-2 border-t border-dashed border-border/50">
            <div className="px-4 pb-3">
              <p className="text-[10px] font-bold text-primary/60 uppercase tracking-[0.2em] flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3" />
                Admin
              </p>
            </div>
            {[{ label: "Model Requests", icon: Database, href: "/admin/model-requests" }].map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  )}
                >
                  <div className={cn(
                    "w-6 h-6 flex items-center justify-center transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span className="flex-1">{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 space-y-4">
        {!isPro && (
          <div className="bg-primary rounded-[32px] p-6 text-white relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Crown className="w-4 h-4 text-white" />
                <span className="text-xs font-bold uppercase tracking-widest">Upgrade to Pro</span>
              </div>
              <p className="text-sm font-medium text-white/80 mb-6 leading-snug">
                Get AI Agents, advanced analytics & unlimited flows.
              </p>
              <a 
                href={subscriptionUrl}
                className="w-full h-11 text-xs font-bold rounded-full bg-white text-primary hover:bg-white/90 transition-all active:scale-95 flex items-center justify-center"
              >
                Go Unlimited
              </a>
            </div>
            {/* Decorative background circle */}
            <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/10 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-700" />
          </div>
        )}

        <div className="pt-4 border-t border-border">
          <a
            href={`${process.env.NEXT_PUBLIC_APP_AUTH_URL || "http://localhost:3003"}/profile`}
            className="flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-secondary transition-all group"
          >
            <div className="w-10 h-10 rounded-2xl bg-secondary border border-border flex items-center justify-center text-xs font-bold text-primary shrink-0 overflow-hidden">
               {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{displayName}</p>
              <p className="text-xs font-bold text-muted-foreground truncate">{plan} Plan</p>
            </div>
            <Settings className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors group-hover:rotate-45" />
          </a>
        </div>
      </div>
    </aside>
  );
}
