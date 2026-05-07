"use client";

import { LayoutGrid, LogOut } from 'lucide-react';
import Link from 'next/link';

const AUTH_URL = process.env.NEXT_PUBLIC_APP_AUTH_URL || 'http://localhost:3003';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function DashboardNav() {
    const handleLogout = async () => {
        // Call backend to clear HttpOnly cookie server-side
        await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include',
        }).catch(() => {});
        // Clear cookie client-side as fallback
        document.cookie = 'Authentication=; path=/; max-age=0';
        // Redirect to central auth login
        window.location.href = `${AUTH_URL}/login`;
    };

    return (
        <nav className="border-b border-slate-200 bg-white sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <LayoutGrid className="text-white w-5 h-5" />
                        </div>
                        <span className="text-lg font-bold tracking-tight">Auraflow</span>
                    </Link>

                    {/* User Menu */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleLogout}
                            className="p-2 text-slate-500 hover:text-slate-900 transition-colors"
                            title="Log Out"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
