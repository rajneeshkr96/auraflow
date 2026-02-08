"use client";

import DashboardNav from '@/components/dashboard/DashboardNav';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AnalyticsPage() {
    return (
        <div className="min-h-screen bg-slate-50">
            <DashboardNav />

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Back Button */}
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 mb-6">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-black text-slate-900 mb-2">Analytics</h1>
                    <p className="text-slate-500 font-medium">Track your performance metrics and insights</p>
                </motion.div>

                {/* Coming Soon Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-slate-200 rounded-2xl p-12 text-center"
                >
                    <div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <BarChart3 className="w-10 h-10 text-purple-600" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-3">Coming Soon</h2>
                    <p className="text-slate-500 font-medium max-w-md mx-auto mb-8">
                        Advanced analytics and reporting features are on the way. You'll be able to track detailed metrics here soon!
                    </p>
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-500 transition-colors"
                    >
                        Return to Dashboard
                    </Link>
                </motion.div>
            </main>
        </div>
    );
}
