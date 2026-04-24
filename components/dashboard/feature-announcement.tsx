"use client";

import { useState, useEffect } from "react";
import { X, ScanSearch, ArrowRight } from "lucide-react";
import Link from "next/link";
import { SparklesText } from "@/components/ui/sparkles-text";

// Change this to push a new announcement wave — users who dismissed before this date will see it again
const ANNOUNCEMENT_KEY = "announcement_review_clips_v1";
// Auto-hide for everyone after this date (30 days from ship date)
const EXPIRES_AT = new Date("2026-05-24T00:00:00Z").getTime();

export function FeatureAnnouncement() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Don't show if past expiry
    if (Date.now() > EXPIRES_AT) return;
    // Don't show if already dismissed
    if (localStorage.getItem(ANNOUNCEMENT_KEY) === "dismissed") return;
    setVisible(true);
  }, []);

  function dismiss() {
    localStorage.setItem(ANNOUNCEMENT_KEY, "dismissed");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="mb-8 relative overflow-hidden rounded-2xl border border-violet-200 bg-linear-to-r from-violet-50 to-purple-50 px-5 py-4 flex items-start gap-4 shadow-sm">
      {/* Icon */}
      <div className="shrink-0 w-10 h-10 rounded-xl bg-violet-100 border border-violet-200 flex items-center justify-center mt-0.5">
        <ScanSearch size={20} className="text-violet-600" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-violet-500 bg-violet-100 border border-violet-200 px-2 py-0.5 rounded-full">
            New
          </span>
          <SparklesText 
            className="text-sm font-bold text-foreground"
            sparklesCount={8}
            colors={{ first: "#8B5CF6", second: "#D8B4FE" }}
          >
            Review clips before processing
          </SparklesText>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          You can now review and edit AI-suggested clips <span className="font-semibold text-foreground">before</span> encoding starts.
          Rename clips, adjust start &amp; end times, or skip ones you don&apos;t want.
        </p>
        <Link
          href="/dashboard/upload"
          onClick={dismiss}
          className="inline-flex items-center gap-1.5 mt-2.5 text-xs font-bold text-violet-700 hover:text-violet-900 transition-colors"
        >
          Try it on your next upload <ArrowRight size={12} />
        </Link>
      </div>

      {/* Dismiss */}
      <button
        type="button"
        onClick={dismiss}
        className="shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-violet-100 transition-colors mt-0.5"
        aria-label="Dismiss"
      >
        <X size={15} />
      </button>

      {/* Decorative blur */}
      <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-violet-200/40 rounded-full blur-2xl pointer-events-none" />
    </div>
  );
}
