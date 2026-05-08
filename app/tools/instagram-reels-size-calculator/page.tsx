"use client";

import { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Copy, Crop, Ruler, Smartphone } from "lucide-react";
import ToolsBreadcrumb from "@/components/tools-breadcrumb";
import ToolsCta from "@/components/tools-cta";

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function simplifyRatio(width: number, height: number) {
  const divisor = gcd(width, height);
  return `${width / divisor}:${height / divisor}`;
}

export default function InstagramReelsSizeCalculator() {
  const [width, setWidth] = useState("1080");
  const [height, setHeight] = useState("1920");
  const [copied, setCopied] = useState<string | null>(null);

  const parsedWidth = Number(width) || 0;
  const parsedHeight = Number(height) || 0;
  const ratio = parsedWidth > 0 && parsedHeight > 0 ? simplifyRatio(parsedWidth, parsedHeight) : "";
  const isIdeal = ratio === "9:16" && parsedWidth >= 1080 && parsedHeight >= 1920;

  const safeZone = useMemo(() => {
    if (!parsedWidth || !parsedHeight) return null;
    return {
      top: Math.round(parsedHeight * 0.14),
      bottom: Math.round(parsedHeight * 0.2),
      side: Math.round(parsedWidth * 0.06),
    };
  }, [parsedWidth, parsedHeight]);

  const copy = useCallback(async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  }, []);

  const setPreset = (w: number, h: number) => {
    setWidth(String(w));
    setHeight(String(h));
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <main className="max-w-4xl mx-auto px-4 py-14">
        <ToolsBreadcrumb toolName="Instagram Reels Size Calculator" toolHref="/tools/instagram-reels-size-calculator" />

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-pink-50 text-pink-600 border border-pink-100 px-3 py-1 rounded-full text-xs font-semibold mb-4">
            <Image src="/icons/instagram.png" alt="Instagram" width={14} height={14} /> Free Tool
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">Instagram Reels Size Calculator</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Check your Reels dimensions, aspect ratio, export size, and safe zone before uploading.
          </p>
        </div>

        <div className="grid md:grid-cols-[1fr_0.8fr] gap-6 mb-8">
          <div className="bg-white border border-border rounded-3xl p-6 shadow-sm">
            <h2 className="font-extrabold mb-4 flex items-center gap-2"><Ruler size={18} className="text-pink-600" /> Enter video size</h2>
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1">
                <label className="block text-xs font-bold text-muted-foreground mb-1.5">Width (px)</label>
                <input value={width} onChange={(e) => setWidth(e.target.value)} type="number" className="w-full border border-border rounded-xl px-4 py-3 bg-secondary/30 focus:outline-none focus:ring-2 focus:ring-pink-200" />
              </div>
              <span className="font-black text-muted-foreground mt-5">x</span>
              <div className="flex-1">
                <label className="block text-xs font-bold text-muted-foreground mb-1.5">Height (px)</label>
                <input value={height} onChange={(e) => setHeight(e.target.value)} type="number" className="w-full border border-border rounded-xl px-4 py-3 bg-secondary/30 focus:outline-none focus:ring-2 focus:ring-pink-200" />
              </div>
            </div>

            <div className={`rounded-2xl p-5 border ${isIdeal ? "bg-emerald-50 border-emerald-100" : "bg-amber-50 border-amber-100"}`}>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Result</p>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className={`text-3xl font-black ${isIdeal ? "text-emerald-700" : "text-amber-700"}`}>{ratio || "Enter size"}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {isIdeal ? "Ideal full-screen Instagram Reels format." : "Best Reels format is 1080 x 1920 at 9:16."}
                  </p>
                </div>
                {ratio && (
                  <button onClick={() => void copy(`${parsedWidth}x${parsedHeight} (${ratio})`, "result")} className="p-2 rounded-lg hover:bg-white text-muted-foreground">
                    {copied === "result" ? <Check size={17} className="text-emerald-600" /> : <Copy size={17} />}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white border border-border rounded-3xl p-6 shadow-sm">
            <h2 className="font-extrabold mb-4 flex items-center gap-2"><Smartphone size={18} className="text-pink-600" /> Presets</h2>
            <div className="space-y-2">
              {[
                ["Reels full screen", 1080, 1920, "9:16"],
                ["Minimum sharp vertical", 720, 1280, "9:16"],
                ["Profile grid crop", 1080, 1440, "3:4"],
                ["Feed portrait preview", 1080, 1350, "4:5"],
              ].map(([label, w, h, presetRatio]) => (
                <button key={String(label)} onClick={() => setPreset(Number(w), Number(h))} className="w-full text-left border border-border rounded-2xl px-4 py-3 hover:bg-pink-50 hover:border-pink-100 transition-colors">
                  <span className="block text-sm font-bold">{label}</span>
                  <span className="block text-xs text-muted-foreground">{w}x{h} · {presetRatio}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white border border-border rounded-3xl p-6 shadow-sm mb-8">
          <h2 className="font-extrabold mb-4 flex items-center gap-2"><Crop size={18} className="text-pink-600" /> Reels safe zone</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="bg-secondary/30 rounded-2xl p-4"><p className="text-xs font-bold text-muted-foreground">Top margin</p><p className="text-2xl font-black">{safeZone?.top ?? 0}px</p></div>
            <div className="bg-secondary/30 rounded-2xl p-4"><p className="text-xs font-bold text-muted-foreground">Bottom margin</p><p className="text-2xl font-black">{safeZone?.bottom ?? 0}px</p></div>
            <div className="bg-secondary/30 rounded-2xl p-4"><p className="text-xs font-bold text-muted-foreground">Side margins</p><p className="text-2xl font-black">{safeZone?.side ?? 0}px</p></div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">Keep captions, logos, and faces away from the edges so Instagram UI controls do not cover important content.</p>
        </div>

        <ToolsCta
          headerText="Need 9:16 Reels without manual resizing?"
          subText="ShortPurify smart-crops long videos into vertical Instagram Reels, adds captions, and keeps the subject framed."
        />

        <div className="mt-12 prose prose-sm max-w-none text-muted-foreground">
          <h2 className="text-foreground font-extrabold text-xl">Instagram Reels size and aspect ratio</h2>
          <p>The best Instagram Reels size is 1080 x 1920 pixels with a 9:16 aspect ratio. This fills the vertical phone screen and also works for TikTok and YouTube Shorts.</p>
          <h3 className="text-foreground font-bold">What happens if your Reel is not 9:16?</h3>
          <p>Instagram may add empty space, crop the frame, or show the Reel differently in the feed, profile grid, and Reels tab. Use the calculator above before exporting.</p>
          <h3 className="text-foreground font-bold">Related free tools</h3>
          <ul>
            <li><Link href="/tools/video-aspect-ratio-calculator" className="text-primary">Video Aspect Ratio Calculator</Link> for every platform</li>
            <li><Link href="/tools/instagram-reels-length-calculator" className="text-primary">Instagram Reels Length Calculator</Link> for duration checks</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
