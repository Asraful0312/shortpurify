"use client"

import { useState } from "react";
import { SignUpButton } from "@clerk/clerk-react";
import { ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type PlanFeature = { text: string; included: boolean };

const plans = [
  {
    name: "Starter",
    desc: "Try the AI magic for free — no credit card needed.",
    monthlyPrice: "$0",
    yearlyPrice: "$0",
    features: [
      { text: "5 projects / month", included: true },
      { text: "60 min of input video / month", included: true },
      { text: "YouTube Shorts + TikTok only", included: true },
      { text: "AI clip detection (4–6 clips)", included: true },
      { text: "Smart crop & blur background", included: true },
      { text: "Watermark-free exports", included: false },
      { text: "Team workspace", included: false },
      { text: "Scheduled publishing", included: false },
    ] satisfies PlanFeature[],
    cta: "Get Started Free",
    highlighted: false,
  },
  {
    name: "Pro Creator",
    desc: "For serious creators who want to dominate every platform.",
    monthlyPrice: "$24",
    yearlyPrice: "$19",
    features: [
      { text: "30 projects / month", included: true },
      { text: "300 min of input video / month", included: true },
      { text: "All 9 platforms + multi-account", included: true },
      { text: "No watermark — full quality", included: true },
      { text: "Subtitle editor + burn-in", included: true },
      { text: "Scheduled publishing", included: true },
      { text: "1 workspace · 3 team members", included: true },
      { text: "Multiple workspaces", included: false },
    ] satisfies PlanFeature[],
    cta: "Start 14-Day Free Trial",
    highlighted: true,
  },
  {
    name: "Agency",
    desc: "Scale content production across unlimited clients and teams.",
    monthlyPrice: "$79",
    yearlyPrice: "$63",
    features: [
      { text: "Unlimited projects", included: true },
      { text: "1,500 min of input video / month", included: true },
      { text: "All 9 platforms + unlimited accounts", included: true },
      { text: "Unlimited team seats + RBAC", included: true },
      { text: "Multiple workspaces", included: true },
      { text: "Scheduled publishing", included: true },
      { text: "Priority support", included: true },
      { text: "Custom branding (coming soon)", included: true },
    ] satisfies PlanFeature[],
    cta: "Start 14-Day Free Trial",
    highlighted: false,
  },
];

function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section id="pricing" className="py-24 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="container mx-auto px-4 max-w-6xl"
      >
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent mb-6">
            <span className="text-sm font-medium">Simple Pricing</span>
          </div>
          <h2 className="text-4xl font-extrabold mb-4">Choose your perfect plan</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Most tools stop at exporting clips. ShortPurify publishes them. No hidden fees, cancel anytime.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={cn("text-lg font-bold transition-colors", !isYearly ? "text-foreground" : "text-muted-foreground")}>Monthly</span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="relative w-16 h-8 rounded-full bg-secondary border border-border/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
            >
              <div
                className={cn(
                  "absolute top-1 left-1 w-6 h-6 rounded-full bg-primary shadow-md transition-transform duration-300",
                  isYearly ? "translate-x-8" : "translate-x-0"
                )}
              />
            </button>
            <span className={cn("text-lg font-bold transition-colors flex items-center gap-2", isYearly ? "text-foreground" : "text-muted-foreground")}>
              Yearly{" "}
              <span className="text-xs bg-[#A8E6A1] text-green-950 px-2 py-0.5 rounded-full font-extrabold border border-green-300 shadow-sm">
                Save 20%
              </span>
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-center">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`rounded-[2rem] p-8 w-full transition-all duration-300 relative ${
                plan.highlighted
                  ? "bg-primary text-primary-foreground shadow-2xl scale-100 md:scale-105 border-transparent z-10"
                  : "bg-white text-foreground border border-border shadow-sm hover:shadow-xl hover:-translate-y-1"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-accent text-accent-foreground px-4 py-1 rounded-full text-sm font-bold shadow-md">
                  Most Popular
                </div>
              )}
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className={`text-sm mb-6 h-10 ${plan.highlighted ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                {plan.desc}
              </p>
              <div className="mb-6">
                <div className="flex items-end gap-1">
                  <span className="text-5xl font-extrabold">{isYearly ? plan.yearlyPrice : plan.monthlyPrice}</span>
                  <span className={`text-sm font-medium ${plan.highlighted ? "text-primary-foreground/80" : "text-muted-foreground"} mb-1`}>
                    {plan.monthlyPrice === "$0" ? " forever" : " /mo"}
                  </span>
                </div>
                {isYearly && plan.monthlyPrice !== "$0" ? (
                  <div className={`mt-2 text-[11px] font-semibold uppercase tracking-wider ${plan.highlighted ? "text-primary-foreground/70" : "text-muted-foreground/70"}`}>
                    Billed annually · 2 months free
                  </div>
                ) : (
                  <div className="mt-2 text-[11px] opacity-0">placeholder</div>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex gap-3 items-center">
                    {feature.included ? (
                      <CheckCircle2 size={17} className={`shrink-0 ${plan.highlighted ? "text-accent" : "text-primary"}`} />
                    ) : (
                      <XCircle size={17} className={`shrink-0 ${plan.highlighted ? "text-primary-foreground/30" : "text-muted-foreground/40"}`} />
                    )}
                    <span className={`text-sm font-medium ${!feature.included ? (plan.highlighted ? "text-primary-foreground/40" : "text-muted-foreground/50") : ""}`}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <SignUpButton mode="modal">
                <button
                  className={`w-full py-4 cursor-pointer rounded-full font-bold transition-all flex items-center justify-center gap-2 group ${
                    plan.highlighted
                      ? "bg-white text-primary hover:bg-white/90 shadow-lg hover:shadow-xl"
                      : "bg-secondary text-foreground hover:bg-secondary/80"
                  }`}
                >
                  {plan.cta}
                  <ArrowRight size={18} className={`transition-transform group-hover:translate-x-1 ${plan.highlighted ? "text-primary" : "text-foreground"}`} />
                </button>
              </SignUpButton>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <p className="text-center text-sm text-muted-foreground mt-10">
          All paid plans include a <strong>14-day free trial</strong> — no credit card required. Cancel anytime.
        </p>
      </motion.div>
    </section>
  );
}

export default PricingSection;
