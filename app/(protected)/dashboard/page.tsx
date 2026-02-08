"use client";

import { useUser } from '@clerk/nextjs';
import DashboardNav from '@/components/dashboard/DashboardNav';
import DashboardStats from '@/components/dashboard/DashboardStats';
import QuickActions from '@/components/dashboard/QuickActions';
import RecentActivity from '@/components/dashboard/RecentActivity';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* DashboardNav handled by Layout */}

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-black text-slate-900 mb-2">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ''}! 👋
          </h1>
          <p className="text-slate-500 font-medium">
            Here's what's happening with your Instagram automations today.
          </p>
        </motion.div>

        {/* Stats Section */}
        <div className="mb-8">
          <DashboardStats />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <QuickActions />
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentActivity />
          </div>

          {/* Getting Started Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white"
          >
            <h3 className="text-xl font-black mb-3">Getting Started</h3>
            <p className="text-sm text-indigo-100 font-medium mb-6">
              Complete these steps to maximize your Instagram automation.
            </p>

            <div className="space-y-3">
              {[
                { label: 'Connect Instagram', done: false },
                { label: 'Create first automation', done: false },
                { label: 'Set up AI Closer Agent', done: false },
              ].map((step, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 ${step.done ? 'bg-white border-white' : 'border-white/50'
                    }`} />
                  <span className="text-sm font-medium">{step.label}</span>
                </div>
              ))}
            </div>

            <button className="w-full mt-6 py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-colors">
              Get Started
            </button>
          </motion.div>
        </div>
      </main>
    </div>
  );
}