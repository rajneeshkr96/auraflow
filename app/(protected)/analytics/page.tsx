"use client";

import { motion } from 'framer-motion';
import { BarChart3, Zap, TrendingUp, MessageSquare, Send, Bot, ArrowUpRight, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@codeswayam/ui';
import { Badge } from '@codeswayam/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data (connected to real data when API adds /automations/stats)
const weeklyData = [
  { day: 'Mon', triggers: 24, replies: 20, dms: 8 },
  { day: 'Tue', triggers: 38, replies: 35, dms: 14 },
  { day: 'Wed', triggers: 18, replies: 16, dms: 6 },
  { day: 'Thu', triggers: 52, replies: 48, dms: 22 },
  { day: 'Fri', triggers: 64, replies: 58, dms: 30 },
  { day: 'Sat', triggers: 42, replies: 38, dms: 18 },
  { day: 'Sun', triggers: 30, replies: 27, dms: 12 },
];

const maxVal = Math.max(...weeklyData.map(d => d.triggers));

const metrics = [
  { label: 'Total Triggers', value: '268', change: '+14% this week', positive: true, icon: Zap, gradient: 'from-violet-500 to-blue-500' },
  { label: 'Replies Sent', value: '242', change: '+12% this week', positive: true, icon: MessageSquare, gradient: 'from-emerald-500 to-teal-500' },
  { label: 'DMs Sent', value: '110', change: '+8% this week', positive: true, icon: Send, gradient: 'from-blue-500 to-cyan-500' },
  { label: 'Avg. Response Rate', value: '90.3%', change: '+2.1% from last week', positive: true, icon: TrendingUp, gradient: 'from-orange-500 to-pink-500' },
];

export default function AnalyticsPage() {
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

      {/* Metric Cards Bento Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, i) => (
          <div key={m.label} className="bg-white border border-border rounded-[40px] p-8 group hover:border-primary/30 transition-all duration-300">
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
          </div>
        ))}
      </div>

      {/* Main Chart Card */}
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
                    const pct = (val / maxVal) * 100;
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

      {/* Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Tips */}
        <div className="bg-white border border-border rounded-[48px] p-10">
           <h3 className="text-2xl font-bold tracking-tighter mb-8 flex items-center gap-3">
              <Bot className="w-6 h-6 text-primary" /> Expert Insights
           </h3>
           <div className="space-y-6">
              {[
                { tip: 'Add AI Agent to boost reply quality', badge: 'Pro' },
                { tip: 'Use specific keywords for better targeting', badge: null },
                { tip: 'Send DMs on comments to maximize leads', badge: null },
              ].map((item) => (
                <div key={item.tip} className="flex items-center gap-6 p-4 rounded-3xl hover:bg-secondary transition-colors group">
                  <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center shrink-0 group-hover:bg-background transition-colors">
                    <Info className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex items-center gap-3 flex-1">
                    <p className="font-bold text-foreground">{item.tip}</p>
                    {item.badge && <span className="text-[10px] font-bold text-white bg-primary px-2 py-0.5 rounded-full uppercase tracking-widest">{item.badge}</span>}
                  </div>
                </div>
              ))}
           </div>
        </div>

        {/* Future */}
        <div className="bg-foreground text-background rounded-[48px] p-10 overflow-hidden relative group">
           <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                 <BarChart3 className="w-6 h-6 text-primary" />
                 <h3 className="text-2xl font-bold tracking-tighter">Advanced Tracking</h3>
              </div>
              <p className="text-background/60 font-medium mb-8 text-lg leading-relaxed">
                 Per-automation breakdown, conversion rates, and deep lead funnel tracking are landing soon.
              </p>
              <div className="grid grid-cols-2 gap-4">
                 {['Keyword Analysis', 'Funnel Tracking', 'A/B Testing', 'ROI Calculator'].map(f => (
                   <div key={f} className="flex items-center gap-3 text-sm font-bold text-background/80">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                      {f}
                   </div>
                 ))}
              </div>
           </div>
           <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
        </div>
      </div>
    </motion.div>
  );
}
