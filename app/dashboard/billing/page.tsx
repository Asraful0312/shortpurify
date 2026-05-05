"use client";

import { useState, useEffect, useRef } from "react";
import {
  CheckCircle2, XCircle, Zap, Crown, Building2,
  CreditCard, ArrowUpRight, Lock, Loader2, ExternalLink, Info,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useWorkspace } from "@/components/workspace-context";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Confetti, type ConfettiRef } from "@/components/ui/confetti";

type PlanFeature = { text: string; included: boolean; tooltip?: string };

/**
 * Creem product IDs — fill these in after creating products in your Creem dashboard.
 * npx convex env set CREEM_API_KEY <key>
 * npx convex env set CREEM_WEBHOOK_SECRET <secret>
 * Then run: npx convex run billing:syncBillingProducts
 */
const PRODUCT_IDS = {
  pro: {
    monthly: "prod_2XWg0m0jgCJqg0f4HjLvzT",   // TODO: replace with real Creem product ID
    yearly:  "prod_37OuTfnzhHVjvf5ljEAB8F",    // TODO: replace with real Creem product ID
  },
  agency: {
    monthly: "prod_17EgXmdXdpntOArieGAc14", // TODO: replace with real Creem product ID
    yearly:  "prod_77Pg3SXfh59ALQbNCFDsID",  // TODO: replace with real Creem product ID
  },
};

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    icon: Zap,
    price: { monthly: 0, yearly: 0 },
    description: "Try the AI magic for free",
    limits: { projects: 2, minutes: 20 },
    features: [
      { text: "2 projects / month", included: true },
      { text: "Videos up to 10 min each", included: true },
      { text: "YouTube Shorts & Bluesky", included: true },
      { text: "3 AI clips per project", included: true },
      { text: "3 subtitle re-renders per clip", included: true, tooltip: "Each time you change the subtitle style, font, or position on a clip and re-export it, that counts as 1 re-render." },
      { text: "7-day clip storage", included: true },
      { text: "Watermark on exports", included: false },
      { text: "Zip download", included: false },
      { text: "Scheduled publishing", included: false },
    ] satisfies PlanFeature[],
    color: "border-primary bg-primary/5",
    badge: null,
  },
  {
    id: "pro",
    name: "Pro Creator",
    icon: Crown,
    price: { monthly: 24, yearly: 19 },
    description: "For serious content creators",
    limits: { projects: 30, minutes: 300 },
    features: [
      { text: "30 projects / month", included: true },
      { text: "300 min of input video / month", included: true },
      { text: "YouTube, Bluesky + TikTok, Instagram, LinkedIn, Facebook, Threads & X", included: true },
      { text: "2 connected Pro platform accounts", included: true },
      { text: "8 AI clips per project", included: true },
      { text: "10 subtitle re-renders per clip", included: true, tooltip: "Each time you change the subtitle style, font, or position on a clip and re-export it, that counts as 1 re-render." },
      { text: "90-day clip storage", included: true },
      { text: "No watermark — full quality", included: true },
      { text: "Zip download + metadata export", included: true },
      { text: "Scheduled publishing", included: true },
      { text: "1 workspace · 3 team members", included: true },
      { text: "Multiple workspaces", included: false },
    ] satisfies PlanFeature[],
    color: "border-border",
    badge: "Most Popular",
  },
  {
    id: "agency",
    name: "Agency",
    icon: Building2,
    price: { monthly: 79, yearly: 63 },
    description: "Scale with your team",
    limits: { projects: Infinity, minutes: 1500 },
    features: [
      { text: "Unlimited projects", included: true },
      { text: "1,500 min of input video / month", included: true },
      { text: "YouTube, Bluesky + TikTok, Instagram, LinkedIn, Facebook, Threads & X", included: true },
      { text: "Unlimited connected Pro platform accounts", included: true },
      { text: "15 AI clips per project", included: true },
      { text: "Unlimited subtitle re-renders", included: true, tooltip: "Change subtitle style, font, or position and re-export as many times as you want — no limits." },
      { text: "365-day clip storage", included: true },
      { text: "Zip download + metadata export", included: true },
      { text: "Unlimited team seats + RBAC", included: true },
      { text: "Multiple workspaces", included: true },
      { text: "Scheduled publishing", included: true },
      { text: "Priority support", included: true },
      { text: "Custom branding (coming soon)", included: true },
    ] satisfies PlanFeature[],
    color: "border-border",
    badge: null,
  },
];


