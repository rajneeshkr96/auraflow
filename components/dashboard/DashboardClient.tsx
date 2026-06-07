"use client";

import { motion } from 'framer-motion';
import { Zap, Users, MessageSquare, TrendingUp, Plus, ArrowRight, Instagram, CheckCircle2, Circle, BarChart3, ChevronRight, Bot, Sparkles, Crown, Lock } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@codeswayam/ui';
import { Badge } from '@codeswayam/ui';
import UsageMeter from './UsageMeter';
import UsageLimitsBanner from './UsageLimitsBanner';
import { useAuraflowAccess } from '@/lib/use-auraflow-access';

interface DashboardProps {
  user: any;
  automations: any[];
  stats: {
    totalAutomations: number;
    activeAutomations: number;
    totalTriggers: number;
    totalReplies: number;
  };
  usageStats?: {
    automations: number;
    dmsThisMonth: number;
    commentsThisMonth: number;
    triggersThisMonth: number;
    resetDate?: Date | string;
  } | null;
  limits?: {
    automations: number;
    dmsPerMonth: number;
    commentsPerMonth: number;
    triggersPerMonth: number;
  };
  tier?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function DashboardClient({ user, automations, stats, usageStats, limits, tier = 'free' }: DashboardProps) {
  const instagramConnected = !!user?.integrations?.find((i: any) => i.name === 'INSTAGRAM');
  const firstName = user?.name?.split(' ')[0] || 'there';
  const access = useAuraflowAccess();

  const planTier = access.tier;
  const usageLimits = access.limits;

  const statCards = [
    { label: 'Total Automations', value: String(stats.totalAutomations), icon: Zap },
    { label: 'Active', value: String(stats.activeAutomations), icon: TrendingUp },
    { label: 'Triggers', value: String(stats.totalTriggers || 0), icon: MessageSquare },
    { label: 'Replies Sent', value: String(stats.totalReplies || 0), icon: Users },
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
      className="space-y-6 md:space-y-10 w-full"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Live Overview</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tighter leading-none">
            Welcome back, <br />
            <span className="text-muted-foreground">{firstName}.</span>
          </h1>
        </div>
        <Link
          href="/automations/new"
          className="shrink-0 hidden sm:flex items-center gap-2 px-6 md:px-10 h-12 md:h-16 bg-primary text-white text-sm md:text-lg font-bold rounded-full transition-all shadow-xl shadow-primary/20 hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4 md:w-5 md:h-5" />
          <span className="hidden md:inline">Create Automation</span>
          <span className="md:hidden">New Flow</span>
        </Link>
      </motion.div>

      {/* Mobile CTA — only on xs */}
      <motion.div variants={itemVariants} className="sm:hidden">
        <Link
          href="/automations/new"
          className="flex items-center justify-center gap-2 w-full h-12 bg-primary text-white text-sm font-bold rounded-2xl shadow-lg shadow-primary/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Automation
        </Link>
      </motion.div>

      {/* Stats Bento Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white border border-border rounded-[28px] sm:rounded-[36px] md:rounded-[40px] p-5 sm:p-6 md:p-8 group hover:border-primary/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8">
              <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl sm:rounded-2xl bg-secondary flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <card.icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              </div>
              <div className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest hidden sm:block">Real-time</div>
            </div>
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter text-foreground mb-1 sm:mb-2">{card.value}</div>
            <div className="text-xs sm:text-sm font-bold text-muted-foreground leading-snug">{card.label}</div>
          </div>
        ))}
      </motion.div>

      {/* AI Access Status Banner */}
      {access.isLoaded && (
        <motion.div variants={itemVariants}>
          <div className={`rounded-[28px] sm:rounded-[36px] md:rounded-[40px] p-5 sm:p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 ${
            access.aiIncluded
              ? 'bg-foreground text-background'
              : 'bg-white border border-border'
          }`}>
            <div className="flex items-center gap-4 sm:gap-6">
              <div className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 ${
                access.aiIncluded ? 'bg-white/10' : 'bg-primary/10'
              }`}>
                <Bot className={`w-5 h-5 sm:w-7 sm:h-7 ${access.aiIncluded ? 'text-white' : 'text-primary'}`} />
              </div>
              <div>
                <div className="flex items-center gap-2 sm:gap-3 mb-1 flex-wrap">
                  <span className={`text-base sm:text-lg font-bold tracking-tight ${
                    access.aiIncluded ? 'text-white' : 'text-foreground'
                  }`}>
                    AI Agent Status
                  </span>
                  <span className={`text-[9px] sm:text-[10px] font-black px-2 sm:px-3 py-1 rounded-full uppercase tracking-widest ${
                    access.aiIncluded
                      ? 'bg-primary text-white'
                      : 'bg-primary/10 text-primary'
                  }`}>
                    {access.planLabel}
                  </span>
                </div>
                <p className={`text-xs sm:text-sm font-medium ${
                  access.aiIncluded ? 'text-white/60' : 'text-muted-foreground'
                }`}>
                  {access.aiIncluded
                    ? 'AI replies are included — no points deducted.'
                    : `Each AI reply costs ${access.aiCallCost} pts. Balance: ${access.creditBalance.toLocaleString()} pts.`
                  }
                </p>
              </div>
            </div>
            {!access.aiIncluded && (
              <div className="flex items-center gap-2 sm:gap-3 shrink-0 w-full sm:w-auto">
                <Link
                  href="/subscription"
                  className="flex-1 sm:flex-none h-10 sm:h-12 px-4 sm:px-6 rounded-full text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 bg-primary text-white shadow-lg shadow-primary/20"
                >
                  <Crown className="w-4 h-4" />
                  {access.isSubscribed ? 'Upgrade Plan' : 'Get Pro — Free AI'}
                </Link>
                <Link
                  href="/subscription"
                  className="flex-1 sm:flex-none h-10 sm:h-12 px-4 sm:px-6 rounded-full text-xs sm:text-sm font-bold border border-border flex items-center justify-center gap-2 hover:border-primary/30 transition-all"
                >
                  <Sparkles className="w-4 h-4 text-primary" /> Buy Credits
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* Recent Automations */}
        <motion.div variants={itemVariants} className="lg:col-span-8">
          <div className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8 px-1">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tighter">Recent Automations</h2>
            <Link href="/automations" className="text-xs sm:text-sm font-bold text-primary flex items-center gap-1 group">
              See all <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="bg-white border border-border rounded-[28px] sm:rounded-[40px] md:rounded-[48px] p-2 sm:p-3 md:p-4">
            {recentAutomations.length === 0 ? (
              <div className="text-center py-12 sm:py-16 md:py-20">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-secondary rounded-[24px] sm:rounded-[32px] flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground/30" />
                </div>
                <p className="text-base sm:text-lg font-bold text-muted-foreground">No automations found.</p>
                <Link href="/automations/new" className="text-primary font-bold text-sm mt-2 block">
                  Create your first flow →
                </Link>
              </div>
            ) : (
              <div className="space-y-1">
                {recentAutomations.map((automation: any) => (
                  <Link
                    key={automation.id}
                    href={`/automations/${automation.id}`}
                    className="flex items-center justify-between p-3 sm:p-4 md:p-6 rounded-[20px] sm:rounded-[28px] md:rounded-[32px] hover:bg-secondary transition-all group"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 md:gap-6 min-w-0">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all shrink-0 ${
                        automation.active ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'
                      }`}>
                        <Zap className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm sm:text-base md:text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors truncate">
                          {automation.name || 'Untitled Flow'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {automation.active ? (
                            <span className="text-[9px] sm:text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-widest">Active</span>
                          ) : (
                            <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground bg-muted/10 px-2 py-0.5 rounded-full uppercase tracking-widest">Paused</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Sidebar Widgets */}
        <motion.div variants={itemVariants} className="lg:col-span-4 space-y-4 sm:space-y-6 md:space-y-8">
          {/* Onboarding */}
          <div className="bg-foreground text-background rounded-[28px] sm:rounded-[40px] md:rounded-[48px] p-6 sm:p-8 md:p-10 overflow-hidden relative group">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-5 sm:mb-8">
                <h3 className="text-lg sm:text-xl font-bold tracking-tighter">Setup Guide</h3>
                <span className="text-xs font-bold opacity-50">{onboardingComplete}/{onboardingSteps.length}</span>
              </div>
              <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-10">
                {onboardingSteps.map((step) => (
                  <div key={step.label} className="flex items-start gap-3 sm:gap-4">
                    <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      step.done ? 'bg-primary text-white' : 'bg-white/10 text-white/30'
                    }`}>
                      {step.done ? <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" /> : <Circle className="w-3 h-3 sm:w-4 sm:h-4" />}
                    </div>
                    <span className={`text-xs sm:text-sm font-bold ${step.done ? 'opacity-30 line-through' : 'opacity-90'}`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
              <div className="w-full h-1 bg-white/10 rounded-full mb-5 sm:mb-8">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(onboardingComplete / onboardingSteps.length) * 100}%` }}
                  className="h-full bg-primary rounded-full"
                />
              </div>
              <Link
                href="/integrations"
                className="h-12 sm:h-14 w-full bg-white text-foreground rounded-full flex items-center justify-center gap-2 font-bold text-sm hover:scale-105 active:scale-95 transition-all"
              >
                {instagramConnected ? 'View Integrations' : 'Connect Instagram'}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
          </div>

          {/* Usage */}
          <div className="bg-white border border-border rounded-[28px] sm:rounded-[40px] md:rounded-[48px] p-6 sm:p-8 md:p-10">
            {usageStats && limits ? (
              <UsageLimitsBanner usage={usageStats} limits={limits} tier={tier.toUpperCase()} />
            ) : (
              <UsageMeter
                usage={{
                  aiResponses: stats.totalReplies || 0,
                  automations: stats.totalAutomations || 0,
                  connections: user?.integrations?.length || 0,
                }}
              />
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
