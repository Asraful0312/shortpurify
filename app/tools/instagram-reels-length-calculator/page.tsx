"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { CheckCircle2, Clock, TimerReset } from "lucide-react";
import ToolsBreadcrumb from "@/components/tools-breadcrumb";
import ToolsCta from "@/components/tools-cta";

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

export default function InstagramReelsLengthCalculator() {
  const [seconds, setSeconds] = useState(30);

  const result = useMemo(() => {
    if (seconds < 3) return { tone: "amber", title: "Too short", body: "Reels generally need at least 3 seconds. Add a clearer hook or visual payoff." };
    if (seconds <= 15) return { tone: "emerald", title: "High-retention length", body: "Great for quick hooks, memes, transformations, and single-tip videos." };
    if (seconds <= 30) return { tone: "emerald", title: "Strong Reels length", body: "A good range for tutorials, list videos, and creator clips with a tight payoff." };
    if (seconds <= 90) return { tone: "blue", title: "Good for deeper content", body: "Use this range when the story earns the extra time. Keep cuts moving and front-load value." };
    if (seconds <= 180) return { tone: "amber", title: "Allowed, but harder to finish", body: "Instagram supports longer Reels, but discovery is often stronger when the core idea stays under 90 seconds." };
    return { tone: "red", title: "Too long for a standard Reel", body: "Trim this into multiple Reels or publish as a longer video format if your account supports it." };
  }, [seconds]);

  const color = {
    emerald: "bg-emerald-50 border-emerald-100 text-emerald-700",
    blue: "bg-blue-50 border-blue-100 text-blue-700",
    amber: "bg-amber-50 border-amber-100 text-amber-700",
    red: "bg-red-50 border-red-100 text-red-700",
  }[result.tone];

  return (
    <main className="max-w-3xl mx-auto px-4 py-14">
        <ToolsBreadcrumb toolName="Instagram Reels Length Calculator" toolHref="/tools/instagram-reels-length-calculator" />

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-pink-50 text-pink-600 border border-pink-100 px-3 py-1 rounded-full text-xs font-semibold mb-4">
            <Image src="/icons/instagram.png" alt="Instagram" width={14} height={14} /> Free Tool
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">Instagram Reels Length Calculator</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Check whether your Reel is too short, ideal for retention, or too long for discovery.
          </p>
        </div>

        <div className="bg-white border border-border rounded-3xl p-6 shadow-sm mb-8">
          <label className="flex items-center justify-between gap-3 mb-4">
            <span className="font-bold flex items-center gap-2"><Clock size={18} className="text-pink-600" /> Reel duration</span>
            <span className="text-2xl font-black text-pink-700">{formatDuration(seconds)}</span>
          </label>
          <input
            type="range"
            min={1}
            max={240}
            value={seconds}
            onChange={(e) => setSeconds(Number(e.target.value))}
            className="w-full accent-pink-600"
          />
          <div className="grid grid-cols-4 gap-2 mt-4">
            {[7, 15, 30, 90].map((preset) => (
              <button key={preset} onClick={() => setSeconds(preset)} className="rounded-xl border border-border bg-secondary/30 py-2 text-xs font-bold hover:bg-pink-50 hover:border-pink-100">
                {formatDuration(preset)}
              </button>
            ))}
          </div>

          <div className={`mt-6 border rounded-2xl p-5 ${color}`}>
            <p className="text-2xl font-black">{result.title}</p>
            <p className="text-sm mt-1 opacity-85">{result.body}</p>
          </div>
        </div>

        <div className="bg-white border border-border rounded-3xl p-6 shadow-sm mb-8">
          <h2 className="font-extrabold text-lg mb-4 flex items-center gap-2"><TimerReset size={18} className="text-pink-600" /> Quick duration guide</h2>
          <div className="space-y-3">
            {[
              ["3-15 seconds", "Best for fast hooks, trending audio, reactions, and punchy edits."],
              ["15-30 seconds", "Best default range for creator education, storytelling, and product clips."],
              ["30-90 seconds", "Use when the tutorial or story needs more context."],
              ["90-180 seconds", "Useful for deeper content, but trim aggressively for recommendations."],
            ].map(([range, text]) => (
              <div key={range} className="flex gap-3 border-b border-border last:border-0 pb-3 last:pb-0">
                <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground"><strong className="text-foreground">{range}:</strong> {text}</p>
              </div>
            ))}
          </div>
        </div>

        <ToolsCta
          headerText="Want Reels clipped to the right length?"
          subText="ShortPurify finds short, high-retention moments in long videos and turns them into captioned Instagram Reels."
        />

      </main>
  );
}
