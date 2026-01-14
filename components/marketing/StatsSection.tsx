
import React from 'react';
import { TrendingUp, Users, MessageSquare, Target } from 'lucide-react';

const stats = [
  { label: 'Leads Captured', value: '142k', sub: 'Monthly average', icon: <Target />, color: 'bg-indigo-50' },
  { label: 'DMs Automated', value: '1.2M', sub: '24/7 coverage', icon: <MessageSquare />, color: 'bg-emerald-50' },
  { label: 'Lead Response', value: '< 1s', sub: 'Instant engagement', icon: <TrendingUp />, color: 'bg-amber-50' },
  { label: 'User Satisfaction', value: '99%', sub: 'Based on 4k users', icon: <Users />, color: 'bg-pink-50' }
];

const StatsSection: React.FC = () => {
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className={`bento-card p-8 group hover:scale-[1.02] transition-transform cursor-default`}>
              <div className="flex items-center justify-between mb-8">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</span>
                <div className="text-slate-300 group-hover:text-indigo-600 transition-colors">{stat.icon}</div>
              </div>
              <div className="text-5xl font-extrabold text-slate-900 mb-2">{stat.value}</div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                {stat.sub}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
