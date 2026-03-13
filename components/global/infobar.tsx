"use client";

import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";
import Link from "next/link";

const BREADCRUMBS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/automations": "Automations",
  "/analytics": "Analytics",
  "/integrations": "Integrations",
  "/settings": "Settings",
};

function getBreadcrumb(pathname: string): string {
  if (pathname.match(/^\/automations\/[^/]+$/)) return "Edit Automation";
  for (const [route, label] of Object.entries(BREADCRUMBS)) {
    if (pathname === route || pathname.startsWith(route + "/")) return label;
  }
  return "Dashboard";
}

export default function Infobar() {
  const pathname = usePathname();
  const breadcrumb = getBreadcrumb(pathname);

  return (
    <header className="h-16 glass border-b border-slate-200/60 flex items-center justify-between px-6 z-10 shrink-0">
      <div className="flex items-center gap-3">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-400 font-medium">Auraflow</span>
          <span className="text-slate-200">/</span>
          <span className="text-slate-800 font-semibold">{breadcrumb}</span>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Search */}
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 text-xs text-slate-400 bg-slate-50/80 border border-slate-200/60 rounded-xl cursor-pointer hover:border-slate-300 hover:bg-slate-100/60 transition-all w-52">
          <Search className="w-3.5 h-3.5" />
          <span>Quick search...</span>
          <span className="ml-auto font-mono text-[10px] bg-white rounded-md px-1.5 py-0.5 border border-slate-200 text-slate-500">⌘K</span>
        </div>

        {/* Notifications */}
        <button className="relative w-9 h-9 rounded-xl bg-slate-50/80 border border-slate-200/60 flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:border-slate-300 transition-all">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-500 rounded-full border-2 border-white animate-pulse" />
        </button>

        {/* Avatar */}
        <Link
          href={`${process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:3003"}/profile`}
          className="w-9 h-9 rounded-xl bg-linear-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm hover:shadow-lg hover:shadow-violet-500/20 transition-all active:scale-95"
        >
          U
        </Link>
      </div>
    </header>
  );
}
