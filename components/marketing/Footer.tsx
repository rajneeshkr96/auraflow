"use client";
import React from 'react';
import { LayoutGrid, Twitter, Instagram, Github, ArrowRight, ChevronRight, Globe, Shield, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const links = {
  Product: ['Features', 'Pricing', 'Automations', 'AI Agents'],
  Company: ['About', 'Blog', 'Careers', 'Contact'],
  Legal: ['Privacy Policy', 'Terms of Service'],
};

const Footer: React.FC = () => {
  return (
    <footer className="bg-background">
      {/* Premium CTA Section */}
      <div className="py-32 px-6">
        <div className="max-w-7xl mx-auto rounded-[64px] bg-primary p-12 md:p-24 text-center relative overflow-hidden group">
          {/* Animated background shapes */}
          <motion.div 
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"
          />
          <motion.div 
            animate={{ scale: [1, 1.5, 1], rotate: [0, -45, 0] }}
            transition={{ duration: 15, repeat: Infinity }}
            className="absolute -bottom-24 -right-24 w-96 h-96 bg-black/10 rounded-full blur-3xl pointer-events-none"
          />

          <div className="relative z-10">
            <h2 className="text-5xl md:text-8xl font-bold tracking-tighter text-white leading-none mb-8">
              Grow faster. <br />
              <span className="opacity-50">Work smarter.</span>
            </h2>
            <p className="text-white/80 text-xl md:text-2xl max-w-2xl mx-auto mb-12 font-medium">
              Join thousands of creators who have automated their social growth 
              and increased their revenue by 245% on average.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/signup" className="h-16 px-10 bg-white text-primary font-bold rounded-full transition-all flex items-center gap-2 hover:scale-105 active:scale-95 text-lg">
                Get started for free
                <ChevronRight className="w-5 h-5" />
              </Link>
              <button className="h-16 px-10 bg-primary-foreground/10 border border-white/20 text-white font-bold rounded-full hover:bg-white/15 transition-all text-lg">
                Talk to Sales
              </button>
            </div>
            <p className="text-white/40 text-sm font-bold mt-8">No credit card required · Instant setup</p>
          </div>
        </div>
      </div>

      {/* Footer Links */}
      <div className="pb-24 px-6 pt-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-12 gap-12 mb-20">
            <div className="col-span-2 md:col-span-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-white">
                  <LayoutGrid className="w-6 h-6" />
                </div>
                <span className="text-2xl font-bold tracking-tighter">Auraflow</span>
              </div>
              <p className="text-muted-foreground text-lg font-medium leading-relaxed mb-8 max-w-md">
                The next-generation social growth platform. Designed for creators who want to scale without the burnout.
              </p>
              <div className="flex gap-4">
                {[Twitter, Instagram, Github].map((Icon, i) => (
                  <a key={i} href="#" className="w-12 h-12 rounded-2xl bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all">
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
            
            <div className="col-span-2 md:col-span-6 grid grid-cols-3 gap-8">
               {Object.entries(links).map(([group, items]) => (
                <div key={group}>
                  <h5 className="text-foreground font-bold text-sm mb-6">{group}</h5>
                  <ul className="space-y-4">
                    {items.map((item) => (
                      <li key={item}>
                        <Link href={`/${item.toLowerCase().replace(/ /g, '-')}`} className="text-muted-foreground hover:text-primary transition-colors font-medium">
                          {item}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-12 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-sm font-bold text-muted-foreground">
              © {new Date().getFullYear()} Auraflow. Built for creators.
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-sm font-bold text-muted-foreground">Systems Active</span>
              </div>
              <div className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                Back to top ↑
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
