"use client";

import { useState } from "react";
import { CheckCircle2, Zap, Crown, Building2, CreditCard, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    icon: Zap,
    price: { monthly: 0, yearly: 0 },
    description: "Perfect for getting started",
    features: [
      "3 projects / month",
      "720p export",
      "Basic AI captions",
      "Manual publish",
    ],
    current: true,
    cta: "Current Plan",
    color: "border-primary bg-primary/5",
    badge: null,
  },
  {
    id: "pro",
    name: "Pro Creator",
    icon: Crown,
    price: { monthly: 29, yearly: 24 },
    description: "For serious content creators",
    features: [
      "30 projects / month",
      "4K export",
      "Viral hook detection",
      "Auto-captions + B-roll",
      "Auto-publish (Upload-Post)",
      "Basic analytics",
    ],
    current: false,
    cta: "Upgrade to Pro",
    color: "border-border",
    badge: "Most Popular",
  },
  {
    id: "agency",
    name: "Agency",
    icon: Building2,
    price: { monthly: 99, yearly: 82 },
    description: "Scale with your team",
    features: [
      "Unlimited projects",
      "Team workspaces (5 seats)",
      "Bulk publish + scheduling",
      "Advanced analytics",
      "Priority support",
      "Custom templates",
    ],
    current: false,
    cta: "Upgrade to Agency",
    color: "border-border",
    badge: null,
  },
];

const USAGE = [
  { label: "Projects Used", used: 2, total: 3, unit: "projects" },
  { label: "AI Credits", used: 7, total: 10, unit: "clips" },
  { label: "Exports", used: 5, total: 10, unit: "exports" },
];

const INVOICES = [
  { date: "Mar 1, 2026", amount: "$0.00", status: "Free", plan: "Starter" },
  { date: "Feb 1, 2026", amount: "$0.00", status: "Free", plan: "Starter" },
];

export default function BillingPage() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto w-full min-h-full flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Billing & Plans</h1>
        <p className="text-muted-foreground mt-1">Manage your subscription and usage.</p>
      </div>

      {/* Current Usage */}
      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-extrabold text-base">Current Usage — Starter (Free)</h2>
          <span className="text-xs font-bold bg-green-100 text-green-700 px-2.5 py-1 rounded-full border border-green-200">Active</span>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {USAGE.map(({ label, used, total, unit }) => (
            <div key={label}>
              <div className="flex justify-between items-end mb-2">
                <p className="text-sm font-bold">{label}</p>
                <p className="text-xs text-muted-foreground font-medium">
                  {used}/{total} {unit}
                </p>
              </div>
              <Progress value={(used / total) * 100} />
              {used >= total && (
                <p className="text-xs text-red-500 font-bold mt-1">Limit reached — upgrade to continue</p>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4 font-medium">
          Resets on <strong>April 1, 2026</strong>
        </p>
      </div>

      {/* Plan Toggle */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-extrabold text-lg">Plans</h2>
          <div className="flex items-center gap-1 bg-secondary p-1 rounded-xl">
            {(["monthly", "yearly"] as const).map((b) => (
              <button
                key={b}
                onClick={() => setBilling(b)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all capitalize ${
                  billing === b
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {b}
                {b === "yearly" && (
                  <span className="ml-1.5 text-[10px] font-extrabold text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">
                    −17%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {PLANS.map(({ id, name, icon: Icon, price, description, features, current, cta, color, badge }) => (
            <div
              key={id}
              className={`relative border-2 rounded-2xl p-6 shadow-sm flex flex-col gap-5 bg-white ${color}`}
            >
              {badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full shadow">
                  {badge}
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Icon size={20} />
                </div>
                <div>
                  <p className="font-extrabold">{name}</p>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
              </div>

              <div>
                <span className="text-4xl font-extrabold tracking-tight">
                  ${billing === "yearly" ? price.yearly : price.monthly}
                </span>
                {price.monthly > 0 && (
                  <span className="text-muted-foreground text-sm ml-1">/mo</span>
                )}
                {price.monthly === 0 && (
                  <span className="text-muted-foreground text-sm ml-1">forever</span>
                )}
              </div>

              <ul className="flex flex-col gap-2 flex-1">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 size={15} className="text-green-600 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                disabled={current}
                className={`w-full py-2.5 rounded-xl font-extrabold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 ${
                  current
                    ? "bg-secondary text-muted-foreground cursor-default"
                    : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-xl"
                }`}
              >
                {current ? (
                  <><CheckCircle2 size={15} /> {cta}</>
                ) : (
                  <><ArrowUpRight size={15} /> {cta}</>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
        <h2 className="font-extrabold text-base mb-4">Payment Method</h2>
        <div className="flex items-center gap-4 p-4 border border-border rounded-xl">
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
            <CreditCard size={20} className="text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-bold text-muted-foreground">No payment method added</p>
            <p className="text-xs text-muted-foreground">Add a card to upgrade your plan.</p>
          </div>
          <button className="ml-auto text-sm font-bold text-primary hover:underline">
            Add Card
          </button>
        </div>
      </div>

      {/* Invoice History */}
      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
        <h2 className="font-extrabold text-base mb-4">Invoice History</h2>
        <div className="flex flex-col divide-y divide-border">
          {INVOICES.map((inv, i) => (
            <div key={i} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-semibold">{inv.date}</p>
                <p className="text-xs text-muted-foreground">{inv.plan} plan</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-extrabold">{inv.amount}</span>
                <Badge variant="secondary" className="text-[10px]">{inv.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
