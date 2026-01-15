
import React from 'react';

import { Heart, Target, Users, Sparkles } from 'lucide-react';
import Link from 'next/link';


const AboutView: React.FC = () => {
  return (

      <main className="min-h-screen bg-white text-slate-900">
        <section className="px-6 py-24 bg-slate-50">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-600 text-[10px] font-black tracking-widest uppercase mb-8">
              Our Story
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-8 text-slate-900 tracking-tight leading-tight">
              Scaling Human <br />
              <span className="text-indigo-600 italic font-serif">Connection.</span>
            </h1>
            <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
              Auraflow was born out of a simple frustration: social media creators were spending more time in their DMs than creating content. We built the bridge between AI efficiency and human voice.
            </p>
          </div>
        </section>

        <section className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center mb-32">
              <div className="space-y-6">
                <h2 className="text-4xl font-black">Our Mission</h2>
                <p className="text-slate-500 font-medium leading-relaxed">
                  We believe that every interaction counts. Our mission is to empower creators and brands to never miss an opportunity to connect, nurture, and grow their community, even while they sleep.
                </p>
                <div className="grid grid-cols-2 gap-8 pt-6">
                   <div>
                      <div className="text-3xl font-black text-indigo-600 mb-1">4k+</div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Creators</div>
                   </div>
                   <div>
                      <div className="text-3xl font-black text-indigo-600 mb-1">1.2M+</div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">DMs Automated</div>
                   </div>
                </div>
              </div>
              <div className="aspect-square bg-slate-900 rounded-[3rem] p-12 relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent" />
                <Sparkles className="text-indigo-400 w-32 h-32 opacity-20 animate-pulse" />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: "Empowerment", desc: "Giving creators their time back to focus on what matters most: creativity.", icon: <Heart className="w-6 h-6" /> },
                { title: "Precision", desc: "Building AI that doesn't just talk, but understands and acts with intent.", icon: <Target className="w-6 h-6" /> },
                { title: "Community", desc: "Supporting our users as they build thriving ecosystems on social platforms.", icon: <Users className="w-6 h-6" /> },
              ].map((value, i) => (
                <div key={i} className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm mb-6">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-4">{value.title}</h3>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed">{value.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-32 px-6 bg-slate-950 text-white text-center">
           <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl font-black mb-8">Join the Auraflow journey</h2>
              <p className="text-slate-400 font-medium mb-12">We are just getting started. Be part of the next evolution of social media automation.</p>
              <Link href="/sign-up" className="px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-full transition-all">
                 Get Started for Free
              </Link>
           </div>
        </section>
      </main>

  );
};

export default AboutView;
