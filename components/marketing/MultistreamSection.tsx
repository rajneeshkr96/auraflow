
import React from 'react';
import { Bot, Zap, MessageSquare } from 'lucide-react';

const agentTypes = [
  {
    name: 'Reply Agent',
    role: 'Engagement',
    desc: 'Listens for keywords and sends instant automated replies to comments and DMs.',
    icon: <Zap className="w-6 h-6" />,
    color: 'bg-indigo-500'
  },
  {
    name: 'Closer Agent',
    role: 'Sales (Smart AI)',
    desc: 'Powered by Gemini AI. Trained on your prompt templates to handle complex sales conversations.',
    icon: <Bot className="w-6 h-6" />,
    color: 'bg-pink-500'
  }
];

const MultistreamSection: React.FC = () => {
  return (
    <section className="py-32 px-6 bg-slate-950 text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/20 to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/60 text-[10px] font-bold tracking-widest uppercase mb-12 border border-white/5">
          First-Class Automation Units
        </div>
        <h2 className="text-4xl md:text-7xl font-extrabold mb-12 tracking-tight">
          Meet Your <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Digital Workforce.</span>
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
           {agentTypes.map((agent, i) => (
             <div key={i} className="p-8 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-md text-left group hover:bg-white/10 transition-all">
                <div className={`w-14 h-14 ${agent.color} rounded-2xl flex items-center justify-center mb-6 shadow-xl`}>
                   {agent.icon}
                </div>
                <div className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-2">{agent.role}</div>
                <h3 className="text-2xl font-bold mb-4">{agent.name}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-8">{agent.desc}</p>
                <div className="flex items-center gap-2 text-xs font-bold text-white/40">
                   <MessageSquare className="w-4 h-4" />
                   PRIMARY INBOX ENABLED
                </div>
             </div>
           ))}
        </div>

        <div className="mt-20">
           <p className="text-slate-500 font-bold italic">"Auraflow agents are reusable across automations and versioned for full control."</p>
        </div>
      </div>
    </section>
  );
};

export default MultistreamSection;
