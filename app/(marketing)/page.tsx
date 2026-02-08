"use client";

import { useEffect, useState } from "react";
import Hero from '@/components/marketing/Hero';
import StatsSection from '@/components/marketing/StatsSection';
import FeatureGrid from '@/components/marketing/FeatureGrid';
import MultistreamSection from '@/components/marketing/MultistreamSection';
import Pricing from '@/components/marketing/Pricing';
import Testimonials from '@/components/marketing/Testimonials';
import FAQ from '@/components/marketing/FAQ';
import { FadeIn } from "@/components/ui/AnimationWrapper";


export default function Home() {



  return (
    <div className="min-h-screen relative bg-white text-slate-900">
      {/* Decorative floating elements */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-12 h-12 bg-indigo-500/10 rounded-full blur-xl" />
        <div className="absolute top-[30%] right-[10%] w-24 h-24 bg-purple-500/10 rounded-full blur-2xl" />
        <div className="absolute bottom-[20%] left-[15%] w-32 h-32 bg-pink-500/5 rounded-full blur-3xl" />
      </div>


      <main>
        <Hero />

        <FadeIn delay={0.2}>
          <StatsSection />
        </FadeIn>

        <FadeIn>
          <FeatureGrid />
        </FadeIn>

        <FadeIn>
          <MultistreamSection />
        </FadeIn>

        <FadeIn>
          <Pricing />
        </FadeIn>

        <FadeIn>
          <Testimonials />
        </FadeIn>

        <FadeIn>
          <FAQ />
        </FadeIn>
      </main>


    </div>
  );
}

