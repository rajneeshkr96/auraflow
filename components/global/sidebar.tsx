"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Zap, Plug, BarChart3, Settings, CreditCard,
  Sparkles, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Automations", icon: Zap, href: "/automations" },
  { label: "Analytics", icon: BarChart3, href: "/analytics" },
  { label: "Integrations", icon: Plug, href: "/integrations" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col h-full w-[240px] bg-slate-900 text-white shrink-0">
      {/* Brand */}
      <div className="px-5 py-6 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Auraflow</span>
        </div>
        <p className="text-xs text-slate-400 mt-1.5 ml-[2.625rem]">Instagram Automation</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-white/10 text-white"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                  isActive
                    ? "bg-gradient-to-br from-violet-500 to-blue-500 text-white"
                    : "bg-slate-800 text-slate-400 group-hover:text-slate-300"
                )}>
                  <item.icon className="w-4 h-4" />
                </div>
                {item.label}
                {item.label === "Analytics" && (
                  <Badge variant="purple" className="text-[10px] py-0 px-1.5 ml-1">Beta</Badge>
                )}
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
            </Link>
          );
        })}
      </nav>

      {/* Upgrade CTA */}
      <div className="p-3 border-t border-slate-800">
        <div className="bg-gradient-to-br from-violet-600/20 to-blue-600/20 border border-violet-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="text-xs font-bold text-white">Free Plan</span>
          </div>
          <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">Upgrade to unlock AI Agents, analytics & unlimited automations.</p>
          <button className="w-full py-2 text-xs font-bold rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white transition-all">
            Upgrade to Pro
          </button>
        </div>

        {/* User */}
        <div className="flex items-center gap-3 mt-3 px-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            U
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">My Account</p>
            <p className="text-[10px] text-slate-400 truncate">Free plan</p>
          </div>
          <Link href="/settings" className="text-slate-500 hover:text-slate-300 transition-colors">
            <Settings className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
