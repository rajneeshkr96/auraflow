"use client";

import { motion } from 'framer-motion';
import { BarChart3, Zap, TrendingUp, MessageSquare, Send, Bot, Info } from 'lucide-react';
import { Badge } from '@codeswayam/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AnalyticsData {
  stats: {
    triggers: { current: number; change: number };
    dms: { current: number; change: number };
    comments: { current: number; change: number };
    conversions: { current: number; change: number };
    responseRate: { current: number; change: number };
  };
  weeklyData: Array<{
    day: string;
    triggers: number;
    replies: number;
    dms: number;
    conversions: number;
  }>;
  performance: Array<{
    id: string;
    name: string;
    triggers: number;
    responses: number;
    conversions: number;
    responseRate: number;
    conversionRate: number;
  }>;
}

interface RealAnalyticsProps {
  data: AnalyticsData | null;
}

export default function RealAnalytics({ data }: RealAnalyticsProps) {
  if (!data) {
    return (
      <div className="space-y-8 w-full">
        <div className="animate-pulse">
          <div className="h-8 bg-secondary rounded w-1/3 mb-4" />
          <div className="h-16 bg-secondary rounded w-2/3" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white border border-border rounded-[40px] p-8">
              <div className="animate-pulse space-y-4">
                <div className="h-12 w-12 bg-secondary rounded-2xl" />
                <div className="h-8 bg-secondary rounded w-3/4" />
                <div className="h-4 bg-secondary rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const { stats, weeklyData, performance } = data;
  const maxVal = Math.max(...weeklyData.map(d => Math.max(d.triggers, d.replies, d.dms)));

  const metrics = [
    { 
      label: 'Total Triggers', 
      value: stats.triggers.current.toString(), 
      change: `${stats.triggers.change >= 0 ? '+' : ''}${stats.triggers.change}% this week`, 
      positive: stats.triggers.change >= 0, 
      icon: Zap 
    },
    { 
      label: 'Replies Sent', 
      value: (stats.dms.current + stats.comments.current).toString(), 
      change: `${stats.dms.change >= 0 ? '+' : ''}${Math.round((stats.dms.change + stats.comments.change) / 2)}% this week`, 
      positive: stats.dms.change >= 0, 
      icon: MessageSquare 
    },
    { 
      label: 'DMs Sent', 
      value: stats.dms.current.toString(), 
      change: `${stats.dms.change >= 0 ? '+' : ''}${stats.dms.change}% this week`, 
      positive: stats.dms.change >= 0, 
      icon: Send 
    },
    { 
      label: 'Response Rate', 
      value: `${stats.responseRate.current}%`, 
      change: `${stats.responseRate.change >= 0 ? '+' : ''}${stats.responseRate.change}% from last week`, 
      positive: stats.responseRate.change >= 0, 
      icon: TrendingUp 
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12 w-full"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row items-end justify-between gap-8">
        <div>
           <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Growth Insights</span>
           </div>
          <h1 className="text-5xl md:text-7xl font-bold text-foreground tracking-tighter leading-none">
            Performance <br />
            <span className="text-muted-foreground">Analytics.</span>
          </h1>
        </div>
        <div className="flex items-center gap-2 px-6 h-12 bg-secondary border border-border rounded-full text-xs font-bold uppercase tracking-widest text-muted-foreground">
          <BarChart3 className="w-4 h-4 mr-2" /> Last 7 Days
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, i) => (
          <motion.div 
            key={m.label} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white border border-border rounded-[40px] p-8 group hover:border-primary/30 transition-all duration-300"
          >
             <div className="flex items-center justify-between mb-8">
                <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                   <m.icon className="w-6 h-6" />
                </div>
                <div className={`flex items-center gap-1 text-[10px] font-bold ${m.positive ? 'text-emerald-600' : 'text-red-500'}`}>
                    {m.change.split(' ')[0]}
                </div>
             </div>
             <div className="text-5xl font-bold tracking-tighter text-foreground mb-2">{m.value}</div>
             <div className="text-sm font-bold text-muted-foreground">{m.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Weekly Chart */}
      <div className="bg-white border border-border rounded-[48px] p-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
             <div>
                <h2 className="text-3xl font-bold tracking-tighter mb-2">Weekly Activity</h2>
                <p className="text-muted-foreground font-medium">Triggers, replies and DMs sent over the last 7 days.</p>
             </div>
             <Tabs defaultValue="triggers" className="w-full md:w-auto">
                <TabsList className="h-14 bg-secondary p-1 rounded-full border border-border">
                   {['triggers', 'replies', 'dms'].map(v => (
                      <TabsTrigger key={v} value={v} className="rounded-full px-8 h-full font-bold uppercase text-[10px] tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-sm">
                         {v}
                      </TabsTrigger>
                   ))}
                </TabsList>
             </Tabs>
          </div>

          <Tabs defaultValue="triggers" className="w-full">
            {(['triggers', 'replies', 'dms'] as const).map(key => (
              <TabsContent key={key} value={key}>
                <div className="flex items-end gap-3 h-64 px-4">
                  {weeklyData.map((d) => {
                    const val = d[key];
                    const pct = maxVal > 0 ? (val / maxVal) * 100 : 0;
                    return (
                      <div key={d.day} className="flex flex-col items-center gap-4 flex-1 group">
                        <div className="relative w-full flex flex-col items-center">
                           <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${pct}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                              className="w-full max-w-[40px] rounded-2xl bg-primary/20 group-hover:bg-primary transition-colors cursor-pointer relative"
                           >
                              <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background px-3 py-1 rounded-lg text-xs font-bold">
                                 {val}
                              </div>
                           </motion.div>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{d.day}</span>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            ))}
          </Tabs>
      </div>

      {/* Performance & Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Automation Performance */}
        <div className="bg-white border border-border rounded-[48px] p-10">
           <h3 className="text-2xl font-bold tracking-tighter mb-8 flex items-center gap-3">
              <Zap className="w-6 h-6 text-primary" /> Top Automations
           </h3>
           <div className="space-y-4">
              {performance.slice(0, 5).map((automation) => (
                <div key={automation.id} className="flex items-center justify-between p-4 rounded-3xl hover:bg-secondary transition-colors">
                  <div>
                    <p className="font-bold text-foreground">{automation.name}</p>
                    <p className="text-xs text-muted-foreground">{automation.triggers} triggers • {automation.responseRate}% response rate</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {automation.conversions} conversions
                  </Badge>
                </div>
              ))}
              {performance.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No automation data yet</p>
                </div>
              )}
           </div>
        </div>

        {/* Tips */}
        <div className="bg-foreground text-background rounded-[48px] p-10 overflow-hidden relative group">
           <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                 <Bot className="w-6 h-6 text-primary" />
                 <h3 className="text-2xl font-bold tracking-tighter">Expert Insights</h3>
              </div>
              <div className="space-y-4 mb-8">
                 {[
                   'Add AI Agent to boost reply quality',
                   'Use specific keywords for better targeting', 
                   'Send DMs on comments to maximize leads'
                 ].map((tip) => (
                   <div key={tip} className="flex items-center gap-3 text-sm font-bold text-background/80">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                      {tip}
                   </div>
                 ))}
              </div>
              <p className="text-background/60 font-medium text-sm">
                 Advanced analytics features like conversion tracking and A/B testing are coming soon.
              </p>
           </div>
           <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
        </div>
      </div>
    </motion.div>
  );
}