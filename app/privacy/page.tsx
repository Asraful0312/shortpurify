"use client"

import { motion } from "framer-motion";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";

export default function PrivacyPolicy() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      <Navbar />
      
      <main className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={fadeIn.initial}
            animate={fadeIn.animate}
            transition={fadeIn.transition}
            className="space-y-12"
          >
            {/* Header */}
            <header className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary">
                Privacy Policy
              </h1>
              <p className="text-muted-foreground font-medium">
                Last updated: March 24, 2026
              </p>
              <div className="h-1 w-20 bg-accent rounded-full" />
            </header>

            {/* Content Sections */}
            <div className="prose prose-stone prose-lg max-w-none space-y-10 text-foreground/80">
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">1. Introduction</h2>
                <p>
                  At ShortPurify, we take your privacy seriously. This Privacy Policy explains how we collect, use, 
                  disclose, and safeguard your information when you use our AI-powered short-form clip generator 
                  accessible via shortpurify.com.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">2. Information We Collect</h2>
                <div className="grid md:grid-grid-cols-2 gap-6 not-prose">
                  <div className="bg-white/50 border border-border/60 p-6 rounded-2xl">
                    <h3 className="font-bold text-lg mb-2">Personal Data</h3>
                    <p className="text-sm text-muted-foreground">
                      We collect information you provide directly to us, such as your name, email address, 
                      and account preferences when you register via Clerk.
                    </p>
                  </div>
                  <div className="bg-white/50 border border-border/60 p-6 rounded-2xl">
                    <h3 className="font-bold text-lg mb-2">Video Data</h3>
                    <p className="text-sm text-muted-foreground">
                      Our service processes YouTube URLs and video files provided by you to generate clips. 
                      This data is stored temporarily on Cloudflare R2 or similar secure storage.
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">3. How We Use Your Information</h2>
                <p>
                  We use the information we collect to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide, operate, and maintain our Service.</li>
                  <li>Improve, personalize, and expand our Service.</li>
                  <li>Understand and analyze how you use our Service.</li>
                  <li>Develop new products, services, features, and functionality.</li>
                  <li>Communicate with you for customer service or marketing purposes.</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">4. Data Security</h2>
                <p>
                  We implement a variety of security measures to maintain the safety of your personal information. 
                  Your data is stored in secure networks and is only accessible by a limited number of persons 
                  who have special access rights to such systems.
                </p>
              </section>

              <section className="space-y-4 text-center py-10 bg-secondary/30 rounded-3xl border border-border/40">
                <h2 className="text-2xl font-bold text-foreground">Questions?</h2>
                <p className="max-w-md mx-auto">
                  If you have any questions about this Privacy Policy, please contact us at support@shortpurify.com.
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
