"use client";

import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";
import Link from "next/link";

type User = {
  name?: string | null;
  email?: string | null;
}

const BREADCRUMBS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/automations": "Automations",
  "/analytics": "Analytics",
  "/integrations": "Integrations",
  "/subscription": "Subscription",
  "/settings": "Settings",
};

function getBreadcrumb(pathname: string): string {
  if (pathname.match(/^\/automations\/[^/]+$/)) return "Edit Automation";
  for (const [route, label] of Object.entries(BREADCRUMBS)) {
    if (pathname === route || pathname.startsWith(route + "/")) return label;
  }
  return "Dashboard";
}

export default function Infobar({ user }: { user?: User | null }) {
  const pathname = usePathname();
  const breadcrumb = getBreadcrumb(pathname);

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : (user?.email?.[0]?.toUpperCase() || 'U');

  return (
    <header className="h-20 bg-background border-b border-border flex items-center justify-between px-10 z-10 shrink-0">
      <div className="flex items-center gap-3 text-sm">
        <span className="text-muted-foreground font-bold tracking-tight uppercase text-[10px]">Auraflow</span>
        <span className="text-muted-foreground/30 font-light">/</span>
        <span className="text-foreground font-bold tracking-tight">{breadcrumb}</span>
      </div>

      <div className="flex items-center gap-6">
        {/* Search */}
        <div className="hidden lg:flex items-center gap-3 px-4 py-2.5 text-xs text-muted-foreground bg-secondary/50 border border-border rounded-full cursor-pointer hover:border-primary/20 transition-all w-72 group">
          <Search className="w-4 h-4 group-hover:text-primary transition-colors" />
          <span className="font-bold">Search everything...</span>
          <span className="ml-auto font-bold text-[10px] bg-background border border-border rounded-lg px-2 py-0.5 text-muted-foreground">⌘K</span>
        </div>

        {/* Notifications */}
        <button className="relative w-11 h-11 rounded-2xl bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/20 transition-all group">
          <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full border-2 border-background" />
        </button>

        {/* Avatar Mobile */}
        <Link
          href={`${process.env.NEXT_PUBLIC_APP_AUTH_URL || "http://localhost:3003"}/profile`}
          className="w-11 h-11 rounded-2xl bg-primary flex items-center justify-center text-white font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
        >
          {initials}
        </Link>
      </div>
    </header>
  );
}
