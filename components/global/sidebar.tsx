"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Activity, CreditCard, Home, LayoutList, Settings, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

// Assuming standard shadcn/tailwind setup
// Using a simple sidebar design

const items = [
    { label: "Overview", icon: Home, href: "/dashboard" },
    { label: "Automations", icon: Activity, href: "/automations" },
    { label: "Integrations", icon: Shield, href: "/integrations" },
    { label: "Settings", icon: Settings, href: "/settings" },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-full w-[250px] border-r bg-white text-slate-900 hidden md:flex">
            <div className="p-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Auraflow
                </h1>
            </div>
            <nav className="flex-1 px-4 space-y-2">
                {items.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium",
                                isActive
                                    ? "bg-slate-100 text-blue-600"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5", isActive ? "text-blue-600" : "text-slate-400")} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4 border-t">
                {/* Footer info or upgrade CTA */}
                <div className="bg-blue-50 p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-bold text-blue-900">Free Plan</span>
                    </div>
                    <p className="text-xs text-blue-600/80 mb-3">Upgrade to enable AI Agents</p>
                </div>
            </div>
        </div>
    );
}
