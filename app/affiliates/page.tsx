import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import { ArrowRight, BadgeDollarSign, BarChart3, Clock, CreditCard, Globe, LayoutDashboard, Repeat, Shield, Users, Zap } from "lucide-react";

const AFFILIATE_JOIN_URL = "https://affiliates.creem.io/join/shortpurify";

export const metadata: Metadata = {
  title: "Affiliate Program – Earn 30% Recurring Commission | ShortPurify",
  description:
    "Join the ShortPurify affiliate program and earn 30% lifetime recurring commission for every customer you refer. Automated payouts, real-time dashboard, and no cap on earnings. Perfect for content creators, YouTubers, and marketing educators.",
  alternates: {
    canonical: "https://shortpurify.com/affiliates",
  },
  openGraph: {
    title: "Earn 30% Recurring Commission, ShortPurify Affiliate Program",
    description:
      "Promote the AI clip generator that content creators love. Earn 30% recurring commission per referral with automated monthly payouts.",
    url: "https://shortpurify.com/affiliates",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Earn 30% Recurring Commission, ShortPurify Affiliate Program",
    description:
      "Promote the AI clip generator that content creators love. Earn 30% recurring commission per referral with automated monthly payouts.",
  },
};

const STATS = [
  { value: "30%", label: "Recurring commission", icon: BadgeDollarSign },
  { value: "Lifetime", label: "Recurring commission per referral", icon: Repeat },
  { value: "180 days", label: "Cookie window", icon: Clock },
  { value: "$0", label: "Cost to join", icon: Shield },
];

const FEATURES = [
  {
    icon: BarChart3,
    title: "Real-time dashboard",
    description: "Track clicks, signups, and earnings in your Creem affiliate dashboard. No guessing, full transparency.",
  },
  {
    icon: CreditCard,
    title: "Automated payouts",
    description: "Get paid automatically twice a month via bank transfer or USDC. No invoice needed, no chasing payments.",
  },
  {
    icon: Globe,
    title: "USDC crypto payouts",
    description: "International creator? USDC payouts bypass banking friction in countries where PayPal and wires are painful.",
  },
  {
    icon: LayoutDashboard,
    title: "Ready-made assets",
    description: "We provide demo videos, screenshots, and copy you can use straight away zero production effort needed.",
  },
  {
    icon: Zap,
    title: "High-converting product",
    description: "ShortPurify solves a real, expensive problem for creators. Warm audiences convert fast when they see it in action.",
  },
  {
    icon: Users,
    title: "Dedicated support",
    description: "Direct founder support. If you need a custom demo, a promo code, or a collab idea just DM us.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Apply for free",
    description: "Click the button below and apply through our Creem affiliate portal. Manual approval usually takes under 24 hours.",
  },
  {
    step: "02",
    title: "Get your unique link",
    description: "Once approved you get a personal affiliate link (e.g. shortpurify.com?via=yourname) to share anywhere.",
  },
  {
    step: "03",
    title: "Promote naturally",
    description: "Create a YouTube review, TikTok demo, or just mention it in your newsletter. Show it working, conversions follow.",
  },
  {
    step: "04",
    title: "Earn every month",
    description: "You earn 30% of every renewal for as long as the customer stays subscribed. One good video can pay you every single month, forever.",
  },
];

const FAQS = [
  {
    q: "How much can I earn?",
    a: "30% of every successful payment your referrals make, for as long as they stay subscribed. A single Pro referral ($24/mo) earns you $7.20/month forever. Agency referrals ($79/mo) earn $23.70/month per customer. There is no cap.",
  },
  {
    q: "When and how do I get paid?",
    a: "Payouts are processed automatically twice per month through Creem. You can receive payments via bank transfer (ACH/SEPA/international wire) or USDC stablecoin, your choice.",
  },
  {
    q: "How long does the cookie last?",
    a: "180 days. If someone clicks your link and subscribes within 180 days, the sale is attributed to you even if they don't sign up immediately.",
  },
  {
    q: "Is there a minimum payout threshold?",
    a: "Creem handles all payout minimums and schedules. Check your affiliate dashboard for the current threshold, it's typically low.",
  },
  {
    q: "Can I promote if I'm outside the US?",
    a: "Absolutely. USDC payouts mean international creators avoid all the traditional banking friction. We actively encourage creators from any country to apply.",
  },
  {
    q: "Do I need a large audience?",
    a: "No. Micro-creators with 1,000–20,000 highly engaged followers often outperform big channels because their audience trusts their recommendations. Quality over quantity.",
  },
  {
    q: "What content works best?",
    a: "Screen-recorded demos, tutorials, and honest reviews perform best. Showing ShortPurify take a 30-minute video and generate 6 viral clips in 3 minutes is extremely compelling content on its own.",
  },
];

