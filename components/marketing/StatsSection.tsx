"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, MessageSquare, Target, ArrowUpRight } from 'lucide-react';

const stats = [
  { label: 'Leads Captured', value: '142K' },
  { label: 'DMs Automated', value: '1.2M' },
  { label: 'Response Time', value: '< 1s' },
  { label: 'User Satisfaction', value: '99%' },
];

const StatsSection: React.FC = () => {
  return (
    <section className="py-24 px-6 bg-background border-y border-border">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col gap-2"
            >
              <div className="text-4xl md:text-6xl font-bold tracking-tighter text-foreground">{stat.value}</div>
              <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
