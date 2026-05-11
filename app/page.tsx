import type { Metadata } from "next";
import Navbar from "@/components/shared/navbar";
import HeroSection from "@/components/home/hero-section";
import IntegrationsSection from "@/components/home/integrations-section";
import FeaturesSection from "@/components/home/features-section";
import AutomatedWorkflowsSection from "@/components/home/automated-workflow-section";
import HowItWorksSection from "@/components/home/how-it-works-section";
import SocialProofSection from "@/components/home/social-proof-section";
import PricingSection from "@/components/home/pricing-section";
import FaqSection from "@/components/home/faq-section";
import CTASection from "@/components/home/cta-section";
import Footer from "@/components/shared/footer";

export const metadata: Metadata = {
  title: "ShortPurify – AI Short-Form Clip Generator",
  description:
    "Turn long-form videos into viral short clips with AI. Auto-generate captions, smart crop for 9:16, and publish directly to TikTok, Instagram Reels, YouTube Shorts and more.",
  alternates: {
    canonical: "https://shortpurify.com",
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "What is ShortPurify and how does it work?",
                "acceptedAnswer": { "@type": "Answer", "text": "ShortPurify is an AI-powered clip generator. You upload a long-form video (podcast, interview, webinar, YouTube video) and the AI finds the most engaging moments, smart-crops them to 9:16, burns in captions, and exports ready-to-post vertical clips for TikTok, Instagram Reels, YouTube Shorts, and more — in minutes." },
              },
              {
                "@type": "Question",
                "name": "Which social platforms does ShortPurify publish to?",
                "acceptedAnswer": { "@type": "Answer", "text": "ShortPurify supports direct publishing to TikTok, Instagram Reels, YouTube Shorts, LinkedIn, Facebook, X (Twitter), Threads, and Bluesky. You can also download a ZIP of all clips and post manually." },
              },
              {
                "@type": "Question",
                "name": "Is there a free plan? What are the limits?",
                "acceptedAnswer": { "@type": "Answer", "text": "Yes — the Starter plan is completely free with no credit card required. You get 2 projects per month, 3 AI clips per project, and videos up to 10 minutes. Pro Creator ($24/mo) and Agency ($79/mo) plans unlock more projects, longer videos, and watermark-free exports." },
              },
              {
                "@type": "Question",
                "name": "How long does it take to generate clips from a video?",
                "acceptedAnswer": { "@type": "Answer", "text": "Most videos finish processing within 2–5 minutes. Processing time scales with video length — a 10-minute video typically takes around 2 minutes; a 60-minute video may take 5–8 minutes. You'll see a progress indicator while the AI works." },
              },
              {
                "@type": "Question",
                "name": "Are captions added automatically?",
                "acceptedAnswer": { "@type": "Answer", "text": "Yes. ShortPurify transcribes your video with AI and burns subtitles directly into each clip. You can choose from multiple caption styles and adjust font, size, color, and position before exporting." },
              },
              {
                "@type": "Question",
                "name": "Do the exported clips have a watermark?",
                "acceptedAnswer": { "@type": "Answer", "text": "Free Starter plan clips include a small ShortPurify watermark. Upgrading to Pro Creator or Agency removes all watermarks from your exports." },
              },
              {
                "@type": "Question",
                "name": "Can I use ShortPurify with my team or agency?",
                "acceptedAnswer": { "@type": "Answer", "text": "Yes. The Agency plan ($79/mo) includes workspace support so multiple team members can collaborate on projects, share clips, and publish from a single account." },
              },
            ],
          }),
        }}
      />
      <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
        <Navbar />
        <main className="overflow-x-hidden">
          <HeroSection />
          <IntegrationsSection />
          <FeaturesSection />
          <AutomatedWorkflowsSection />
          <HowItWorksSection />
          <SocialProofSection />
          <PricingSection />
          <FaqSection />
          <CTASection />
        </main>
        <Footer />
      </div>
    </>
  );
}
