"use client";

import { Plus, BarChart3, Settings, Instagram } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface ActionCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    href: string;
    color: string;
}

function ActionCard({ title, description, icon, href, color }: ActionCardProps) {
    return (
        <Link href={href}>
            <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all cursor-pointer group"
            >
                <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    {icon}
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 font-medium">{description}</p>
            </motion.div>
        </Link>
    );
}

export default function QuickActions() {
    const actions = [
        {
            title: 'Create Automation',
            description: 'Set up a new Instagram automation workflow',
            icon: <Plus className="w-6 h-6 text-white" />,
            href: '/automations/new',
            color: 'bg-indigo-600',
        },
        {
            title: 'View Analytics',
            description: 'Check your performance metrics and insights',
            icon: <BarChart3 className="w-6 h-6 text-white" />,
            href: '/analytics',
            color: 'bg-purple-600',
        },
        {
            title: 'Connect Instagram',
            description: 'Link your Instagram account to get started',
            icon: <Instagram className="w-6 h-6 text-white" />,
            href: '/integrations',
            color: 'bg-pink-600',
        },
        {
            title: 'Settings',
            description: 'Manage your account and preferences',
            icon: <Settings className="w-6 h-6 text-white" />,
            href: '/settings',
            color: 'bg-slate-900',
        },
    ];

    return (
        <div>
            <h2 className="text-xl font-black text-slate-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {actions.map((action, index) => (
                    <motion.div
                        key={action.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                    >
                        <ActionCard {...action} />
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
