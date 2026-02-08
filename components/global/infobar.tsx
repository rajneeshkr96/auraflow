"use client";
import { UserButton } from "@clerk/nextjs";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button"; // Assuming shadcn button exists, otherwise standard html button

export default function Infobar() {
    return (
        <header className="h-16 border-b bg-white flex items-center justify-between px-6 z-10">
            <div className="flex items-center gap-4">
                {/* Mobile Toggle Placeholder */}
                <button className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-md">
                    <Menu className="w-5 h-5" />
                </button>
                <div className="text-sm font-medium text-slate-500">
                    {/* Breadcrumbs placeholder */}
                    Dashboard
                </div>
            </div>
            <div className="flex items-center gap-4">
                <UserButton />
            </div>
        </header>
    );
}
