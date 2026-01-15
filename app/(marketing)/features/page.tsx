
import React from 'react';

import { Bot, Zap, MessageSquare, MousePointer2 } from 'lucide-react';
import FeatureGrid from '@/components/marketing/FeatureGrid';



const FeaturesView: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <main className="">
        <section className="px-6 py-20 bg-slate-50">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-8 text-slate-900 tracking-tight">
              Powerful Automation, <br />
              <span className="text-indigo-600">Effortless Growth.</span>
            </h1>
            <p className="text-lg text-slate-500 font-medium mb-12 max-w-2xl mx-auto">
              We've built the world's most intuitive social automation engine. Drag, drop, and watch your audience convert while you sleep.
            </p>
            <button 
              className="px-10 py-5 bg-slate-900 text-white font-bold rounded-full shadow-xl hover:scale-105 transition-all"
            >
              Start Building Now
            </button>
          </div>
        </section>

        <FeatureGrid />

        <section className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div>
                <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-600 mb-6">
                  <Bot size={24} />
                </div>
                <h2 className="text-4xl font-black mb-6">Advanced AI Sales Logic</h2>
                <p className="text-slate-500 font-medium leading-relaxed mb-8">
                  Our Closer Agents aren't just simple bots. They use RAG (Retrieval Augmented Generation) to understand your product docs, pricing, and voice to handle complex objections in real-time.
                </p>
                <div className="space-y-4">
                  {[
                    "Zero latency response times",
                    "Context-aware conversation memory",
                    "Direct Stripe & Calendly integration",
                    "Automatic sentiment analysis"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-indigo-600" />
                      <span className="text-sm font-bold text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-slate-900 rounded-[3rem] p-12 relative overflow-hidden aspect-square flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent" />
                <div className="relative z-10 space-y-4 w-full">
                  <div className="p-4 bg-white/10 border border-white/10 rounded-2xl backdrop-blur-md">
                     <div className="text-[10px] font-black text-indigo-400 mb-1">USER QUERY</div>
                     <p className="text-white text-sm">"Hey, do you guys have a discount for yearly plans?"</p>
                  </div>
                  <div className="p-4 bg-indigo-600 border border-white/10 rounded-2xl backdrop-blur-md ml-8">
                     <div className="text-[10px] font-black text-white/60 mb-1">AI AGENT RESPONDING</div>
                     <p className="text-white text-sm italic">"Checking pricing database... Yes! Our Smart AI plan is 20% off when billed annually. Should I send you the link?"</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-indigo-600 py-32 px-6 text-center text-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">Ready to reclaim your time?</h2>
            <p className="text-indigo-100 text-lg font-medium mb-12">Join 4,000+ creators scaling their brands with Auraflow.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                className="px-8 py-4 bg-white text-indigo-600 font-black rounded-full hover:bg-slate-50 transition-all"
              >
                Create Free Account
              </button>
              <button className="px-8 py-4 bg-indigo-700 text-white font-black rounded-full hover:bg-indigo-800 transition-all">
                Talk to Sales
              </button>
            </div>
          </div>
        </section>
      </main>

    </div>
  );
};

export default FeaturesView;
