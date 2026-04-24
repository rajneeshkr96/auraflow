"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Plus, Minus } from 'lucide-react';

const faqs = [
  { q: 'Does Auraflow work with the official Instagram API?', a: 'Yes. Auraflow is built on the official Instagram Graph API — fully compliant, account-safe, and messages land in Primary Inbox.' },
  { q: 'Will automated DMs land in the Primary Inbox?', a: 'Absolutely. Using the official API ensures all messages route to Primary Inbox, giving you dramatically higher open and response rates.' },
  { q: 'What is an AI Closer Agent?', a: 'A custom GPT-4 powered assistant trained on your brand. It handles full DM conversations — qualifying leads, answering questions, and sending checkout links.' },
  { q: 'Is the 7-day trial completely free?', a: 'Yes. Full access to every Smart AI feature for 7 days with no credit card required.' },
  { q: 'Can I target specific posts or reels?', a: 'Yes! Apply different automations to different posts, reels, or stories for perfectly tailored funnels.' },
  { q: 'What kind of businesses work best with Auraflow?', a: 'Any Instagram business — coaches, e-commerce, course creators, agencies, and SaaS founders all see massive ROI.' },
];

const FAQ: React.FC = () => {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="py-32 px-6 bg-background border-t border-border">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-left mb-20"
        >
          <h2 className="text-5xl md:text-7xl font-bold tracking-tighter leading-none mb-6">
            Questions? <br />
            <span className="text-muted-foreground">We have answers.</span>
          </h2>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className={`rounded-[32px] border transition-all duration-300 overflow-hidden ${open === i ? 'bg-secondary border-primary/20 shadow-sm' : 'bg-white border-border hover:border-primary/30'}`}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-8 py-8 text-left"
              >
                <span className={`text-xl font-bold transition-colors ${open === i ? 'text-primary' : 'text-foreground'}`}>{faq.q}</span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${open === i ? 'bg-primary text-white rotate-180' : 'bg-secondary text-muted-foreground'}`}>
                   {open === i ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-8 pb-8">
                      <p className="text-lg text-muted-foreground font-medium leading-relaxed max-w-2xl">{faq.a}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
