
import React from 'react';
import { Star } from 'lucide-react';

const reviews = [
  { name: 'Sarah @ GlowUp', text: 'The Closer Agent booked 12 coaching calls in the first week. I used to spend 4 hours a day in DMs, now I spend zero.', stars: 5 },
  { name: 'Mike T. - Ecom', text: 'Keyword triggers changed my life. Anyone who comments "LINK" gets a DM instantly. Conversion rate jumped 40%.', stars: 5 },
  { name: 'Heidi C.', text: 'The fact that these land in the Primary Inbox and not the hidden Requests tab is the game changer. Pure genius.', stars: 5 },
  { name: 'Julian @ TechHub', text: 'I tried other automation tools, but Auraflow is the only one that feels human. The AI agents actually sound like me.', stars: 5 },
  { name: 'Arf', text: 'Setting up keyword-based replies took me 5 minutes. Onboarding with Clerk was super smooth. Highly recommend.', stars: 5 },
  { name: 'Jordan - M-Sphere', text: 'The visual canvas builder is so intuitive. Designing our customer funnel was actually fun.', stars: 5 },
];

const Testimonials: React.FC = () => {
  return (
    <section id="reviews" className="py-32 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl font-extrabold text-slate-900">Loved by <br /><span className="text-pink-600">Instagram Growth Experts</span></h2>
          <p className="text-slate-500 font-medium">Capture every lead, nurture every lead, close every lead.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
           {reviews.map((r, i) => (
             <div key={i} className="bento-card p-8 bg-slate-50/50 border-slate-100">
               <div className="flex text-amber-400 mb-4">
                 {[...Array(r.stars)].map((_, idx) => <Star key={idx} className="w-3 h-3 fill-current" />)}
               </div>
               <p className="text-sm font-medium text-slate-600 leading-relaxed mb-6 italic">"{r.text}"</p>
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold text-xs">
                   {r.name[0]}
                 </div>
                 <span className="text-xs font-bold text-slate-900">{r.name}</span>
               </div>
             </div>
           ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
