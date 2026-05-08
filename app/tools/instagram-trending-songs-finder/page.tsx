"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Music2, Search, TrendingUp } from "lucide-react";
import ToolsBreadcrumb from "@/components/tools-breadcrumb";
import ToolsCta from "@/components/tools-cta";

const SIGNALS = [
  { key: "arrow", label: "Instagram shows the trending arrow on the audio page", score: 35 },
  { key: "recent", label: "Top Reels using the sound were posted in the last 3-7 days", score: 25 },
  { key: "repeat", label: "You saw the sound repeatedly in your niche today", score: 20 },
  { key: "fit", label: "The sound fits your hook, pacing, and audience", score: 20 },
];

export default function InstagramTrendingSongsFinder() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const score = useMemo(
    () => SIGNALS.reduce((total, signal) => total + (checked[signal.key] ? signal.score : 0), 0),
    [checked],
  );

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <main className="max-w-3xl mx-auto px-4 py-14">
        <ToolsBreadcrumb toolName="Instagram Trending Songs Finder" toolHref="/tools/instagram-trending-songs-finder" />

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-pink-50 text-pink-600 border border-pink-100 px-3 py-1 rounded-full text-xs font-semibold mb-4">
            <Image src="/icons/instagram.png" alt="Instagram" width={14} height={14} /> Free Tool
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">Trending Songs on Instagram Reels Today</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Use this checklist to find and score trending Reels audio inside Instagram before you post.
          </p>
        </div>

        <div className="bg-white border border-border rounded-3xl p-6 shadow-sm mb-8">
          <h2 className="font-extrabold text-lg mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-pink-600" /> Audio trend score</h2>
          <div className="space-y-3">
            {SIGNALS.map((signal) => (
              <label key={signal.key} className="flex items-start gap-3 rounded-2xl border border-border p-4 hover:bg-pink-50/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(checked[signal.key])}
                  onChange={(e) => setChecked((prev) => ({ ...prev, [signal.key]: e.target.checked }))}
                  className="mt-1 accent-pink-600"
                />
                <span className="flex-1 text-sm text-muted-foreground">
                  <strong className="text-foreground">{signal.score} pts</strong> · {signal.label}
                </span>
              </label>
            ))}
          </div>
          <div className="mt-5 bg-pink-50 border border-pink-100 rounded-2xl p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-pink-600/70 mb-1">Trend confidence</p>
            <p className="text-3xl font-black text-pink-700">{score}/100</p>
            <p className="text-sm text-pink-700/80 mt-1">
              {score >= 80 ? "Strong audio candidate. Save it and post soon." : score >= 50 ? "Promising, but verify it in your niche." : "Keep researching before you build a Reel around this sound."}
            </p>
          </div>
        </div>

        <div className="grid gap-4 mb-8">
          {[
            ["Open Reels search", "Search your niche plus words like tutorial, tips, outfit, food, edit, or vlog."],
            ["Tap the audio name", "Look for the upward arrow, recent usage, and Reels from creators similar to you."],
            ["Save 5-10 sounds", "Create a small audio bank so you can post quickly when the right clip is ready."],
            ["Match sound to structure", "Use fast songs for cuts, softer sounds for stories, and voice-friendly audio for education."],
          ].map(([title, text], index) => (
            <div key={title} className="bg-white border border-border rounded-2xl p-5 shadow-sm flex gap-4">
              <div className="size-9 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center font-black shrink-0">{index + 1}</div>
              <div>
                <h3 className="font-extrabold flex items-center gap-2">{index === 0 ? <Search size={16} /> : <Music2 size={16} />} {title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{text}</p>
              </div>
            </div>
          ))}
        </div>

        <ToolsCta
          headerText="Have the sound? Now make the Reel."
          subText="ShortPurify turns long videos into short Instagram Reels so you can pair them with trending audio faster."
        />

        <div className="mt-12 prose prose-sm max-w-none text-muted-foreground">
          <h2 className="text-foreground font-extrabold text-xl">How to find trending songs on Instagram Reels today</h2>
          <p>Instagram trending songs change daily and can vary by country, niche, and account type. The most reliable method is to check the audio page in Instagram, look for the trending arrow, and confirm that recent Reels in your niche are using the sound.</p>
          <h3 className="text-foreground font-bold">Should every Reel use trending audio?</h3>
          <p>No. Trending audio helps discovery when it supports the video. If the sound distracts from the hook or voiceover, use a low-volume track or original audio instead.</p>
          <h3 className="text-foreground font-bold">Related tools</h3>
          <ul>
            <li><Link href="/tools/hashtag-generator" className="text-primary">Hashtag Generator</Link></li>
            <li><Link href="/tools/best-time-to-post-instagram-reels" className="text-primary">Best Time to Post Instagram Reels</Link></li>
          </ul>
        </div>
      </main>
    </div>
  );
}
