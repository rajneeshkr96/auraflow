"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Star, MessageSquare, Zap, Bot, ChevronRight, Globe, Shield, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useCSWUser } from '@codeswayam/auth';
import { useAuthUrl } from '@/lib/use-auth-url';

const Hero: React.FC = () => {
  const { isSignedIn } = useCSWUser();
  const { getAuthUrl } = useAuthUrl();
  return (
    <section className="relative pt-32 sm:pt-44 pb-16 sm:pb-24 px-4 sm:px-6 bg-background overflow-hidden">
      {/* Background elements inspired by UnboundX */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-6xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border text-foreground text-xs font-bold mb-8 sm:mb-10 shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="tracking-widest uppercase">The future of social growth</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-8xl font-bold tracking-tighter leading-[0.98] sm:leading-[0.95] mb-6 sm:mb-8 text-foreground"
        >
          Automate growth. <br />
          <span className="text-muted-foreground">Without the grind.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-muted-foreground text-base sm:text-xl md:text-2xl max-w-2xl mx-auto mb-8 sm:mb-12 leading-normal sm:leading-tight font-medium px-2"
        >
          Auraflow helps creators and brands scale their Instagram engagement 
          using next-gen AI agents that close deals while you sleep.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 justify-center w-full max-w-sm sm:max-w-none mx-auto"
        >
          {isSignedIn ? (
            <Link href="/dashboard" className="group h-14 sm:h-16 px-8 sm:px-10 w-full sm:w-auto bg-primary text-white font-bold rounded-full transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 text-base sm:text-lg">
              Go to Dashboard
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          ) : (
            <a href={getAuthUrl("/signup")} className="group h-14 sm:h-16 px-8 sm:px-10 w-full sm:w-auto bg-primary text-white font-bold rounded-full transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 text-base sm:text-lg">
              Start growing now
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </a>
          )}
          <button className="h-14 sm:h-16 px-8 sm:px-10 w-full sm:w-auto bg-white border border-border text-foreground font-bold rounded-full hover:bg-secondary transition-all flex items-center justify-center gap-2 text-base sm:text-lg">
            Watch Demo
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-8 sm:mt-12 flex flex-wrap items-center justify-center gap-x-6 sm:gap-x-8 gap-y-3 sm:gap-y-4 text-muted-foreground text-xs sm:text-sm font-bold opacity-60"
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

      {/* Floating Visual Elements - Bento Card */}
      <div className="relative max-w-7xl mx-auto mt-12 sm:mt-24 w-full">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, type: "spring", damping: 20 }}
          className="relative z-0 group w-full"
        >
          {/* Main Visual: Bento-styled Card Stack */}
          <div className="relative rounded-3xl sm:rounded-[40px] md:rounded-[48px] border border-border/50 bg-white shadow-[0_32px_80px_rgba(0,0,0,0.06)] overflow-hidden w-full">
            <div className="aspect-auto md:aspect-[21/9] bg-gradient-to-br from-secondary via-white to-secondary/30 flex items-center justify-center p-3 sm:p-6 md:p-12 w-full">
               {/* Mock Dashboard Representation */}
               <div className="w-full rounded-2xl sm:rounded-[32px] border border-border bg-white p-4 sm:p-6 md:p-8 flex flex-col gap-4 sm:gap-6 shadow-xs overflow-hidden">
                  <div className="flex items-center justify-between gap-3 w-full">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-sm sm:text-lg truncate">AI Closer Agent #42</div>
                        <div className="text-xs sm:text-sm text-muted-foreground truncate">Active and monitoring comments</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 bg-emerald-50 text-emerald-600 px-2.5 py-1 sm:px-4 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold border border-emerald-100 shrink-0">
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse" />
                      LIVE
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 w-full">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="rounded-xl sm:rounded-3xl border border-border bg-secondary/20 p-3.5 sm:p-6 flex flex-row sm:flex-col justify-between items-center sm:items-start gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white border border-border flex items-center justify-center shrink-0">
                           {i === 1 ? <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-primary" /> : i === 2 ? <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-primary" /> : <Star className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />}
                        </div>
                        <div className="text-right sm:text-left">
                          <div className="text-xl sm:text-3xl font-bold tracking-tighter">{i === 1 ? '14.2k' : i === 2 ? '892' : '98.2%'}</div>
                          <div className="text-[11px] sm:text-sm text-muted-foreground font-bold">{i === 1 ? 'Engagement' : i === 2 ? 'Leads' : 'Satisfaction'}</div>
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
