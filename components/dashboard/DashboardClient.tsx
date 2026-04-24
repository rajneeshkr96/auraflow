"use client";

import { motion } from 'framer-motion';
import { Zap, Users, MessageSquare, TrendingUp, Plus, ArrowRight, Instagram, CheckCircle2, Circle, BarChart3, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@codeswayam/ui';
import { Badge } from '@codeswayam/ui';
import UsageMeter from './UsageMeter';

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
    { label: 'Total Automations', value: String(stats.totalAutomations), icon: Zap },
    { label: 'Active Automations', value: String(stats.activeAutomations), icon: TrendingUp },
    { label: 'Triggers Processed', value: String(stats.totalTriggers || 0), icon: MessageSquare },
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
      className="space-y-12 w-full"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-end justify-between">
        <div>
           <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Live Overview</span>
           </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground tracking-tighter leading-none">
            Welcome back, <br />
            <span className="text-muted-foreground">{firstName}.</span>
          </h1>
        </div>
        <Link
          href="/automations/new"
          className="hidden sm:flex items-center gap-2 px-10 h-16 bg-primary text-white text-lg font-bold rounded-full transition-all shadow-xl shadow-primary/20 hover:scale-105 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Create Automation
        </Link>
      </motion.div>

      {/* Stats Bento Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <div key={card.label} className="bg-white border border-border rounded-[40px] p-8 group hover:border-primary/30 transition-all duration-300">
             <div className="flex items-center justify-between mb-8">
                <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                   <card.icon className="w-6 h-6" />
                </div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Real-time</div>
             </div>
             <div className="text-5xl font-bold tracking-tighter text-foreground mb-2">{card.value}</div>
             <div className="text-sm font-bold text-muted-foreground">{card.label}</div>
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Automations */}
        <motion.div variants={itemVariants} className="lg:col-span-8">
           <div className="flex items-center justify-between mb-8 px-4">
              <h2 className="text-2xl font-bold tracking-tighter">Recent Automations</h2>
              <Link href="/automations" className="text-sm font-bold text-primary flex items-center gap-1 group">
                See all <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
           </div>
           <div className="bg-white border border-border rounded-[48px] p-4">
              {recentAutomations.length === 0 ? (
                <div className="text-center py-20">
                   <div className="w-20 h-20 bg-secondary rounded-[32px] flex items-center justify-center mx-auto mb-6">
                      <Zap className="w-10 h-10 text-muted-foreground/30" />
                   </div>
                   <p className="text-lg font-bold text-muted-foreground">No automations found.</p>
                   <Link href="/automations/new" className="text-primary font-bold text-sm mt-2 block">Create your first flow →</Link>
                </div>
              ) : (
                <div className="space-y-2">
                   {recentAutomations.map((automation: any) => (
                     <Link
                       key={automation.id}
                       href={`/automations/${automation.id}`}
                       className="flex items-center justify-between p-6 rounded-[32px] hover:bg-secondary transition-all group"
                     >
                        <div className="flex items-center gap-6">
                           <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${automation.active ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'}`}>
                              <Zap className="w-6 h-6" />
                           </div>
                           <div>
                              <p className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors truncate max-w-xs">
                                 {automation.name || 'Untitled Flow'}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                 {automation.active ? (
                                   <span className="text-[10px] font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-widest">Active</span>
                                 ) : (
                                   <span className="text-[10px] font-bold text-muted-foreground bg-muted/10 px-3 py-1 rounded-full uppercase tracking-widest">Paused</span>
                                 )}
                              </div>
                           </div>
                        </div>
                        <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                     </Link>
                   ))}
                </div>
              )}
           </div>
        </motion.div>

        {/* Sidebar Widgets */}
        <motion.div variants={itemVariants} className="lg:col-span-4 space-y-8">
           {/* Onboarding */}
           <div className="bg-foreground text-background rounded-[48px] p-10 overflow-hidden relative group">
              <div className="relative z-10">
                 <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold tracking-tighter">Setup Guide</h3>
                    <span className="text-xs font-bold opacity-50">{onboardingComplete}/{onboardingSteps.length}</span>
                 </div>
                 <div className="space-y-6 mb-10">
                    {onboardingSteps.map((step) => (
                       <div key={step.label} className="flex items-start gap-4">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${step.done ? 'bg-primary text-white' : 'bg-white/10 text-white/30'}`}>
                             {step.done ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                          </div>
                          <span className={`text-sm font-bold ${step.done ? 'opacity-30 line-through' : 'opacity-90'}`}>{step.label}</span>
                       </div>
                    ))}
                 </div>
                 <div className="w-full h-1 bg-white/10 rounded-full mb-8">
                    <motion.div 
                       initial={{ width: 0 }}
                       animate={{ width: `${(onboardingComplete / onboardingSteps.length) * 100}%` }}
                       className="h-full bg-primary rounded-full"
                    />
                 </div>
                 <Link href="/integrations" className="h-14 w-full bg-white text-foreground rounded-full flex items-center justify-center gap-2 font-bold text-sm hover:scale-105 active:scale-95 transition-all">
                    {instagramConnected ? 'View Integrations' : 'Connect Instagram'}
                    <ChevronRight className="w-4 h-4" />
                 </Link>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
           </div>

           {/* Usage */}
           <div className="bg-white border border-border rounded-[48px] p-10">
              <UsageMeter
                planTier={user?.planTier || 'free'}
                usageLimits={user?.usageLimits}
                usage={{
                  aiResponses: stats.totalReplies || 0,
                  automations: stats.totalAutomations || 0,
                  connections: user?.integrations?.length || 0,
                }}
                authUrl={process.env.NEXT_PUBLIC_APP_AUTH_URL}
              />
           </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
