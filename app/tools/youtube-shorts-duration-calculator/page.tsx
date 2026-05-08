"use client";

import { useState } from "react";
import Link from "next/link";
import { Timer, Star } from "lucide-react";
import ToolsNavBar from "@/components/tools-nav-bar";
import ToolsCta from "@/components/tools-cta";
import ToolsBreadcrumb from "@/components/tools-breadcrumb";

const CLIP_LENGTHS = [
  { seconds: 15, label: "15 sec", note: "Best for hooks & reactions", color: "bg-pink-50 border-pink-200 text-pink-700", badge: null },
  { seconds: 30, label: "30 sec", note: "Top performing length on Shorts", color: "bg-violet-50 border-violet-200 text-violet-700", badge: "Most Viral" },
  { seconds: 45, label: "45 sec", note: "Good for tutorials & tips", color: "bg-blue-50 border-blue-200 text-blue-700", badge: null },
  { seconds: 60, label: "60 sec", note: "Max for one complete idea", color: "bg-emerald-50 border-emerald-200 text-emerald-700", badge: null },
  { seconds: 90, label: "90 sec", note: "Mini-documentary style", color: "bg-amber-50 border-amber-200 text-amber-700", badge: null },
  { seconds: 120, label: "2 min", note: "Storytelling & explainers", color: "bg-orange-50 border-orange-200 text-orange-700", badge: null },
  { seconds: 180, label: "3 min", note: "Max allowed on YouTube Shorts", color: "bg-red-50 border-red-200 text-red-700", badge: "New Limit" },
];

const CONTENT_TIPS: Record<string, { recommended: number; reason: string }> = {
  tutorial:     { recommended: 45,  reason: "Tutorials need enough time to demonstrate clearly without losing viewers." },
  entertainment:{ recommended: 30,  reason: "Entertainment thrives under 30s — viewers loop short clips more often." },
  vlog:         { recommended: 60,  reason: "Vlogs need context, 60s gives a complete story beat." },
  reaction:     { recommended: 15,  reason: "Raw reactions hit hardest when short and punchy." },
  educational:  { recommended: 60,  reason: "Educational content needs time to deliver the key insight properly." },
  product:      { recommended: 30,  reason: "Product showcases work best short — show the wow moment fast." },
};

