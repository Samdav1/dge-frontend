import dynamic from 'next/dynamic';
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/features/landing/components/HeroSection";
import { CategoriesSection } from "@/features/landing/components/CategoriesSection";
import { TrendingServicesSection } from "@/features/landing/components/TrendingServicesSection";
import { AboutUsSection } from "@/features/landing/components/AboutUsSection";
import { ValuePropsSection } from "@/features/landing/components/ValuePropsSection";
import { TestimonialsSection } from "@/features/landing/components/TestimonialsSection";
import { JobListingSection } from "@/features/landing/components/JobListingSection";
import { DrivingSection } from "@/features/landing/components/DrivingSection";
import { EcosystemSection } from "@/features/landing/components/EcosystemSection";
import { PlatformVisionSection } from "@/features/landing/components/PlatformVisionSection";

// Dynamic import for FAQ Section to demonstrate lazy loading/code splitting
const FAQSection = dynamic(() => import('@/features/landing/components/FAQSection').then(mod => mod.FAQSection), {
  loading: () => <p className="text-center py-20">Loading FAQs...</p>,
});

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans overflow-x-hidden w-full max-w-full">
      <Header />

      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        <HeroSection />
        <CategoriesSection />
        <TrendingServicesSection />
        <EcosystemSection />
        <PlatformVisionSection />
        <AboutUsSection />
        <ValuePropsSection />
        <DrivingSection />
        <TestimonialsSection />
        <JobListingSection />
        <FAQSection />
      </main>

      <Footer />
    </div>
  );
}