export default function AffiliatesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": FAQS.map(({ q, a }) => ({
              "@type": "Question",
              "name": q,
              "acceptedAnswer": { "@type": "Answer", "text": a },
            })),
          }),
        }}
      />
      <Navbar />

      {/* Hero */}
      <section className="pt-40 pb-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
            Affiliate Program
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-6">
            Earn{" "}
            <span className="text-primary">30% recurring</span>{" "}
            for every creator you send our way
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            ShortPurify turns long videos into viral short clips with AI. Promote a tool your audience actually wants and earn real recurring income, automatically, every month.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={AFFILIATE_JOIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3.5 rounded-full font-semibold text-base transition-all hover:shadow-lg"
            >
              Apply for free <ArrowRight size={18} />
            </a>
            <Link
              href="/#pricing"
              className="inline-flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/80 text-foreground px-8 py-3.5 rounded-full font-semibold text-base transition-colors border border-border/50"
            >
              See what you&apos;re promoting
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 bg-secondary/30 border-y border-border/40">
        <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map(({ value, label, icon: Icon }) => (
            <div key={label} className="flex flex-col items-center text-center gap-2">
              <Icon size={24} className="text-primary" />
              <p className="text-3xl font-extrabold">{value}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-extrabold text-center mb-12">How it works</h2>
          <div className="grid sm:grid-cols-2 gap-8">
            {STEPS.map(({ step, title, description }) => (
              <div key={step} className="flex gap-5">
                <span className="text-4xl font-black text-primary/20 leading-none shrink-0">{step}</span>
                <div>
                  <h3 className="font-bold text-lg mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-secondary/30 border-y border-border/40">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-extrabold text-center mb-4">Built for creators, not marketers</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            No complicated dashboards, no delayed payments, no confusing T&amp;Cs. Just a clean program that pays you reliably.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div key={title} className="bg-background rounded-2xl border border-border/60 p-6 flex flex-col gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon size={20} className="text-primary" />
                </div>
                <h3 className="font-bold">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Earnings calculator */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold text-center mb-4">What could you earn?</h2>
          <p className="text-center text-muted-foreground mb-10">Based on 30% lifetime recurring commission.</p>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { plan: "Pro plan referral", price: "$24/mo", monthly: "$7.20", annual: "$86.40", highlight: false },
              { plan: "Agency plan referral", price: "$79/mo", monthly: "$23.70", annual: "$284.40", highlight: true },
            ].map(({ plan, price, monthly, annual, highlight }) => (
              <div
                key={plan}
                className={`rounded-2xl border p-6 flex flex-col gap-4 ${
                  highlight ? "border-primary bg-primary/5" : "border-border/60 bg-background"
                }`}
              >
                <div>
                  <p className="font-bold text-lg">{plan}</p>
                  <p className="text-sm text-muted-foreground">Customer pays {price}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">You earn / month</span>
                    <span className="font-bold text-primary">{monthly}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">You earn / year</span>
                    <span className="font-bold">{annual}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Per customer, every month, for as long as they stay.</p>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-6">
            10 Agency referrals = <span className="font-bold text-foreground">$237/month, every month, for life.</span>
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-secondary/30 border-t border-border/40">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold text-center mb-12">Frequently asked questions</h2>
          <div className="flex flex-col divide-y divide-border/60">
            {FAQS.map(({ q, a }) => (
              <div key={q} className="py-5">
                <p className="font-semibold mb-2">{q}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-extrabold mb-4">Ready to start earning?</h2>
          <p className="text-muted-foreground mb-8">
            Apply in 2 minutes. We review applications within 24 hours. No upfront commitment, just share your link and earn.
          </p>
          <a
            href={AFFILIATE_JOIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-10 py-4 rounded-full font-bold text-base transition-all hover:shadow-lg"
          >
            Apply for free <ArrowRight size={18} />
          </a>
          <p className="text-xs text-muted-foreground mt-4">
            Questions? <Link href="/contact" className="underline underline-offset-2 hover:text-foreground transition-colors">Contact us</Link>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
