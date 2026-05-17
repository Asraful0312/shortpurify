"use client";

import { useState, useEffect } from "react";
import { X, ArrowRight } from "lucide-react";

const DISMISS_KEY = "sp_affiliate_banner_dismissed";
// Update this URL once your Creem affiliate program is live
const AFFILIATE_JOIN_URL = "https://affiliates.creem.io/join/shortpurify";

export default function AffiliateBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(DISMISS_KEY)) setVisible(true);
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="relative z-50 bg-linear-to-r from-violet-600 to-indigo-600 text-white text-sm">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-center gap-3">
        <span className="font-semibold hidden sm:inline">New:</span>
        <span>
          Earn{" "}
          <span className="font-bold underline underline-offset-2">30% recurring commission</span>
          {" "}for every customer you refer.
        </span>
        <a
          href={AFFILIATE_JOIN_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-semibold bg-white/20 hover:bg-white/30 transition-colors px-3 py-1 rounded-full text-xs whitespace-nowrap"
        >
          Join affiliate program <ArrowRight size={12} />
        </a>
      </div>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/20 transition-colors"
      >
        <X size={15} />
      </button>
    </div>
  );
}
