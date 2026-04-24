"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Star, MessageSquare, Zap, Bot, ChevronRight, Globe, Shield, Sparkles } from 'lucide-react';
import Link from 'next/link';

const Hero: React.FC = () => {
  return (
    <section className="relative pt-44 pb-24 px-6 bg-background overflow-hidden">
      {/* Background elements inspired by UnboundX */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-6xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border text-foreground text-xs font-bold mb-10 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="tracking-widest uppercase">The future of social growth</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.95] mb-8 text-foreground"
        >
          Automate growth. <br />
          <span className="text-muted-foreground">Without the grind.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-muted-foreground text-xl md:text-2xl max-w-2xl mx-auto mb-12 leading-tight font-medium"
        >
          Auraflow helps creators and brands scale their Instagram engagement 
          using next-gen AI agents that close deals while you sleep.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-6 justify-center"
        >
          <Link href="/signup" className="group h-16 px-10 bg-primary text-white font-bold rounded-full transition-all flex items-center gap-3 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 text-lg">
            Start growing now
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <button className="h-16 px-10 bg-white border border-border text-foreground font-bold rounded-full hover:bg-secondary transition-all flex items-center gap-2 text-lg">
            Watch Demo
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-muted-foreground text-sm font-bold opacity-60"
        >
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4" /> Global Scale
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" /> Secure API
          </div>
          <div className="flex items-center gap-2 text-amber-500">
            <Star className="w-4 h-4 fill-current" /> 4.9/5 Rating
          </div>
        </motion.div>
      </div>

      {/* Floating Visual Elements - UnboundX Style */}
      <div className="relative max-w-7xl mx-auto mt-24">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, type: "spring", damping: 20 }}
          className="relative z-0 group"
        >
          {/* Main Visual: Bento-styled Card Stack */}
          <div className="relative rounded-[48px] border border-border/50 bg-white shadow-[0_32px_80px_rgba(0,0,0,0.06)] overflow-hidden">
            <div className="aspect-[21/9] bg-gradient-to-br from-secondary via-white to-secondary/30 flex items-center justify-center p-12">
               {/* Mock Dashboard Representation */}
               <div className="w-full h-full rounded-[32px] border border-border bg-white p-8 flex flex-col gap-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Bot className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <div className="font-bold text-lg">AI Closer Agent #42</div>
                        <div className="text-sm text-muted-foreground">Active and monitoring comments</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-xs font-bold border border-emerald-100">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      LIVE
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-6 flex-1">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="rounded-3xl border border-border bg-secondary/20 p-6 flex flex-col justify-between">
                        <div className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center">
                           {i === 1 ? <Zap className="w-5 h-5 text-primary" /> : i === 2 ? <MessageSquare className="w-5 h-5 text-primary" /> : <Star className="w-5 h-5 text-primary" />}
                        </div>
                        <div>
                          <div className="text-3xl font-bold tracking-tighter">{i === 1 ? '14.2k' : i === 2 ? '892' : '98.2%'}</div>
                          <div className="text-sm text-muted-foreground font-bold">{i === 1 ? 'Engagement' : i === 2 ? 'Leads' : 'Satisfaction'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          </div>

          {/* Floating Decorative Elements */}
          <motion.div 
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-12 -left-12 w-48 h-48 rounded-[40px] bg-white border border-border shadow-2xl p-6 hidden lg:flex flex-col justify-between"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold">89%</div>
              <div className="text-xs text-muted-foreground font-bold">Reply Rate</div>
            </div>
          </motion.div>

          <motion.div 
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute -bottom-12 -right-12 w-56 h-32 rounded-[40px] bg-white border border-border shadow-2xl p-6 hidden lg:flex flex-col justify-center gap-2"
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <div className="text-sm font-bold">Conversion up</div>
            </div>
            <div className="text-3xl font-bold tracking-tighter">+245%</div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
