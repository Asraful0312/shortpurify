"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type CookieConsent = "all" | "essential" | null;

const STORAGE_KEY = "sp_cookie_consent";

export function getCookieConsent(): CookieConsent {
  if (typeof window === "undefined") return null;
  const value = localStorage.getItem(STORAGE_KEY);
  if (value === "all" || value === "essential") return value;
  return null;
}

export function setCookieConsent(value: "all" | "essential") {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, value);
  // Dispatch so other components (e.g. Hotjar) can react immediately
  window.dispatchEvent(new CustomEvent("cookie-consent-change", { detail: value }));
}

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Only show if no consent has been stored yet
    if (!getCookieConsent()) {
      // Small delay so it doesn't flash immediately on page load
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const handleAcceptAll = () => {
    setCookieConsent("all");
    setVisible(false);
  };

  const handleEssentialOnly = () => {
    setCookieConsent("essential");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      aria-modal="false"
      className={cn(
        "fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] w-full max-w-xl px-4",
        "animate-in slide-in-from-bottom-4 fade-in duration-300",
      )}
    >
      <div className="bg-white border border-border rounded-2xl shadow-xl p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Cookie size={17} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-extrabold text-sm text-foreground">We use cookies</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              We use essential cookies to run the site and analytics cookies (Hotjar) to understand
              how you use it. You can choose what you allow.{" "}
              <Link href="/privacy" className="underline font-semibold hover:text-primary transition-colors">
                Privacy Policy
              </Link>
            </p>
          </div>
          <button
            type="button"
            onClick={handleEssentialOnly}
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-secondary"
            aria-label="Dismiss and use essential cookies only"
          >
            <X size={15} />
          </button>
        </div>

        {/* Cookie details (expandable) */}
        {showDetails && (
          <div className="mb-3 space-y-2 bg-secondary/40 rounded-xl p-3">
            <div className="flex items-start gap-2.5">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-foreground">Essential cookies — always on</p>
                <p className="text-xs text-muted-foreground">
                  Authentication (Clerk), session management, and core Service functionality.
                  These cannot be disabled.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-foreground">Analytics cookies — optional</p>
                <p className="text-xs text-muted-foreground">
                  Hotjar for session recording and usage analytics. Helps us improve the product.
                  No advertising or cross-site tracking.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowDetails((v) => !v)}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
          >
            {showDetails ? "Hide details" : "Cookie details"}
          </button>
          <div className="flex-1" />
          <button
            type="button"
            onClick={handleEssentialOnly}
            className="px-3.5 py-2 rounded-xl border border-border bg-white hover:bg-secondary text-xs font-bold text-foreground transition-colors"
          >
            Essential only
          </button>
          <button
            type="button"
            onClick={handleAcceptAll}
            className="px-3.5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-colors"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
