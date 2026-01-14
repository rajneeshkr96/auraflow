
import React from 'react';
import { MousePointer2, Settings, Zap, Layout, Bot, Instagram, MessageSquare, ArrowRight, Target, Inbox } from 'lucide-react';

const FeatureGrid: React.FC = () => {
  return (
    <section id="features" className="py-24 px-6 bg-slate-50/50">
      <div className="max-w-7xl mx-auto space-y-24">
        {/* Section 1: Automation Builder */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight">
              A Visual Builder <br />
              <span className="text-indigo-600">that just works.</span>
            </h2>
            <p className="text-slate-500 text-lg font-medium leading-relaxed">
              Design complex customer journeys with our intuitive drag-and-drop canvas. Listen for keywords like "PRICE" or "LINK" and let Auraflow handle the rest.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
               {[
                 { title: 'Keyword Triggers', desc: 'Exact, Contains, or Regex', icon: <Target className="w-3 h-3" /> },
                 { title: 'Closer Agents', desc: 'AI that closes sales', icon: <Bot className="w-3 h-3" /> },
                 { title: 'Inbox Routing', desc: 'Direct to Primary Inbox', icon: <Inbox className="w-3 h-3" /> },
                 { title: 'Post Filtering', desc: 'Apply to specific posts', icon: <Layout className="w-3 h-3" /> }
               ].map((item, i) => (
                 <div key={i} className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mt-1 flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                      <p className="text-slate-400 text-xs">{item.desc}</p>
                    </div>
                 </div>
               ))}
            </div>
          </div>
          
          <div className="bento-card bg-slate-950 p-8 h-[450px] relative overflow-hidden flex flex-col justify-center border-slate-800">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent" />
            <div className="relative z-10 bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center">
                  <Instagram className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-[10px] font-black text-white">NEW COMMENT ON POST #42</div>
                  <div className="text-[10px] text-slate-400">@user: "Interested in the eBook!"</div>
                </div>
              </div>
              <div className="pl-6 border-l border-white/10 space-y-4">
                 <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-[10px] text-slate-300">
                   <span className="text-indigo-400 font-bold">Bot:</span> "Hey! Just sent you a DM with the download link. Check your inbox! 🚀"
                 </div>
                 <div className="p-3 bg-indigo-600 rounded-xl text-[10px] text-white font-bold animate-pulse">
                   Triggering DM Sequence: [Lead Magnet Flow]
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: AI Agents */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 bento-card p-4 aspect-square max-h-[500px] overflow-hidden bg-white">
             <div className="w-full h-full bg-slate-50 rounded-3xl border border-slate-200 p-8 flex flex-col gap-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Agent Configuration</span>
                  <Bot className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-white border border-slate-200 rounded-2xl">
                    <div className="text-[10px] font-black mb-2">Agent Role: Closer</div>
                    <div className="text-[10px] text-slate-500 italic">"You are a helpful assistant for a SaaS owner. Your goal is to qualify leads and send them to the Stripe checkout page."</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-indigo-600 rounded-2xl text-white">
                       <div className="text-[8px] font-black opacity-60">Status</div>
                       <div className="text-[10px] font-black">AI Active</div>
                    </div>
                    <div className="p-4 bg-slate-900 rounded-2xl text-white">
                       <div className="text-[8px] font-black opacity-60">Version</div>
                       <div className="text-[10px] font-black">v2.1 (Clerk)</div>
                    </div>
                  </div>
                </div>
             </div>
          </div>
          <div className="order-1 lg:order-2 space-y-6">
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight">
              Smart AI Agents <br />
              <span className="text-purple-600">trained on your voice.</span>
            </h2>
            <p className="text-slate-500 text-lg font-medium leading-relaxed">
              Auraflow's Closer Agents handle full conversations. They are context-aware, retain conversation history, and are designed to convert followers into paying customers.
            </p>
            <button className="px-6 py-3 border border-slate-200 hover:bg-slate-100 rounded-full text-sm font-bold text-slate-600 transition-all flex items-center gap-2 group">
              Meet Your New Sales Team
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureGrid;
