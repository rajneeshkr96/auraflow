"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Bot, Target, Layout, Inbox, ArrowRight, MessageSquare, Instagram, Sparkles, CheckCircle2, TrendingUp, Cpu, Globe, Lock } from 'lucide-react';

const FeatureGrid: React.FC = () => {
  return (
    <section id="features" className="py-32 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-left mb-20"
        >
          <h2 className="text-5xl md:text-7xl font-bold tracking-tighter leading-none mb-6">
            Engineered for <br />
            <span className="text-muted-foreground">unstoppable growth.</span>
          </h2>
          <p className="text-muted-foreground text-xl max-w-2xl font-medium">
            Next-gen automation tools designed to handle every aspect of your 
            social media sales funnel.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[240px]">
          {/* Main Feature - Large Bento Card */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="md:col-span-8 md:row-span-2 rounded-[48px] bg-white border border-border p-10 flex flex-col justify-between group overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Cpu className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-4xl font-bold tracking-tighter mb-4">Neural Automation <br/>Engine</h3>
              <p className="text-muted-foreground text-lg max-w-md font-medium">
                Our core engine uses advanced LLMs to understand intent, tone, and context in every comment and DM.
              </p>
            </div>
            <div className="mt-auto flex items-center gap-4 relative z-10">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-secondary flex items-center justify-center text-[10px] font-bold">
                    User{i}
                  </div>
                ))}
              </div>
              <div className="text-sm font-bold text-foreground">Join 4,000+ top creators</div>
            </div>
          </motion.div>

          {/* Side Card 1 */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="md:col-span-4 md:row-span-1 rounded-[48px] bg-foreground text-background p-10 flex flex-col justify-between group"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold tracking-tighter">Real-time Triggers</h3>
              <div className="text-white/60 text-sm font-medium mt-1">Instant responses, 24/7.</div>
            </div>
          </motion.div>

          {/* Side Card 2 */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="md:col-span-4 md:row-span-1 rounded-[48px] bg-secondary border border-border p-10 flex flex-col justify-between group"
          >
            <div className="w-12 h-12 rounded-2xl bg-white border border-border flex items-center justify-center">
              <Globe className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold tracking-tighter">Global Reach</h3>
              <div className="text-muted-foreground text-sm font-medium mt-1">Scale across all regions.</div>
            </div>
          </motion.div>

          {/* Bottom Card 1 */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="md:col-span-4 md:row-span-2 rounded-[48px] bg-secondary border border-border p-10 flex flex-col group overflow-hidden"
          >
            <div className="w-14 h-14 rounded-2xl bg-white border border-border flex items-center justify-center mb-8">
              <Bot className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-3xl font-bold tracking-tighter mb-4">AI Closer Agents</h3>
            <p className="text-muted-foreground font-medium mb-6">
              Full conversation management that qualifies leads and delivers checkouts.
            </p>
            <div className="mt-auto pt-6 border-t border-border">
              <div className="flex items-center justify-between text-sm font-bold">
                <span>Conversion Rate</span>
                <span className="text-primary">+34.2%</span>
              </div>
              <div className="w-full bg-border h-1.5 rounded-full mt-2 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: '70%' }}
                  className="bg-primary h-full" 
                />
              </div>
            </div>
          </motion.div>

          {/* Bottom Card 2 - Wide */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="md:col-span-8 md:row-span-2 rounded-[48px] bg-white border border-border p-10 flex flex-col justify-between group"
          >
            <div className="flex justify-between items-start">
               <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-primary" />
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Live Analytics</div>
                <div className="text-2xl font-bold">128.4k</div>
              </div>
            </div>
            <div className="flex-1 flex items-end gap-2 px-4">
               {[40, 70, 45, 90, 65, 80, 50, 100, 85, 95].map((h, i) => (
                 <motion.div 
                  key={i}
                  initial={{ height: 0 }}
                  whileInView={{ height: `${h}%` }}
                  transition={{ delay: i * 0.05 }}
                  className="flex-1 bg-primary/20 rounded-t-lg group-hover:bg-primary/40 transition-colors"
                 />
               ))}
            </div>
            <div className="pt-8">
              <h3 className="text-3xl font-bold tracking-tighter mb-2">Growth Tracking</h3>
              <p className="text-muted-foreground font-medium">Watch your engagement and revenue climb in real-time.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FeatureGrid;
