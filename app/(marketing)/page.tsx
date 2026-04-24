import Hero from '@/components/marketing/Hero';
import StatsSection from '@/components/marketing/StatsSection';
import FeatureGrid from '@/components/marketing/FeatureGrid';
import HowItWorks from '@/components/marketing/HowItWorks';
import Testimonials from '@/components/marketing/Testimonials';
import Pricing from '@/components/marketing/Pricing';
import FAQ from '@/components/marketing/FAQ';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <StatsSection />
      <FeatureGrid />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <FAQ />
    </div>
  );
}
