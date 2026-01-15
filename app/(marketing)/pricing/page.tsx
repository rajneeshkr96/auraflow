
import React from 'react';
import { Check, X } from 'lucide-react';
import Pricing from '@/components/marketing/Pricing';



const PricingView: React.FC = () => {
  const comparison = [
    { feature: "Automations", free: "Unlimited", paid: "Unlimited" },
    { feature: "Agent Replies", free: "Static only", paid: "Smart AI (Generative)" },
    { feature: "Keyword Triggers", free: "Basic", paid: "Regex & Fuzzy Matching" },
    { feature: "Conversation History", free: "24 Hours", paid: "30 Days" },
    { feature: "Lead Export", free: false, paid: true },
    { feature: "Team Collaboration", free: false, paid: true },
    { feature: "Priority Support", free: false, paid: true },
    { feature: "Custom Branding", free: false, paid: true },
  ];

  return (
      <main className="min-h-screen bg-white text-slate-900">
        <Pricing  />

        <section className="py-24 px-6 bg-slate-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-black text-center mb-16">Compare Plans</h2>
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-8 py-6 text-sm font-black uppercase tracking-widest text-slate-400">Feature</th>
                    <th className="px-8 py-6 text-sm font-black uppercase tracking-widest text-slate-900">Free</th>
                    <th className="px-8 py-6 text-sm font-black uppercase tracking-widest text-indigo-600">Smart AI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {comparison.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-5 text-sm font-bold text-slate-600">{row.feature}</td>
                      <td className="px-8 py-5 text-sm font-bold text-slate-400">
                        {typeof row.free === 'boolean' ? (row.free ? <Check size={16} className="text-indigo-500" /> : <X size={16} />) : row.free}
                      </td>
                      <td className="px-8 py-5 text-sm font-bold text-slate-900">
                        {typeof row.paid === 'boolean' ? (row.paid ? <Check size={16} className="text-indigo-600" /> : <X size={16} />) : row.paid}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="py-32 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-black text-center mb-16">Pricing FAQ</h2>
            <div className="space-y-8">
              {[
                { q: "Is there a long-term contract?", a: "No, you can cancel your subscription at any time with one click from your settings." },
                { q: "Can I upgrade or downgrade?", a: "Yes, you can change your plan at any time. If you upgrade, the price will be prorated." },
                { q: "What happens after the trial?", a: "After your 7-day trial of Smart AI, you'll be charged for your first month unless you cancel." },
                { q: "Do you offer refunds?", a: "We offer a 14-day money-back guarantee if you're not satisfied with the platform." }
              ].map((faq, i) => (
                <div key={i} className="p-8 bg-slate-50 rounded-2xl">
                  <h4 className="font-bold text-lg mb-3">{faq.q}</h4>
                  <p className="text-slate-500 font-medium">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
  );
};

export default PricingView;
