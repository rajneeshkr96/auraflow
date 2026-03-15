"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Zap, Plug, BarChart3, Settings, CreditCard,
  Sparkles, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type User = {
  id?: number;
  name?: string | null;
  email?: string | null;
  subscription?: { plan?: string } | null;
}

const appNavItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Automations", icon: Zap, href: "/automations" },
  { label: "Analytics", icon: BarChart3, href: "/analytics" },
  { label: "Integrations", icon: Plug, href: "/integrations" },
];

export default function Sidebar({ user }: { user?: User | null }) {
  const pathname = usePathname();

  const displayName = user?.name || user?.email?.split('@')[0] || 'My Account';
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : (user?.email?.[0]?.toUpperCase() || 'U');
  const plan = user?.subscription?.plan || 'Free';

  return (
    <aside className="flex flex-col h-full w-65 bg-slate-950 text-white shrink-0 border-r border-white/5">
      {/* Brand */}
      <div className="px-6 py-7 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-linear-to-br from-violet-500 to-blue-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-violet-500/20">
            <Sparkles className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight">Auraflow</span>
            <p className="text-[10px] text-slate-500 font-medium -mt-0.5">Instagram Automation</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-5 px-3 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-3 mb-3">Navigation</p>
        {appNavItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-white/8 text-white shadow-sm"
                  : "text-slate-500 hover:bg-white/4 hover:text-slate-300"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200",
                  isActive
                    ? "bg-linear-to-br from-violet-500 to-blue-500 text-white shadow-md shadow-violet-500/25"
                    : "bg-white/6 text-slate-500 group-hover:text-slate-400 group-hover:bg-white/8"
                )}>
                  <item.icon className="w-4 h-4" />
                </div>
                {item.label}
                {item.label === "Analytics" && (
                  <Badge variant="purple" className="text-[10px] py-0 px-1.5 ml-1">Beta</Badge>
                )}
              </div>
              {isActive && <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />}
            </Link>
          );
        })}
      </nav>

      {/* Upgrade CTA */}
      <div className="p-3 border-t border-white/5">
        <div className="bg-linear-to-br from-violet-600/15 to-blue-600/10 border border-violet-500/15 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-[11px] font-bold text-white/90">{plan} Plan</span>
          </div>
          <p className="text-[10px] text-slate-500 mb-3 leading-relaxed">Upgrade to unlock AI Agents, analytics & unlimited automations.</p>
          <button className="w-full py-2 text-[11px] font-bold rounded-lg bg-linear-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white transition-all shadow-md shadow-violet-500/20 hover:shadow-lg hover:shadow-violet-500/25 active:scale-[0.98]">
            Upgrade to Pro
          </button>
        </div>

        {/* User */}
        <div className="flex items-center gap-3 mt-3 px-2 py-2 rounded-xl hover:bg-white/4 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-violet-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white/90 truncate">{displayName}</p>
            <p className="text-[10px] text-slate-600 truncate">{plan} plan</p>
          </div>
          <a href={`${process.env.NEXT_PUBLIC_APP_AUTH_URL || "http://localhost:3003"}/profile`} className="text-slate-600 hover:text-slate-400 transition-colors" target="_blank" rel="noopener noreferrer">
            <Settings className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </aside>
  );
}
