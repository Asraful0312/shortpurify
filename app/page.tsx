import Navbar from "@/components/shared/navbar";
import HeroSection from "@/components/home/hero-section";
import IntegrationsSection from "@/components/home/integrations-section";
import FeaturesSection from "@/components/home/features-section";
import AutomatedWorkflowsSection from "@/components/home/automated-workflow-section";
import HowItWorksSection from "@/components/home/how-it-works-section";
import SocialProofSection from "@/components/home/social-proof-section";
import PricingSection from "@/components/home/pricing-section";
import CTASection from "@/components/home/cta-section";
import Footer from "@/components/shared/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      <Navbar />
      <main>
        <HeroSection />
        <IntegrationsSection />
        <FeaturesSection />
        <AutomatedWorkflowsSection />
        <HowItWorksSection />
        <SocialProofSection />
        <PricingSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
