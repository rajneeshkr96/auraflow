"use client";

import { Clock, Zap, User } from 'lucide-react';
import { motion } from 'framer-motion';

interface ActivityItem {
    id: string;
    type: 'automation' | 'lead' | 'message';
    title: string;
    description: string;
    time: string;
}

export default function RecentActivity() {
    const activities: ActivityItem[] = [
        {
            id: '1',
            type: 'lead',
            title: 'New lead captured',
            description: '@fitness_daily responded to "GROWTH" keyword',
            time: '5 minutes ago',
        },
        {
            id: '2',
            type: 'automation',
            title: 'Automation triggered',
            description: 'AI Closer Agent sent welcome message',
            time: '12 minutes ago',
        },
        {
            id: '3',
            type: 'lead',
            title: 'New lead captured',
            description: '@wellness_coach commented on your post',
            time: '1 hour ago',
        },
        {
            id: '4',
            type: 'message',
            title: 'Message sent',
            description: 'eBook link delivered to @tech_reviews',
            time: '2 hours ago',
        },
    ];

    const getIcon = (type: ActivityItem['type']) => {
        switch (type) {
            case 'automation':
                return <Zap className="w-4 h-4" />;
            case 'lead':
                return <User className="w-4 h-4" />;
            case 'message':
                return <Clock className="w-4 h-4" />;
        }
    };

    const getColor = (type: ActivityItem['type']) => {
        switch (type) {
            case 'automation':
                return 'bg-indigo-100 text-indigo-600';
            case 'lead':
                return 'bg-green-100 text-green-600';
            case 'message':
                return 'bg-purple-100 text-purple-600';
        }
    };

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h2 className="text-xl font-black text-slate-900 mb-6">Recent Activity</h2>

            <div className="space-y-4">
                {activities.map((activity, index) => (
                    <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="flex items-start gap-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0"
                    >
                        <div className={`p-2 rounded-lg ${getColor(activity.type)}`}>
                            {getIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-slate-900">{activity.title}</div>
                            <div className="text-xs text-slate-500 font-medium mt-1">{activity.description}</div>
                        </div>
                        <div className="text-xs text-slate-400 font-medium whitespace-nowrap">{activity.time}</div>
                    </motion.div>
                ))}
            </div>

            <button className="w-full mt-6 py-3 text-sm font-bold text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">
                View All Activity
            </button>
        </div>
    );
}
