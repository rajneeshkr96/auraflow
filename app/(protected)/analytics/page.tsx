"use client";

import { motion } from 'framer-motion';
import { BarChart3, Zap, TrendingUp, MessageSquare, Send, Bot, ArrowUpRight, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 w-full"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
          <p className="text-slate-500 text-sm mt-0.5">Track your automation performance and engagement metrics.</p>
        </div>
        <Badge variant="purple" className="flex items-center gap-1.5 px-3 py-1.5">
          <BarChart3 className="w-3.5 h-3.5" /> Last 7 days
        </Badge>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <Card key={m.label} className="border-0 shadow-sm overflow-hidden">
            <CardContent className="p-5">
              <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br from-opacity-10 to-opacity-5 mb-3`}>
                <div className={`p-1.5 rounded-lg bg-gradient-to-br ${m.gradient}`}>
                  <m.icon className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              <p className="text-3xl font-black text-slate-900">{m.value}</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">{m.label}</p>
              <div className={`flex items-center gap-1 mt-2 text-[11px] font-semibold ${m.positive ? 'text-emerald-600' : 'text-red-500'}`}>
                <ArrowUpRight className={`w-3 h-3 ${!m.positive ? 'rotate-180' : ''}`} />
                {m.change}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Weekly Activity</CardTitle>
          <CardDescription>Triggers, replies and DMs sent over the last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="triggers">
            <TabsList className="mb-4">
              <TabsTrigger value="triggers">Triggers</TabsTrigger>
              <TabsTrigger value="replies">Replies</TabsTrigger>
              <TabsTrigger value="dms">DMs</TabsTrigger>
            </TabsList>
            {(['triggers', 'replies', 'dms'] as const).map(key => (
              <TabsContent key={key} value={key}>
                <div className="flex items-end gap-2 h-40">
                  {weeklyData.map((d) => {
                    const val = d[key];
                    const pct = (val / maxVal) * 100;
                    return (
                      <div key={d.day} className="flex flex-col items-center gap-1.5 flex-1">
                        <span className="text-[10px] font-bold text-slate-500">{val}</span>
                        <div
                          className="w-full rounded-lg bg-gradient-to-t from-violet-600 to-blue-500 transition-all"
                          style={{ height: `${pct}%`, minHeight: 4 }}
                        />
                        <span className="text-[10px] text-slate-400 font-medium">{d.day}</span>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Performance Tips + Empty State */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bot className="w-4 h-4 text-violet-500" /> Performance Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { tip: 'Add AI Agent to boost reply quality', badge: 'Pro' },
              { tip: 'Use specific keywords for better targeting', badge: null },
              { tip: 'Send DMs on comments to maximize leads', badge: null },
            ].map((item) => (
              <div key={item.tip} className="flex items-start gap-2.5">
                <div className="w-5 h-5 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Info className="w-3 h-3 text-violet-600" />
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <p className="text-xs text-slate-600">{item.tip}</p>
                  {item.badge && <Badge variant="purple" className="text-[9px] py-0 px-1.5">{item.badge}</Badge>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-slate-900 to-slate-800 text-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-5 h-5 text-violet-400" />
              <h3 className="font-bold">Detailed Analytics</h3>
              <Badge className="bg-white/10 text-white border-white/20 text-[10px]">Coming Soon</Badge>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              Per-automation breakdown, conversion rates, best-performing keywords and lead tracking are on the way.
            </p>
            <div className="space-y-2">
              {['Per-automation metrics', 'Keyword performance', 'Lead funnel tracking', 'A/B reply testing'].map(f => (
                <div key={f} className="flex items-center gap-2 text-xs text-slate-400">
                  <div className="w-1.5 h-1.5 bg-violet-400 rounded-full" />
                  {f}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
