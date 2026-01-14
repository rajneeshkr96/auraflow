
import React, { useState } from 'react';
import { MousePointer2, MessageSquare, Play, Bot, ArrowRight, UserCheck } from 'lucide-react';

const AutomationDemo: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: 0,
      title: "1. The Trigger",
      desc: "Someone comments 'EBOOK' on your post.",
      icon: <MessageSquare className="w-5 h-5" />,
      color: "text-blue-400",
      bg: "bg-blue-400/10"
    },
    {
      id: 1,
      title: "2. The Agent",
      desc: "Smart AI Agent initiates conversation.",
      icon: <Bot className="w-5 h-5" />,
      color: "text-purple-400",
      bg: "bg-purple-400/10"
    },
    {
      id: 2,
      title: "3. The Outcome",
      desc: "Lead is qualified and link is sent via DM.",
      icon: <UserCheck className="w-5 h-5" />,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10"
    }
  ];

  return (
    <div className="relative rounded-3xl border border-slate-800 bg-slate-900/30 p-8 backdrop-blur-sm overflow-hidden group">
      <div className="grid md:grid-cols-3 gap-8 relative z-10">
        {steps.map((step) => (
          <div 
            key={step.id} 
            className={`p-6 rounded-2xl border transition-all cursor-pointer ${
              activeStep === step.id 
                ? 'bg-slate-950 border-indigo-500/50 shadow-2xl scale-105' 
                : 'bg-slate-950/50 border-slate-800 opacity-60 grayscale hover:grayscale-0 hover:opacity-100'
            }`}
            onClick={() => setActiveStep(step.id)}
          >
            <div className={`w-12 h-12 ${step.bg} ${step.color} rounded-xl flex items-center justify-center mb-4`}>
              {step.icon}
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">{step.title}</h3>
            <p className="text-slate-400 text-sm">{step.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-4 border-t border-slate-800 pt-8">
        <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-lg">
          <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center shadow-lg shadow-pink-500/30">
            <Instagram className="w-4 h-4 text-white" />
          </div>
          <div className="text-sm font-medium text-white">Instagram Automation Active</div>
          <div className="flex gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
        </div>
        <ArrowRight className="hidden md:block w-6 h-6 text-slate-700" />
        <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all">
          <Play className="w-4 h-4 fill-white" /> Run Simulation
        </button>
      </div>

      {/* Decorative Cursor */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000 hidden md:block animate-bounce">
        <MousePointer2 className="w-6 h-6 text-white fill-slate-950" />
      </div>
    </div>
  );
};

const Instagram: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

export default AutomationDemo;
