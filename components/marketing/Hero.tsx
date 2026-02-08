
"use client";

import React from 'react';
import { ArrowRight, Star, MessageSquare, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const Hero: React.FC = () => {
  return (
    <section className="relative pt-40 pb-20 px-6 overflow-hidden">
      {/* Decorative Icons */}
      <div className="absolute top-[15%] left-[8%] hidden lg:block pointer-events-none opacity-20">
        <motion.svg
          initial={{ opacity: 0, rotate: -90 }}
          animate={{ opacity: 1, rotate: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          width="140" height="140" viewBox="0 0 100 100" fill="none" className="text-indigo-600">
          <circle cx="50" cy="50" r="1.5" fill="currentColor" />
          {[...Array(12)].map((_, i) => (
            <line key={i} x1="50" y1="50" x2={50 + 40 * Math.cos((i * 30 * Math.PI) / 180)} y2={50 + 40 * Math.sin((i * 30 * Math.PI) / 180)} stroke="currentColor" strokeWidth="1.5" />
          ))}
        </motion.svg>
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold mb-8"
        >
          <span className="flex h-2 w-2 rounded-full bg-pink-500 animate-pulse" />
          INSTAGRAM AUTOMATION FOR CREATORS
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-8xl font-extrabold tracking-tight leading-[1.05] mb-8 text-slate-900"
        >
          Turn Every Comment <br />
          <span className="italic font-serif font-light text-slate-400">Into a Customer</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-medium"
        >
          Automate your Instagram DMs and comments with keyword triggers and AI Closer Agents. Capture leads 24/7 without lifting a finger.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 justify-center"
        >
          <button className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-full transition-all flex items-center gap-2 shadow-xl shadow-slate-900/20 group">
            Start Your Free Trial
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="px-8 py-4 bg-white border border-slate-200 text-slate-900 font-bold rounded-full hover:bg-slate-50 transition-all">
            See it in Action
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 flex items-center justify-center gap-2 text-slate-400 text-xs font-semibold"
        >
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
          </div>
          4,000+ AUTOMATIONS RUNNING DAILY
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5, type: "spring", bounce: 0.3 }}
        className="max-w-6xl mx-auto mt-20 relative"
      >
        <div className="bento-card p-4 aspect-video overflow-hidden group">
          <div className="w-full h-full rounded-2xl bg-white border border-slate-100 flex flex-col shadow-inner">
            <div className="h-12 border-b border-slate-100 flex items-center px-4 gap-2 bg-slate-50/50">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-slate-300" />
                <div className="w-3 h-3 rounded-full bg-slate-300" />
                <div className="w-3 h-3 rounded-full bg-slate-300" />
              </div>
              <div className="mx-auto bg-white border border-slate-200 px-3 py-1 rounded-md text-[10px] text-slate-400 font-bold">
                auraflow.io/dashboard/automations
              </div>
            </div>
            <div className="flex-1 p-8 grid grid-cols-12 gap-6 bg-white">
              <div className="col-span-8 space-y-6">
                <div className="relative aspect-video rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 overflow-hidden flex flex-col p-6">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-pink-500 rounded-2xl text-white shadow-lg">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900">TRIGGER: Keyword "GROWTH"</div>
                      <div className="text-[10px] text-slate-400 font-bold">Listens to: All Posts</div>
                    </div>
                  </div>
                  <div className="ml-6 border-l-2 border-slate-100 pl-8 space-y-4">
                    <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center gap-4">
                      <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><Zap className="w-4 h-4" /></div>
                      <div className="text-[10px] font-bold text-slate-600">Action: AI Closer Agent Takes Over</div>
                    </div>
                    <div className="p-4 bg-indigo-600 rounded-2xl shadow-xl flex items-center gap-4">
                      <div className="p-2 bg-white/20 text-white rounded-lg"><Zap className="w-4 h-4" /></div>
                      <div className="text-[10px] font-black text-white">Action: Send Link to eBook</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-span-4 h-full rounded-3xl bg-slate-50 border border-slate-100 p-6 space-y-6">
                <div className="space-y-4">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Leads</div>
                  {[
                    { name: '@alex_creatives', status: 'Closing' },
                    { name: '@fitness_daily', status: 'Qualified' },
                    { name: '@tech_reviews', status: 'Inquiry' }
                  ].map((lead, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-200">
                      <div className="text-[10px] font-bold text-slate-700">{lead.name}</div>
                      <div className="text-[8px] font-black px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full uppercase">{lead.status}</div>
                    </div>
                  ))}
                </div>
                <button className="w-full py-3 bg-slate-900 text-white text-[10px] font-black rounded-xl">CREATE AUTOMATION</button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
