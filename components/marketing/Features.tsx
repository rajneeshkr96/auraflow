
import React from 'react';
import { Target, MessageSquare, Zap, BarChart3, Bot, Cpu } from 'lucide-react';

const featureList = [
  {
    title: "Keyword Triggers",
    desc: "Listen for specific words in comments and DMs to trigger complex automation flows.",
    icon: <Target className="w-6 h-6" />,
    color: "text-blue-500",
    bg: "bg-blue-500/10"
  },
  {
    title: "Smart AI Agents",
    desc: "Closer Agents trained on your voice to handle full conversations and book appointments.",
    icon: <Bot className="w-6 h-6" />,
    color: "text-purple-500",
    bg: "bg-purple-500/10"
  },
  {
    title: "Primary Inbox Sync",
    desc: "Automation DMs land directly in your Instagram Primary Inbox, not the hidden requests tab.",
    icon: <MessageSquare className="w-6 h-6" />,
    color: "text-pink-500",
    bg: "bg-pink-500/10"
  },
  {
    title: "Visual Canvas Builder",
    desc: "An intuitive drag-and-drop interface to design your customer journeys visually.",
    icon: <Cpu className="w-6 h-6" />,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10"
  },
  {
    title: "Advanced Analytics",
    desc: "Track engagement funnels, conversion rates, and agent performance in real-time.",
    icon: <BarChart3 className="w-6 h-6" />,
    color: "text-amber-500",
    bg: "bg-amber-500/10"
  },
  {
    title: "High Performance",
    desc: "Built with an optimistic UI for instantaneous actions and real-time response times.",
    icon: <Zap className="w-6 h-6" />,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10"
  }
];

const Features: React.FC = () => {
  return (
    <section id="features" className="py-24 px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20">
          <h2 className="text-slate-500 text-sm font-bold tracking-widest uppercase mb-4">Core Capabilities</h2>
          <h3 className="text-4xl md:text-6xl font-bold max-w-2xl leading-tight">Everything you need to scale engagement.</h3>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featureList.map((f, i) => (
            <div 
              key={i} 
              className="group p-8 rounded-3xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900 transition-all hover:-translate-y-1 hover:border-indigo-500/30"
            >
              <div className={`w-14 h-14 ${f.bg} ${f.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                {f.icon}
              </div>
              <h4 className="text-xl font-bold mb-3 text-white">{f.title}</h4>
              <p className="text-slate-400 leading-relaxed text-sm">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
