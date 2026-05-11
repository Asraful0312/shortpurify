"use client"

import { SignUpButton } from "@clerk/clerk-react";
import { Zap } from "lucide-react";
import { motion } from "framer-motion";

function CTASection() {
  return (
    <section className="py-16 md:py-32 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--color-primary)_0,transparent_100%)] opacity-[0.03]"></div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="container mx-auto px-4 relative z-10 text-center"
      >
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold mb-4 md:mb-6 tracking-tight">Ready to go viral?</h2>
        <p className="text-base sm:text-xl text-muted-foreground mb-8 md:mb-12 max-w-2xl mx-auto">
          Stop leaving views on the table. Join ShortPurify today and let our AI do the heavy lifting for you.
        </p>
        <SignUpButton mode="modal">
          <button className="bg-primary text-primary-foreground px-6 py-4 sm:px-10 sm:py-5 rounded-full text-base sm:text-xl font-bold transition-all hover:bg-primary/95 hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 group flex items-center justify-center gap-2 mx-auto cursor-pointer">
            Create Your First Clip Free
            <Zap className="text-accent ml-2 group-hover:scale-110 transition-transform" fill="currentColor" size={20} />
          </button>
        </SignUpButton>
        <p className="mt-8 text-sm font-medium text-muted-foreground">2 free projects, no credit card required. Cancel anytime.</p>
      </motion.div>
    </section>
  );
}


export default CTASection