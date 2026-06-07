"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Bot, CheckCircle2, ArrowRight, ChevronRight, Share2, Target, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { useCSWUser } from '@codeswayam/auth';
import { useAuthUrl } from '@/lib/use-auth-url';

const steps = [
  { step: '01', title: 'Connect Instagram', desc: 'Link your account via Meta Business OAuth in under 60 seconds.', icon: Share2 },
  { step: '02', title: 'Define Your Triggers', desc: 'Set keyword triggers for comments and DMs — exact match, contains, or regex.', icon: Target },
  { step: '03', title: 'Watch It Convert', desc: 'Your AI Closer Agent engages leads, sends links, and closes sales 24/7.', icon: CreditCard },
];

const HowItWorks: React.FC = () => {
  const { isSignedIn } = useCSWUser();
  const { getAuthUrl } = useAuthUrl();
  return (
    <section className="py-32 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          <h2 className="text-5xl md:text-7xl font-bold tracking-tighter leading-none mb-6">
            Setup to sales in <br />
            <span className="text-muted-foreground">three simple steps.</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-12 relative">
          {/* Connecting line */}
          <div className="absolute top-1/2 left-0 w-full h-px bg-border hidden md:block -z-10" />
          
          {steps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center text-center group"
            >
              <div className="w-24 h-24 rounded-[32px] bg-white border border-border shadow-sm flex items-center justify-center mb-8 group-hover:scale-110 group-hover:border-primary/30 transition-all duration-500">
                <s.icon className="w-10 h-10 text-primary" />
              </div>
              <div className="text-xs font-bold text-primary mb-4 uppercase tracking-[0.2em]">{s.step}</div>
              <h3 className="text-2xl font-bold tracking-tighter mb-4">{s.title}</h3>
              <p className="text-muted-foreground font-medium leading-relaxed max-w-[240px]">{s.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-24"
        >
          {isSignedIn ? (
            <Link href="/dashboard" className="inline-flex h-16 px-10 bg-foreground text-background font-bold rounded-full transition-all active:scale-95 items-center gap-2 mx-auto group">
              Start Your Free Trial
              <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          ) : (
            <a href={getAuthUrl("/signup")} className="inline-flex h-16 px-10 bg-foreground text-background font-bold rounded-full transition-all active:scale-95 items-center gap-2 mx-auto group">
              Start Your Free Trial
              <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </a>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
