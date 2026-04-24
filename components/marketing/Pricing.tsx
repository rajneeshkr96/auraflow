"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, ArrowRight, Globe, Loader2, Package, ChevronRight } from 'lucide-react';

interface PricingPlan {
    id: number;
    saasId: string;
    name: string;
    description: string;
    planTier: string;
    isFreeTier: boolean;
    pricing: {
        INR: { monthly: number; yearly: number };
        USD: { monthly: number; yearly: number };
    };
    features: string[];
    type: 'single' | 'bundle';
}

type BillingCycle = 'monthly' | 'yearly';
type Currency = 'INR' | 'USD';

const FALLBACK_PLANS: PricingPlan[] = [
    {
        id: -1,
        saasId: 'auraflow-starter',
        name: 'Starter',
        description: 'For creators just beginning.',
        planTier: 'free',
        isFreeTier: true,
        pricing: { INR: { monthly: 0, yearly: 0 }, USD: { monthly: 0, yearly: 0 } },
        features: ['Unlimited Automations', 'Keyword Triggers', 'Comment Listening', 'Community Support'],
        type: 'single',
    },
    {
        id: -2,
        saasId: 'auraflow-pro',
        name: 'Pro AI',
        description: 'Advanced growth for serious brands.',
        planTier: 'pro',
        isFreeTier: false,
        pricing: { INR: { monthly: 4900, yearly: 3900 * 12 }, USD: { monthly: 4900, yearly: 3900 * 12 } },
        features: ['Everything in Starter', 'AI Closer Agents', '7-Day History', 'Advanced Analytics', 'Priority Support'],
        type: 'single',
    },
];

function formatPrice(amountInPaise: number, currency: Currency): { amount: string; period?: string } {
    if (amountInPaise === 0) return { amount: currency === 'INR' ? '₹0' : '$0' };
    const amount = amountInPaise / 100;
    if (currency === 'INR') return { amount: `₹${amount.toLocaleString('en-IN')}`, period: '/mo' };
    return { amount: `$${amount.toLocaleString('en-US')}`, period: '/mo' };
}

function yearlySavings(monthly: number, yearly: number): number {
    if (!monthly || !yearly) return 0;
    const annualMonthly = monthly * 12;
    const annualYearly = yearly;
    return Math.max(0, Math.round(((annualMonthly - annualYearly) / annualMonthly) * 100));
}

