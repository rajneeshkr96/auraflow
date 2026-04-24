"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, ChevronRight } from 'lucide-react';

const reviews = [
  { name: 'Sarah K.', role: 'Wellness Coach', text: 'The AI Closer Agent booked 12 coaching calls in the first week. I used to spend 4 hours in DMs daily — now zero.', stars: 5, result: '+$4,800 first month' },
  { name: 'Mike Torres', role: 'E-commerce Founder', text: 'Keyword triggers changed everything. Anyone who comments "LINK" gets a DM instantly. Conversion rate jumped 40%.', stars: 5, result: '+40% conversion' },
  { name: 'Heidi C.', role: 'Brand Consultant', text: 'Messages landing in Primary Inbox — not hidden Requests — is the game changer nobody talks about.', stars: 5, result: '3x open rates' },
  { name: 'Julian Park', role: 'SaaS Founder', text: 'I tried every automation tool available. Auraflow is the only one that sounds genuinely human. Remarkable.', stars: 5, result: '62% response rate' },
  { name: 'Arfan R.', role: 'Content Creator', text: 'Setup took 5 minutes. Within an hour I had my first automated conversation running and landing sales.', stars: 5, result: 'Setup in 5 min' },
  { name: 'Jordan Lee', role: 'Marketing Director', text: 'We scaled from 0 to $50k MRR in 3 months using Auraflow automations. The ROI is undeniable.', stars: 5, result: '$50K MRR in 90 days' },
];

const Testimonials: React.FC = () => {
  return (
    <section id="reviews" className="py-32 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-left mb-20"
        >
          <h2 className="text-5xl md:text-7xl font-bold tracking-tighter leading-none mb-6">
            Loved by <br />
            <span className="text-muted-foreground">top creators.</span>
          </h2>
          <p className="text-muted-foreground text-xl max-w-2xl font-medium">
            Join 4,000+ creators and brands who have already automated 
            their way to consistent, scalable revenue.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white border border-border rounded-[40px] p-8 flex flex-col justify-between group transition-all duration-300"
            >
              <div>
                <div className="flex gap-1 mb-6">
                  {[...Array(r.stars)].map((_, idx) => <Star key={idx} className="w-4 h-4 fill-primary text-primary" />)}
                </div>
                <p className="text-lg text-foreground leading-tight font-bold mb-8 italic">"{r.text}"</p>
              </div>
              
              <div className="flex items-center justify-between pt-6 border-t border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-secondary flex items-center justify-center text-primary font-bold">
                    {r.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">{r.name}</div>
                    <div className="text-xs text-muted-foreground font-medium">{r.role}</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-primary bg-primary/5 px-3 py-1 rounded-full uppercase tracking-wider">
                  {r.result}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-20 flex justify-center"
        >
           <button className="group flex items-center gap-2 text-foreground font-bold hover:text-primary transition-colors">
              View all 2,400+ case studies
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
           </button>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
