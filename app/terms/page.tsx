"use client"

import { motion } from "framer-motion";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";

export default function TermsOfService() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
  
      
      <main className="pt-12 pb-20 px-4">
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
                Terms of Service
              </h1>
              <p className="text-muted-foreground font-medium">
                Last updated: March 24, 2026
              </p>
              <div className="h-1 w-20 bg-accent rounded-full" />
            </header>

            {/* Content Sections */}
            <div className="prose prose-stone prose-lg max-w-none space-y-10 text-foreground/80">
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">1. Acceptance of Terms</h2>
                <p>
                  By accessing and using our website, ShortPurify, you agree to be bound by these Terms of Service. 
                  If you disagree with any part of these terms, you may not access the Service.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">2. Description of Service</h2>
                <p>
                  ShortPurify is an AI-powered short-form clip generator that allows users to create vertical 
                  video content for social media platforms. The service uses AI models and processing algorithms 
                  to identify viral segments and format them automatically.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">3. User Accounts</h2>
                <p>
                  To use certain features of the Service, you must register for an account via Clerk. 
                  You are responsible for maintaining the confidentiality of your account credentials 
                  and for all activities that occur under your account.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">4. Code of Conduct</h2>
                <div className="bg-white/50 border border-border/60 p-6 rounded-2xl not-prose">
                  <p className="font-medium mb-4">You agree not to use the Service for:</p>
                  <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
                    <li>Generating content that is illegal, harmful, or offensive.</li>
                    <li>Violating the intellectual property rights of others.</li>
                    <li>Attempting to interfere with the security or integrity of our systems.</li>
                    <li>Exploiting the AI models for data extraction or competitive purposes.</li>
                  </ul>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">5. Limitation of Liability</h2>
                <p>
                  In no event shall ShortPurify, its directors, employees, partners, or affiliates be liable for 
                  any indirect, incidental, special, consequential, or punitive damages arising out of your 
                  use of the Service.
                </p>
              </section>

              <section className="space-y-4 text-center py-10 bg-secondary/30 rounded-3xl border border-border/40">
                <p className="max-w-md mx-auto italic text-sm">
                  These terms are subject to change. Continued use of the Service after changes constitute acceptance 
                   of the updated terms.
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
