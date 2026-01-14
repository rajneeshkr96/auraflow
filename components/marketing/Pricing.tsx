
import React, { useState } from 'react';
import { Check } from 'lucide-react';

const plans = [
  { 
    name: 'Free', 
    price: '$0', 
    features: [
      'Unlimited Automations',
      'Single Static Message per flow',
      'Keyword Triggers (Exact)',
      'Comment & DM Listening',
      'Community Support'
    ],
    color: 'bg-slate-100',
    highlight: false,
    cta: 'Get Started'
  },
  { 
    name: 'Smart AI', 
    price: '$49', 
    discountPrice: '$39',
    features: [
      'Unlimited Automations',
      'AI Closer Agent replies',
      'Multi-message conversational flows',
      'Conversation History (7 Days)',
      'Advanced Analytics & Funnels',
      'Priority Support',
      'Keyword Regex Triggers'
    ],
    color: 'bg-slate-900 text-white',
    highlight: true,
    tag: '7-DAY FREE TRIAL',
    cta: 'Start Free Trial'
  }
];

const Pricing: React.FC = () => {
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('yearly');

  return (
    <section id="pricing" className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight">Scale your Instagram <br /> without the manual work.</h2>
          
          <div className="flex items-center justify-center gap-4 pt-4">
            <span className={`text-sm font-bold ${period === 'monthly' ? 'text-slate-900' : 'text-slate-400'}`}>Monthly</span>
            <button 
              onClick={() => setPeriod(period === 'monthly' ? 'yearly' : 'monthly')}
              className="w-12 h-6 rounded-full bg-slate-200 relative p-1 transition-colors"
            >
              <div className={`w-4 h-4 rounded-full bg-indigo-600 transition-all ${period === 'yearly' ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
            <span className={`text-sm font-bold ${period === 'yearly' ? 'text-slate-900' : 'text-slate-400'}`}>Yearly <span className="text-emerald-500 ml-1">SAVE 20%</span></span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 max-w-4xl mx-auto gap-6">
          {plans.map((plan, i) => (
            <div key={i} className={`bento-card p-10 flex flex-col ${plan.color === 'bg-slate-900 text-white' ? 'bg-slate-900 text-white border-none shadow-2xl shadow-indigo-600/10 scale-105' : ''}`}>
              {plan.tag && (
                <div className="inline-block px-3 py-1 bg-indigo-500 text-white text-[10px] font-black rounded-full mb-6 w-fit">
                  {plan.tag}
                </div>
              )}
              <h3 className="text-xl font-extrabold mb-1">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-5xl font-black">{period === 'yearly' ? (plan.discountPrice || plan.price) : plan.price}</span>
                {plan.price !== '$0' && <span className="text-xs font-bold opacity-50">/ month</span>}
              </div>

              <div className="flex-1 space-y-4 mb-10">
                {plan.features.map((f, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <Check className={`w-4 h-4 ${plan.highlight ? 'text-indigo-400' : 'text-indigo-600'}`} />
                    <span className="text-sm font-bold opacity-80">{f}</span>
                  </div>
                ))}
              </div>

              <button className={`w-full py-4 rounded-full text-sm font-black transition-all active:scale-95 ${
                plan.highlight ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-900 hover:bg-slate-300'
              }`}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