function formatSeconds(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m ${sec}s`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

export default function YouTubeShortsDurationCalculator() {
  const [hours, setHours] = useState("0");
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");
  const [contentType, setContentType] = useState("");

  const totalSeconds =
    (parseInt(hours) || 0) * 3600 +
    (parseInt(minutes) || 0) * 60 +
    (parseInt(seconds) || 0);

  const hasInput = totalSeconds > 0;
  const recommendedLength = contentType ? CONTENT_TIPS[contentType]?.recommended : null;

  return (
    <div className="min-h-screen bg-[#FAFAF8]">

      <main className="max-w-3xl mx-auto px-4 py-14">
        {/* Header */}
        <ToolsBreadcrumb toolName="YouTube Shorts Duration Calculator" toolHref="/tools/youtube-shorts-duration-calculator" />
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 border border-red-100 px-3 py-1 rounded-full text-xs font-semibold mb-4">
            <Timer size={13} /> Free Tool
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">
            YouTube Shorts Duration Calculator
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Enter your video length to see how many Shorts you can make and which clip length will perform best.
          </p>
        </div>

        {/* Input card */}
        <div className="bg-white border border-border rounded-3xl p-6 shadow-sm mb-6">
          <p className="text-sm font-bold mb-4">Your video length</p>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1">
              <label className="block text-xs font-bold text-muted-foreground mb-1.5">Hours</label>
              <input
                type="number"
                min="0"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="0"
                className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-secondary/30 text-center font-bold text-lg"
              />
            </div>
            <span className="text-muted-foreground font-bold text-xl mt-5">:</span>
            <div className="flex-1">
              <label className="block text-xs font-bold text-muted-foreground mb-1.5">Minutes</label>
              <input
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                placeholder="30"
                className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-secondary/30 text-center font-bold text-lg"
              />
            </div>
            <span className="text-muted-foreground font-bold text-xl mt-5">:</span>
            <div className="flex-1">
              <label className="block text-xs font-bold text-muted-foreground mb-1.5">Seconds</label>
              <input
                type="number"
                min="0"
                max="59"
                value={seconds}
                onChange={(e) => setSeconds(e.target.value)}
                placeholder="00"
                className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-secondary/30 text-center font-bold text-lg"
              />
            </div>
          </div>

          <p className="text-sm font-bold mb-3">Content type <span className="font-normal text-muted-foreground">(optional — for personalized recommendation)</span></p>
          <div className="grid grid-cols-3 gap-2">
            {Object.keys(CONTENT_TIPS).map((type) => (
              <button
                key={type}
                onClick={() => setContentType(contentType === type ? "" : type)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-colors capitalize ${
                  contentType === type
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border hover:bg-secondary/40 text-muted-foreground"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {hasInput && (
          <>
            {/* Summary */}
            <div className="bg-primary rounded-2xl px-6 py-4 mb-4 flex items-center justify-between">
              <div>
                <p className="text-primary-foreground/70 text-xs font-semibold uppercase tracking-wide">Your video</p>
                <p className="text-primary-foreground font-extrabold text-xl">{formatSeconds(totalSeconds)}</p>
              </div>
              {contentType && recommendedLength && (
                <div className="text-right">
                  <p className="text-primary-foreground/70 text-xs font-semibold uppercase tracking-wide">Recommended length</p>
                  <p className="text-primary-foreground font-extrabold text-xl">
                    {recommendedLength >= 60 ? `${recommendedLength / 60} min` : `${recommendedLength}s`}
                  </p>
                </div>
              )}
            </div>

            {contentType && CONTENT_TIPS[contentType] && (
              <div className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-3 mb-4 flex items-start gap-2">
                <Star size={14} className="text-amber-500 mt-0.5 shrink-0" />
                <p className="text-sm text-amber-900">{CONTENT_TIPS[contentType].reason}</p>
              </div>
            )}

            {/* Clip length cards */}
            <div className="flex flex-col gap-3 mb-8">
              {CLIP_LENGTHS.map(({ seconds: clipSec, label, note, color, badge }) => {
                const count = Math.floor(totalSeconds / clipSec);
                const remainder = totalSeconds % clipSec;
                const coverage = Math.round((count * clipSec / totalSeconds) * 100);
                const isRecommended = recommendedLength === clipSec;
                if (count === 0) return null;

                return (
                  <div
                    key={clipSec}
                    className={`border rounded-2xl p-4 transition-all ${color} ${isRecommended ? "ring-2 ring-primary ring-offset-1" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="text-center min-w-[52px]">
                          <p className="text-2xl font-extrabold leading-none">{count}</p>
                          <p className="text-xs font-semibold opacity-70 mt-0.5">clips</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="font-extrabold text-sm">{label} clips</p>
                            {badge && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/60 border border-current opacity-80">
                                {badge}
                              </span>
                            )}
                            {isRecommended && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground">
                                ★ Best for {contentType}
                              </span>
                            )}
                          </div>
                          <p className="text-xs opacity-70">{note}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold">{coverage}%</p>
                        <p className="text-xs opacity-60">covered</p>
                        {remainder > 0 && (
                          <p className="text-xs opacity-50 mt-0.5">{formatSeconds(remainder)} unused</p>
                        )}
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3 h-1.5 rounded-full bg-black/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-current opacity-40"
                        style={{ width: `${coverage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {!hasInput && (
          <div className="bg-white border border-border rounded-3xl p-8 text-center text-muted-foreground mb-8">
            <Timer size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Enter your video length above to see the breakdown</p>
          </div>
        )}

        {/* CTA */}
        <ToolsCta
          headerText="Calculated your clips? Let AI make them."
          subText="Paste Youtube Video URL, ShortPurify automatically cuts your video at the best moments, adds captions, and publishes to YouTube Shorts no manual editing needed."
        />

        {/* SEO content */}
        <div className="mt-12 prose prose-sm max-w-none text-muted-foreground">
          <h2 className="text-foreground font-extrabold text-xl">YouTube Shorts timer everything you need to know in 2025</h2>
          <p>YouTube Shorts now supports videos up to <strong>3 minutes (180 seconds)</strong>, up from the previous 60-second limit. However, longer doesn&apos;t always mean better the algorithm still favors videos with high audience retention, which typically means shorter clips.</p>
          <h3 className="text-foreground font-bold">Best YouTube Shorts length by content type</h3>
          <ul>
            <li><strong>15–30 seconds</strong> — Hooks, reactions, memes, satisfying clips. Highest loop rate.</li>
            <li><strong>30–60 seconds</strong> — Tips, tutorials, product showcases. Best balance of retention and value.</li>
            <li><strong>60–90 seconds</strong> — Mini-tutorials, storytelling, before/after. Good for educational content.</li>
            <li><strong>90s–3 minutes</strong> — In-depth explainers, vlogs, mini-docs. Use only if the full time is necessary.</li>
          </ul>
          <h3 className="text-foreground font-bold">How to use the YouTube Shorts timer in the app</h3>
          <p>When recording in the YouTube app, tap the timer icon to set a countdown before recording starts. You can also set a clip duration so recording stops automatically. For best results, plan your script to fit within 30–45 seconds and record in one take.</p>
          <h3 className="text-foreground font-bold">How many Shorts can you make from a 1-hour video?</h3>
          <p>A 60-minute video contains 3,600 seconds of content. At 30 seconds per clip, that&apos;s up to 120 Shorts. At 60 seconds per clip, that&apos;s 60 Shorts. Tools like ShortPurify automatically identify the best moments so you don&apos;t have to watch the whole video manually.</p>
          <h3 className="text-foreground font-bold">Other free tools you might like</h3>
          <ul>
            <li><Link href="/tools/youtube-shorts-title-generator" className="text-primary">YouTube Shorts Title Generator</Link> — 10 click-worthy titles instantly</li>
            <li><Link href="/tools/youtube-thumbnail-prompt-generator" className="text-primary">YouTube Thumbnail Prompt Generator</Link> — AI prompts for Midjourney & DALL·E</li>
            <li><Link href="/tools/hashtag-generator" className="text-primary">Hashtag Generator</Link> — Instagram, TikTok & YouTube hashtags</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
