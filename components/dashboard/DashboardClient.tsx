"use client";

import { motion } from 'framer-motion';
import { Zap, Users, MessageSquare, TrendingUp, Plus, ArrowRight, Instagram, CheckCircle2, Circle, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DashboardProps {
  user: any;
  automations: any[];
  stats: {
    totalAutomations: number;
    activeAutomations: number;
    totalTriggers: number;
    totalReplies: number;
  };
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function DashboardClient({ user, automations, stats }: DashboardProps) {
  const instagramConnected = !!user?.integrations?.find((i: any) => i.name === 'INSTAGRAM');
  const firstName = user?.name?.split(' ')[0] || 'there';

  const statCards = [
    { label: 'Total Automations', value: String(stats.totalAutomations), icon: Zap, gradient: 'from-violet-500 to-blue-500', bg: 'from-violet-50 to-blue-50', change: '' },
    { label: 'Active Automations', value: String(stats.activeAutomations), icon: TrendingUp, gradient: 'from-emerald-500 to-teal-500', bg: 'from-emerald-50 to-teal-50', change: '' },
    { label: 'Triggers Processed', value: String(stats.totalTriggers || 0), icon: MessageSquare, gradient: 'from-orange-500 to-pink-500', bg: 'from-orange-50 to-pink-50', change: '' },
    { label: 'Replies Sent', value: String(stats.totalReplies || 0), icon: Users, gradient: 'from-blue-500 to-cyan-500', bg: 'from-blue-50 to-cyan-50', change: '' },
  ];

  const recentAutomations = automations.slice(0, 5);

  const onboardingSteps = [
    { label: 'Connect Instagram account', done: instagramConnected, href: '/integrations' },
    { label: 'Create your first automation', done: automations.length > 0, href: '/automations/new' },
    { label: 'Set up an AI Closer Agent', done: automations.some((a: any) => a.listener?.listener === 'SMART_AI'), href: '/automations/new' },
  ];
  const onboardingComplete = onboardingSteps.filter(s => s.done).length;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 w-full"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {firstName}! 👋
          </h1>
          <p className="text-slate-500 mt-1.5 text-sm">
            {instagramConnected
              ? "Your Instagram automations are up and running."
              : "Connect your Instagram to get started with automations."}
          </p>
        </div>
        <Link
          href="/automations/new"
          className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-violet-500/20 hover:shadow-xl hover:shadow-violet-500/25 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          New Automation
        </Link>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card key={card.label} className="overflow-hidden border border-slate-200/60 shadow-none hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 group">
            <CardContent className="p-5">
              <div className={`inline-flex p-2.5 rounded-xl bg-linear-to-br ${card.bg} mb-4 group-hover:scale-105 transition-transform duration-300`}>
                <div className={`p-1.5 rounded-lg bg-linear-to-br ${card.gradient} shadow-md`}>
                  <card.icon className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="text-3xl font-black text-slate-900 tracking-tight">{card.value}</p>
              <p className="text-xs text-slate-400 font-medium mt-1">{card.label}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Automations */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="border border-slate-200/60 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-base font-bold tracking-tight">Recent Automations</CardTitle>
              <Link href="/automations" className="text-xs text-violet-600 hover:text-violet-700 font-semibold flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </CardHeader>
            <CardContent className="pt-0">
              {recentAutomations.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <Zap className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">No automations yet</p>
                  <Link href="/automations/new" className="text-xs text-violet-600 hover:underline mt-1 block">
                    Create your first automation →
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentAutomations.map((automation: any) => {
                    const hasDm = automation.trigger?.some((t: any) => t.type === 'DM');
                    const hasComment = automation.trigger?.some((t: any) => t.type === 'COMMENT');
                    const isAI = automation.listener?.listener === 'SMART_AI';
                    return (
                      <Link
                        key={automation.id}
                        href={`/automations/${automation.id}`}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${automation.active ? 'bg-linear-to-br from-violet-500 to-blue-500' : 'bg-slate-100'}`}>
                            <Zap className={`w-4 h-4 ${automation.active ? 'text-white' : 'text-slate-400'}`} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800 group-hover:text-violet-700 transition-colors truncate max-w-45">
                              {automation.name || 'Untitled'}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {hasDm && <Badge variant="info" className="text-[10px] py-0 px-1.5">DM</Badge>}
                              {hasComment && <Badge variant="purple" className="text-[10px] py-0 px-1.5">Comment</Badge>}
                              {isAI && <Badge variant="warning" className="text-[10px] py-0 px-1.5">AI</Badge>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {automation.active ? (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                              Live
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Paused</span>
                          )}
                          <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-violet-400 transition-colors" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Column */}
        <motion.div variants={itemVariants} className="space-y-4">
          {/* Getting Started */}
                    <Card className="border-0 bg-linear-to-br from-slate-950 to-slate-900 text-white overflow-hidden premium-shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold">Getting Started</h3>
                <Badge className="bg-white/10 text-white border-white/20 text-xs">{onboardingComplete}/{onboardingSteps.length}</Badge>
              </div>
              <div className="space-y-3 mb-5">
                {onboardingSteps.map((step) => (
                  <Link key={step.label} href={step.href} className="flex items-start gap-3 group">
                    {step.done
                      ? <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                      : <Circle className="w-5 h-5 text-white/30 mt-0.5 shrink-0 group-hover:text-white/60 transition-colors" />
                    }
                    <span className={`text-sm ${step.done ? 'text-white/50 line-through' : 'text-white/80 group-hover:text-white transition-colors'}`}>
                      {step.label}
                    </span>
                  </Link>
                ))}
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5 mb-4">
                <div
                  className="h-full bg-linear-to-r from-violet-400 to-blue-400 rounded-full transition-all"
                  style={{ width: `${(onboardingComplete / onboardingSteps.length) * 100}%` }}
                />
              </div>
              <Link href="/integrations" className="flex items-center justify-center gap-2 w-full py-2.5 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors">
                {instagramConnected ? <><BarChart3 className="w-4 h-4" /> View Analytics</> : <><Instagram className="w-4 h-4" /> Connect Instagram</>}
              </Link>
            </CardContent>
          </Card>

          {/* Quick Create */}
          <Card className="border border-slate-200/60 shadow-none">
            <CardContent className="p-5">
              <h3 className="font-bold text-slate-800 mb-3 text-sm">Quick Create</h3>
              <div className="space-y-2">
                {[
                  { label: 'Comment Automation', desc: 'Reply to post comments', href: '/automations/new', emoji: '💬' },
                  { label: 'DM Automation', desc: 'Auto-reply to DMs', href: '/automations/new', emoji: '📩' },
                  { label: 'AI Closer Agent', desc: 'AI-powered responses', href: '/automations/new', emoji: '🤖' },
                ].map((item) => (
                  <Link key={item.label} href={item.href} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors group">
                    <span className="text-lg">{item.emoji}</span>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-slate-700 group-hover:text-violet-700 transition-colors">{item.label}</p>
                      <p className="text-[10px] text-slate-400">{item.desc}</p>
                    </div>
                    <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-violet-400 transition-colors" />
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
