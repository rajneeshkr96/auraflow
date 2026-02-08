"use client";

import { TrendingUp, Users, Zap, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
    title: string;
    value: string;
    change: string;
    icon: React.ReactNode;
    trend: 'up' | 'down';
}

function StatCard({ title, value, change, icon, trend }: StatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-shadow"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                    {icon}
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                    }`}>
                    <TrendingUp className={`w-3 h-3 ${trend === 'down' ? 'rotate-180' : ''}`} />
                    {change}
                </div>
            </div>
            <div className="space-y-1">
                <div className="text-3xl font-black text-slate-900">{value}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</div>
            </div>
        </motion.div>
    );
}

export default function DashboardStats() {
    const stats = [
        {
            title: 'Active Automations',
            value: '12',
            change: '+3 this week',
            icon: <Zap className="w-5 h-5" />,
            trend: 'up' as const,
        },
        {
            title: 'Total Leads',
            value: '847',
            change: '+127 this week',
            icon: <Users className="w-5 h-5" />,
            trend: 'up' as const,
        },
        {
            title: 'Messages Sent',
            value: '2,341',
            change: '+412 this week',
            icon: <MessageSquare className="w-5 h-5" />,
            trend: 'up' as const,
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
                <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                >
                    <StatCard {...stat} />
                </motion.div>
            ))}
        </div>
    );
}