export default function BillingPage() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { isOwner, isLoading, activeOrgId } = useWorkspace();
  const router = useRouter();
  const searchParams = useSearchParams();
  const confettiRef = useRef<ConfettiRef>(null);

  const usage = useQuery(api.usage.getUsage, { workspaceId: activeOrgId ?? undefined });
  const createCheckout = useAction(api.billing.createPlanCheckout);
  const openPortal = useAction(api.billing.openBillingPortal);

  // Derive current plan directly from usage (which correctly uses workspaceId for entityId lookup)
  const currentPlanId: "starter" | "pro" | "agency" = usage?.tier ?? "starter";
  const isPaid = currentPlanId !== "starter";
  const currentPeriodEnd = usage?.subscription?.currentPeriodEnd ?? null;
  const cancelAtPeriodEnd = usage?.subscription?.cancelAtPeriodEnd ?? false;
  const activeCategory = isPaid ? "paid" : "free";

  // Real usage numbers (fallback to 0 while loading)
  const projectsUsed = usage?.usage.projectsUsed ?? 0;
  const minutesUsed = usage?.usage.minutesUsed ?? 0;
  // null from getUsage means unlimited (Agency plan); fall back to starter defaults only when usage hasn't loaded yet
  const projectsLimit = usage !== undefined ? (usage?.limits.projects ?? Infinity) : 2;
  const minutesLimit = usage !== undefined ? (usage?.limits.minutes ?? 20) : 20;
  const resetDate = usage?.resetDate ?? "the 1st";

  // Fire confetti when Creem redirects back with ?checkout=success
  useEffect(() => {
    if (searchParams.get("checkout") !== "success") return;
    setShowSuccess(true);
    // Remove param from URL without full navigation
    router.replace("/dashboard/billing", { scroll: false });
    // Small delay so the canvas is mounted before firing
    const t = setTimeout(() => {
      confettiRef.current?.fire({
        particleCount: 180,
        spread: 100,
        origin: { y: 0.5 },
        colors: ["#8B5CF6", "#D8B4FE", "#F59E0B", "#FDE68A", "#10B981"],
      });
    }, 300);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleUpgrade(planId: string) {
    const key = `${planId}_${billing}` as const;
    const productId =
      planId === "pro"
        ? PRODUCT_IDS.pro[billing]
        : PRODUCT_IDS.agency[billing];

    setLoadingPlan(key);
    try {
      const { url } = await createCheckout({
        productId,
        workspaceId: activeOrgId ?? undefined,
        billingCycle: billing,
      });
      window.location.href = url;
    } catch (err) {
      console.error("[billing] checkout failed:", err);
    } finally {
      setLoadingPlan(null);
    }
  }

  async function handlePortal() {
    setPortalLoading(true);
    try {
      const { url } = await openPortal({ workspaceId: activeOrgId ?? undefined });
      window.open(url, "_blank");
    } catch (err) {
      console.error("[billing] portal failed:", err);
    } finally {
      setPortalLoading(false);
    }
  }

  // Only workspace owners can manage billing
  if (!isLoading && !isOwner) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 h-full p-10 text-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
          <Lock size={26} className="text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold">Owner access only</h2>
          <p className="text-muted-foreground text-sm mt-1 max-w-xs">
            Billing is managed by the workspace owner. Contact them to change the plan.
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto w-full min-h-full flex flex-col gap-8">
      {/* Confetti canvas — fixed overlay, fires once on checkout success */}
      <Confetti
        ref={confettiRef}
        manualstart
        className="pointer-events-none fixed inset-0 z-200 w-full h-full"
      />

      {/* Checkout success banner */}
      {showSuccess && (
        <div className="flex items-center gap-4 bg-linear-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-2xl px-5 py-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
            <Crown size={20} className="text-violet-600" />
          </div>
          <div className="flex-1">
            <p className="font-extrabold text-foreground">
              Welcome to {currentPlanId === "pro" ? "Pro Creator" : "Agency"}! 🎉
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Your plan is now active. All new limits apply immediately.
            </p>
          </div>
          <button onClick={() => setShowSuccess(false)} className="p-1.5 rounded-lg hover:bg-violet-100 transition-colors text-muted-foreground shrink-0">
            <XCircle size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Billing & Plans</h1>
          <p className="text-muted-foreground mt-1">Manage your subscription and usage.</p>
        </div>
        {isPaid && (
          <button
            onClick={handlePortal}
            disabled={portalLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-white text-sm font-semibold hover:bg-secondary transition-colors disabled:opacity-50"
          >
            {portalLoading ? <Loader2 size={14} className="animate-spin" /> : <ExternalLink size={14} />}
            Manage Billing
          </button>
        )}
      </div>

      {/* Current subscription banner (paid only) */}
      {isPaid && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center">
              <CheckCircle2 size={16} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-green-900">
                {currentPlanId === "pro" ? "Pro Creator" : "Agency"} Active
              </p>
              {currentPeriodEnd && (
                <p className="text-xs text-green-700">
                  {cancelAtPeriodEnd
                    ? `Cancels on ${new Date(currentPeriodEnd).toLocaleDateString()}`
                    : `Renews on ${new Date(currentPeriodEnd).toLocaleDateString()}`}
                </p>
              )}
            </div>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
            {activeCategory}
          </Badge>
        </div>
      )}

      {/* Current Usage */}
      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-extrabold text-base">
            Current Usage {" "}
            {currentPlanId === "starter" ? "Starter (Free)" : currentPlanId === "pro" ? "Pro Creator" : "Agency"}
          </h2>
          <span className="text-xs font-bold bg-green-100 text-green-700 px-2.5 py-1 rounded-full border border-green-200">
            Active
          </span>
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          {[
            {
              label: "Projects",
              used: projectsUsed,
              total: projectsLimit ?? Infinity,
              unit: "projects",
              hint: "Each video upload or YouTube import counts as 1 project. Deletions don't reset usage.",
            },
            {
              label: "Video Minutes",
              used: minutesUsed,
              total: minutesLimit,
              unit: "min",
              hint: !isPaid
                ? "Free plan: max 10 min per video, 20 min total/month. Upgrade for unlimited length."
                : "Minutes of input video processed this month.",
            },
          ].map(({ label, used, total, unit, hint }) => {
            const pct = total === Infinity ? 0 : Math.min((used / total) * 100, 100);
            const nearLimit = pct >= 80 && pct < 100;
            const atLimit = total !== Infinity && used >= total;
            return (
              <div key={label}>
                <div className="flex justify-between items-end mb-1.5">
                  <p className="text-sm font-bold">{label}</p>
                  <p className={`text-xs font-semibold ${atLimit ? "text-red-500" : nearLimit ? "text-amber-500" : "text-muted-foreground"}`}>
                    {used} / {total === Infinity ? "∞" : `${total} ${unit}`}
                  </p>
                </div>
                <Progress
                  value={pct}
                  className={atLimit ? "[&>div]:bg-red-500" : nearLimit ? "[&>div]:bg-amber-400" : ""}
                />
                <p className="text-[11px] text-muted-foreground mt-1.5">{hint}</p>
                {atLimit && <p className="text-xs text-red-500 font-bold mt-1">Limit reached — upgrade to continue</p>}
                {nearLimit && !atLimit && <p className="text-xs text-amber-500 font-semibold mt-1">Running low — consider upgrading</p>}
              </div>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-4 font-medium">
          Resets on <strong>{resetDate}</strong>
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
                  billing === b ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {b}
                {b === "yearly" && (
                  <span className="ml-1.5 text-[10px] font-extrabold text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">
                    −20%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {PLANS.map(({ id, name, icon: Icon, price, description, limits, features, color, badge }) => {
            const isCurrent = id === currentPlanId;
            const isDowngrade = (
              (currentPlanId === "agency" && id !== "agency") ||
              (currentPlanId === "pro" && id === "starter")
            );
            const loadingKey = `${id}_${billing}`;
            const isLoading = loadingPlan === loadingKey;

            return (
              <div
                key={id}
                className={`relative border-2 rounded-2xl p-6 shadow-sm flex flex-col gap-4 bg-white ${color}`}
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
                  {price.monthly > 0 ? (
                    <span className="text-muted-foreground text-sm ml-1">/mo</span>
                  ) : (
                    <span className="text-muted-foreground text-sm ml-1">forever</span>
                  )}
                  {billing === "yearly" && price.monthly > 0 && (
                    <p className="text-[11px] text-muted-foreground mt-1">Billed annually · 2 months free</p>
                  )}
                </div>

                {/* Key metrics */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-secondary/60 rounded-xl px-3 py-2 text-center">
                    <p className="text-lg font-extrabold leading-none">
                      {limits.projects === Infinity ? "∞" : limits.projects}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">projects/mo</p>
                  </div>
                  <div className="bg-secondary/60 rounded-xl px-3 py-2 text-center">
                    <p className="text-lg font-extrabold leading-none">
                      {limits.minutes >= 1500 ? "1.5k" : limits.minutes}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">min/mo</p>
                  </div>
                </div>

                <ul className="flex flex-col gap-2 flex-1">
                  {features.map((f) => (
                    <li key={f.text} className="flex items-start gap-2 text-sm">
                      {f.included ? (
                        <CheckCircle2 size={15} className="text-green-600 mt-0.5 shrink-0" />
                      ) : (
                        <XCircle size={15} className="text-muted-foreground/40 mt-0.5 shrink-0" />
                      )}
                      <span className={f.included ? "" : "text-muted-foreground/50"}>{f.text}</span>
                      {f.tooltip && (
                        <span className="relative group/tip shrink-0 mt-0.5">
                          <Info size={13} className="text-muted-foreground/50 hover:text-muted-foreground cursor-help transition-colors" />
                          <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 rounded-xl bg-foreground text-background text-[11px] font-medium px-3 py-2 shadow-lg opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 z-50 leading-relaxed">
                            {f.tooltip}
                            <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground" />
                          </span>
                        </span>
                      )}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-xl font-extrabold text-sm bg-secondary text-muted-foreground cursor-default flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={15} /> Current Plan
                  </button>
                ) : isDowngrade ? (
                  <button
                    onClick={handlePortal}
                    className="w-full py-2.5 rounded-xl font-extrabold text-sm border border-border text-muted-foreground hover:bg-secondary transition-all flex items-center justify-center gap-2"
                  >
                    <ExternalLink size={15} /> Manage in Portal
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade(id)}
                    disabled={isLoading}
                    className="w-full py-2.5 rounded-xl font-extrabold text-sm bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <ArrowUpRight size={15} />
                    )}
                    {isLoading ? "Redirecting…" : `Upgrade to ${name}`}
                  </button>
                )}
              </div>
            );
          })}
        </div>
{/* 
        <p className="text-center text-sm text-muted-foreground mt-6">
          All paid plans include a <strong>14-day free trial</strong> — no credit card required.
        </p> */}
      </div>

      {/* Payment Method */}
      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
        <h2 className="font-extrabold text-base mb-4">Payment Method</h2>
        {isPaid ? (
          <div className="flex items-center gap-4 p-4 border border-border rounded-xl">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <CreditCard size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm font-bold">Payment method on file</p>
              <p className="text-xs text-muted-foreground">Managed securely via Creem.</p>
            </div>
            <button
              onClick={handlePortal}
              className="ml-auto text-sm font-bold text-primary hover:underline flex items-center gap-1"
            >
              <ExternalLink size={13} /> Update
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4 p-4 border border-border rounded-xl">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
              <CreditCard size={20} className="text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-bold text-muted-foreground">No payment method added</p>
              <p className="text-xs text-muted-foreground">Add a card when you upgrade your plan.</p>
            </div>
          </div>
        )}
      </div>

      {/* Invoice History */}
      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
        <h2 className="font-extrabold text-base mb-4">Invoice History</h2>
        {usage?.subscription ? (
          <div className="flex flex-col divide-y divide-border">
            {[usage.subscription].map((sub) => (
              <div key={sub.productId} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-semibold">
                    {sub.currentPeriodEnd
                      ? `Renews ${new Date(sub.currentPeriodEnd).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                      : "Active subscription"}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">{currentPlanId === "pro" ? "Pro Creator" : "Agency"} — Monthly</p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="secondary" className="text-[10px] capitalize">{sub.status}</Badge>
                  <button onClick={handlePortal} className="text-xs font-bold text-primary hover:underline">
                    View invoices →
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No invoices yet. Invoices appear here after your first payment.</p>
        )}
      </div>
    </div>
  );
}