const Pricing: React.FC = () => {
    const [billingCycle, setBillingCycle] = useState<BillingCycle>('yearly');
    const [currency, setCurrency] = useState<Currency>('INR');
    const [plans, setPlans] = useState<PricingPlan[]>(FALLBACK_PLANS);
    const [loading, setLoading] = useState(true);

    const AUTH_URL = process.env.NEXT_PUBLIC_APP_AUTH_URL || 'http://localhost:3003';
    const CORE_API = process.env.NEXT_PUBLIC_CORE_API_URL || 'http://localhost:3000';

    useEffect(() => {
        async function loadPlans() {
            try {
                const res = await fetch(`${CORE_API}/subscriptions/plans`);
                if (!res.ok) throw new Error('Failed to fetch');
                const data = await res.json();
                if (data.products) {
                    const auraflowPlans = data.products.filter((p: any) => p.tag === 'auraflow');
                    setPlans([...auraflowPlans, ...data.bundles]);
                }
            } catch {
            } finally {
                setLoading(false);
            }
        }
        loadPlans();
    }, [CORE_API]);

    const handleSubscribeClick = (plan: PricingPlan) => {
        const subscribeUrl = `${AUTH_URL}/profile/subscription?planId=${plan.id}&billingCycle=${billingCycle}&currency=${currency}`;
        window.open(subscribeUrl, '_blank');
    };

    return (
        <section id="pricing" className="py-32 px-6 bg-background">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-left mb-20"
                >
                    <h2 className="text-5xl md:text-7xl font-bold tracking-tighter leading-none mb-6">
                        Simple pricing. <br />
                        <span className="text-muted-foreground">Built for creators.</span>
                    </h2>
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 mt-12">
                        {/* Currency Selector */}
                        <div className="flex items-center gap-1 rounded-full border border-border bg-secondary p-1 shadow-sm">
                            {(['INR', 'USD'] as Currency[]).map(c => (
                                <button
                                    key={c}
                                    onClick={() => setCurrency(c)}
                                    className={`flex items-center gap-1.5 text-xs font-bold px-6 py-2.5 rounded-full transition-all duration-200 ${currency === c ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    {c === 'INR' ? '₹ INR' : '$ USD'}
                                </button>
                            ))}
                        </div>

                        {/* Billing Toggle */}
                        <div className="flex items-center gap-4">
                            <span className={`text-sm font-bold ${billingCycle === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}`}>Monthly</span>
                            <button
                                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                                className={`w-14 h-7 rounded-full relative p-1 transition-all duration-300 ${billingCycle === 'yearly' ? 'bg-primary' : 'bg-secondary border border-border'}`}
                            >
                                <div className={`w-5 h-5 rounded-full shadow-md transition-all duration-300 ${billingCycle === 'yearly' ? 'translate-x-7 bg-white' : 'translate-x-0 bg-primary'}`} />
                            </button>
                            <span className={`text-sm font-bold flex items-center gap-3 ${billingCycle === 'yearly' ? 'text-foreground' : 'text-muted-foreground'}`}>
                                Yearly
                                <span className="text-primary text-[10px] font-black bg-primary/10 px-3 py-1 rounded-full">
                                    SAVE 20%
                                </span>
                            </span>
                        </div>
                    </div>
                </motion.div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 size={32} className="animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {plans.map((plan, i) => {
                            const pricingData = plan.pricing?.[currency];
                            const rawPrice = billingCycle === 'yearly' ? (pricingData?.yearly ?? 0) : (pricingData?.monthly ?? 0);
                            const displayPrice = billingCycle === 'yearly' && rawPrice > 0
                                ? formatPrice(Math.round(rawPrice / 12), currency)
                                : formatPrice(rawPrice, currency);
                            const isPopular = plan.planTier === 'pro' || (i === 1 && plans.length > 1);
                            const isFree = rawPrice === 0;

                            return (
                                <motion.div
                                    key={plan.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className={`relative rounded-[48px] p-10 flex flex-col justify-between transition-all duration-500 border ${isPopular
                                        ? 'bg-foreground text-background border-transparent shadow-2xl'
                                        : 'bg-white border-border'
                                        }`}
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-8">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isPopular ? 'bg-white/10' : 'bg-secondary border border-border'}`}>
                                                {plan.type === 'bundle' ? <Package className="w-7 h-7 text-primary" /> : <Zap className="w-7 h-7 text-primary" />}
                                            </div>
                                            {isPopular && <span className="text-[10px] font-bold text-background bg-white px-4 py-1.5 rounded-full uppercase tracking-widest">Most Popular</span>}
                                        </div>

                                        <h3 className="text-3xl font-bold tracking-tighter mb-2">{plan.name}</h3>
                                        <p className={`text-sm font-medium mb-8 ${isPopular ? 'text-white/60' : 'text-muted-foreground'}`}>{plan.description}</p>

                                        <div className="flex items-baseline gap-2 mb-8">
                                            <span className="text-6xl font-bold tracking-tighter">
                                                {displayPrice.amount}
                                            </span>
                                            {!isFree && (
                                                <span className={`text-lg font-bold ${isPopular ? 'text-white/40' : 'text-muted-foreground'}`}>
                                                    {displayPrice.period}
                                                </span>
                                            )}
                                        </div>

                                        <div className="space-y-4 mb-12">
                                            {(plan.features || []).map((f, idx) => (
                                                <div key={idx} className="flex items-center gap-3">
                                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isPopular ? 'bg-white/10' : 'bg-primary/10'}`}>
                                                        <Check className={`w-3.5 h-3.5 ${isPopular ? 'text-white' : 'text-primary'}`} />
                                                    </div>
                                                    <span className="text-sm font-bold">{f}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleSubscribeClick(plan)}
                                        className={`group w-full h-16 rounded-full text-lg font-bold transition-all flex items-center justify-center gap-2 ${isPopular
                                            ? 'bg-white text-foreground hover:scale-105 active:scale-95'
                                            : 'bg-primary text-white hover:scale-105 active:scale-95'
                                            }`}
                                    >
                                        {isFree ? 'Get Started' : 'Subscribe Now'}
                                        <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                    </button>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
};

export default Pricing;
