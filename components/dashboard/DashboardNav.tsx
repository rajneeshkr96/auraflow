"use client";

import { LayoutGrid, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function DashboardNav() {
    const handleLogout = () => {
        // Redirect to central auth logout
        window.location.href = `http://localhost:3003/login?redirect=${encodeURIComponent(window.location.origin)}`;
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
