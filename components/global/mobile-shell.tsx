"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Menu, X, LayoutDashboard, Zap, Plug, BarChart3, Settings,
  Sparkles, Crown, ShieldCheck, Database, Bell, Inbox, Activity,
} from "lucide-react";
import { useCSWSubscriptions } from "@codeswayam/auth";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type User = {
  id?: number;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  subscription?: { plan?: string } | null;
};

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

export default function MobileShell({ user }: { user?: User | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { subscriptions } = useCSWSubscriptions();

  // Close drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const displayName = user?.name || user?.email?.split("@")[0] || "My Account";
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || "U";

  const activeSub = subscriptions.find(
    (s) => s.status === "active" && (s.productSaasId === "auraflow" || s.planType === "BUNDLE")
  );
  const plan = activeSub ? activeSub.productName || activeSub.bundleName || "Pro" : "Free";
  const isPro = !!activeSub;

  const breadcrumbMap: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/inbox": "Inbox",
    "/automations": "Automations",
    "/logs": "Execution Logs",
    "/analytics": "Analytics",
    "/integrations": "Integrations",
    "/subscription": "Subscription",
    "/settings": "Settings",
    "/templates": "Templates",
  };
  let breadcrumb = "Dashboard";
  if (pathname?.match(/^\/automations\/[^/]+$/)) breadcrumb = "Edit Automation";
  else {
    for (const [route, label] of Object.entries(breadcrumbMap)) {
      if (pathname === route || pathname?.startsWith(route + "/")) { breadcrumb = label; break; }
    }
  }

  return (
    <>
      {/* Mobile top bar — only visible on mobile */}
      <header className="lg:hidden flex items-center justify-between h-16 px-4 bg-background border-b border-border shrink-0 z-40">
        {/* Hamburger */}
        <button
          onClick={() => setOpen(true)}
          className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold tracking-tighter">Auraflow</span>
        </Link>

        {/* Right: Bell + Avatar */}
        <div className="flex items-center gap-2">
          <button className="relative w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center text-muted-foreground">
            <Bell className="w-4 h-4" />
            <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-primary rounded-full border border-background" />
          </button>
          <Link
            href={`${process.env.NEXT_PUBLIC_APP_AUTH_URL || "http://localhost:3003"}/profile`}
            className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-primary/20"
          >
            {initials}
          </Link>
        </div>
      </header>

      {/* Drawer overlay + panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setOpen(false)}
            />

            {/* Drawer panel */}
            <motion.aside
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 z-50 h-full w-72 bg-background border-r border-border flex flex-col shadow-2xl lg:hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                <Link href="/dashboard" className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-base font-bold tracking-tighter block leading-none">Auraflow</span>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Automation OS</span>
                  </div>
                </Link>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Nav */}
              <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-3 pb-3">Platform</p>
                {appNavItems.map((item) => {
                  const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all",
                        isActive
                          ? "bg-secondary text-primary"
                          : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                      )}
                    >
                      <item.icon className={cn("w-5 h-5 shrink-0", isActive ? "text-primary" : "")} />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                    </Link>
                  );
                })}

                {/* Admin section */}
                {(user?.role === "admin" || user?.role === "superadmin") && (
                  <div className="pt-4 mt-2 border-t border-dashed border-border/50">
                    <p className="text-[10px] font-bold text-primary/60 uppercase tracking-[0.2em] px-3 pb-3 flex items-center gap-1.5">
                      <ShieldCheck className="w-3 h-3" /> Admin
                    </p>
                    <Link
                      href="/admin/model-requests"
                      className={cn(
                        "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all",
                        pathname === "/admin/model-requests"
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                      )}
                    >
                      <Database className="w-4 h-4 shrink-0" />
                      Model Requests
                    </Link>
                  </div>
                )}
              </nav>

              {/* Bottom */}
              <div className="p-3 space-y-3">
                {!isPro && (
                  <div className="bg-primary rounded-2xl p-5 text-white relative overflow-hidden">
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-2">
                        <Crown className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-widest">Upgrade to Pro</span>
                      </div>
                      <p className="text-xs font-medium text-white/80 mb-4 leading-snug">
                        AI Agents, advanced analytics & unlimited flows.
                      </p>
                      <Link
                        href="/subscription"
                        className="block text-center h-9 text-xs font-bold rounded-full bg-white text-primary hover:bg-white/90 transition-all flex items-center justify-center"
                      >
                        Go Unlimited
                      </Link>
                    </div>
                    <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                  </div>
                )}

                <div className="border-t border-border pt-3">
                  <Link
                    href={`${process.env.NEXT_PUBLIC_APP_AUTH_URL || "http://localhost:3003"}/profile`}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary transition-all"
                  >
                    <div className="w-9 h-9 rounded-xl bg-secondary border border-border flex items-center justify-center text-xs font-bold text-primary shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{displayName}</p>
                      <p className="text-xs text-muted-foreground">{plan} Plan</p>
                    </div>
                    <Settings className="w-4 h-4 text-muted-foreground" />
                  </Link>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
