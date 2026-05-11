"use client";

import { useState, useCallback } from "react";
import { Calculator, ArrowRight, Copy, Check } from "lucide-react";
import ToolsCta from "@/components/tools-cta";
import ToolsBreadcrumb from "@/components/tools-breadcrumb";

const PRESETS = [
  { label: "YouTube Shorts / TikTok / Reels", ratio: "9:16", w: 1080, h: 1920, color: "bg-red-50 text-red-600 border-red-100" },
  { label: "YouTube Landscape", ratio: "16:9", w: 1920, h: 1080, color: "bg-red-50 text-red-600 border-red-100" },
  { label: "Instagram Square", ratio: "1:1", w: 1080, h: 1080, color: "bg-pink-50 text-pink-600 border-pink-100" },
  { label: "Instagram Portrait", ratio: "4:5", w: 1080, h: 1350, color: "bg-pink-50 text-pink-600 border-pink-100" },
  { label: "Twitter / X Video", ratio: "16:9", w: 1280, h: 720, color: "bg-sky-50 text-sky-600 border-sky-100" },
  { label: "LinkedIn Video", ratio: "16:9", w: 1920, h: 1080, color: "bg-blue-50 text-blue-600 border-blue-100" },
  { label: "Facebook Portrait", ratio: "4:5", w: 1080, h: 1350, color: "bg-indigo-50 text-indigo-600 border-indigo-100" },
  { label: "Snapchat", ratio: "9:16", w: 1080, h: 1920, color: "bg-yellow-50 text-yellow-600 border-yellow-100" },
];

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function simplifyRatio(w: number, h: number): string {
  const d = gcd(w, h);
  return `${w / d}:${h / d}`;
}

export default function VideoAspectRatioCalculator() {
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [lockWidth, setLockWidth] = useState("");
  const [lockHeight, setLockHeight] = useState("");
  const [mode, setMode] = useState<"simplify" | "convert">("simplify");
  const [copied, setCopied] = useState<string | null>(null);

  const parsedW = parseInt(width) || 0;
  const parsedH = parseInt(height) || 0;
  const simplified = parsedW > 0 && parsedH > 0 ? simplifyRatio(parsedW, parsedH) : null;

  const decimalRatio = parsedW > 0 && parsedH > 0 ? (parsedW / parsedH).toFixed(4) : null;

  const lockW = parseInt(lockWidth) || 0;
  const lockH = parseInt(lockHeight) || 0;

  let convertedH = "";
  let convertedW = "";
  if (parsedW > 0 && parsedH > 0 && lockW > 0) {
    convertedH = Math.round((lockW * parsedH) / parsedW).toString();
  }
  if (parsedW > 0 && parsedH > 0 && lockH > 0) {
    convertedW = Math.round((lockH * parsedW) / parsedH).toString();
  }

  const copy = useCallback(async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  }, []);

  const applyPreset = (w: number, h: number) => {
    setWidth(w.toString());
    setHeight(h.toString());
    setMode("simplify");
    setLockWidth("");
    setLockHeight("");
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-14">
        {/* Header */}
        <ToolsBreadcrumb toolName="Video Aspect Ratio Calculator" toolHref="/tools/video-aspect-ratio-calculator" />
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-600 border border-violet-100 px-3 py-1 rounded-full text-xs font-semibold mb-4">
            <Calculator size={13} /> Free Tool
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">
            Video Aspect Ratio Calculator
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Find the perfect dimensions for any social platform. Simplify ratios, convert sizes, and browse standard presets instantly.
          </p>
        </div>

        {/* Platform presets */}
        <div className="bg-white border border-border rounded-3xl p-6 shadow-sm mb-6">
          <p className="text-sm font-bold mb-3">Platform presets</p>
          <div className="grid grid-cols-2 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => applyPreset(p.w, p.h)}
                className={`text-left px-3 py-2.5 rounded-xl border text-xs font-semibold transition-colors hover:opacity-80 ${p.color}`}
              >
                <span className="block font-bold">{p.ratio}</span>
                <span className="block font-normal opacity-70 truncate">{p.label}</span>
                <span className="block opacity-60 mt-0.5">{p.w}×{p.h}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Calculator */}
        <div className="bg-white border border-border rounded-3xl p-6 shadow-sm mb-6">
          {/* Mode tabs */}
          <div className="flex rounded-xl bg-secondary/40 p-1 mb-6 gap-1">
            <button
              onClick={() => setMode("simplify")}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${mode === "simplify" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground"}`}
            >
              Simplify Ratio
            </button>
            <button
              onClick={() => setMode("convert")}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${mode === "convert" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground"}`}
            >
              Convert Size
            </button>
          </div>

          {/* Inputs */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1">
              <label className="block text-xs font-bold mb-1.5 text-muted-foreground">Width (px)</label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                placeholder="1920"
                className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-secondary/30"
              />
            </div>
            <div className="text-muted-foreground font-bold mt-5">×</div>
            <div className="flex-1">
              <label className="block text-xs font-bold mb-1.5 text-muted-foreground">Height (px)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="1080"
                className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-secondary/30"
              />
            </div>
          </div>

          {/* Simplify result */}
          {mode === "simplify" && simplified && (
            <div className="bg-violet-50 border border-violet-100 rounded-2xl p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">Simplified Ratio</p>
                  <p className="text-3xl font-extrabold text-violet-700">{simplified}</p>
                </div>
                <button
                  onClick={() => void copy(simplified, "ratio")}
                  className="p-2 rounded-lg hover:bg-white transition-colors text-muted-foreground hover:text-foreground"
                >
                  {copied === "ratio" ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                </button>
              </div>
              <div className="flex items-center justify-between border-t border-violet-100 pt-3">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">Decimal Ratio</p>
                  <p className="text-lg font-bold text-violet-600">{decimalRatio}</p>
                </div>
                <button
                  onClick={() => void copy(decimalRatio ?? "", "decimal")}
                  className="p-2 rounded-lg hover:bg-white transition-colors text-muted-foreground hover:text-foreground"
                >
                  {copied === "decimal" ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          )}

          {/* Convert result */}
          {mode === "convert" && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold mb-1.5 text-muted-foreground">Lock width — find new height</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={lockWidth}
                    onChange={(e) => { setLockWidth(e.target.value); setLockHeight(""); }}
                    placeholder="e.g. 1080"
                    className="flex-1 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-secondary/30"
                  />
                  {convertedH && (
                    <div className="flex items-center gap-2 bg-violet-50 border border-violet-100 rounded-xl px-4 py-3">
                      <span className="text-sm font-extrabold text-violet-700">→ {convertedH} px</span>
                      <button onClick={() => void copy(convertedH, "h")} className="text-muted-foreground hover:text-foreground">
                        {copied === "h" ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5 text-muted-foreground">Lock height — find new width</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={lockHeight}
                    onChange={(e) => { setLockHeight(e.target.value); setLockWidth(""); }}
                    placeholder="e.g. 1920"
                    className="flex-1 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-secondary/30"
                  />
                  {convertedW && (
                    <div className="flex items-center gap-2 bg-violet-50 border border-violet-100 rounded-xl px-4 py-3">
                      <span className="text-sm font-extrabold text-violet-700">→ {convertedW} px</span>
                      <button onClick={() => void copy(convertedW, "w")} className="text-muted-foreground hover:text-foreground">
                        {copied === "w" ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                      </button>
                    </div>
                  )}
                </div>
              </div>
              {parsedW === 0 && (
                <p className="text-xs text-muted-foreground">Enter a width and height above first, then enter a target size to convert.</p>
              )}
            </div>
          )}

          {mode === "simplify" && !simplified && (
            <div className="text-center py-4 text-sm text-muted-foreground">
              Enter a width and height to see the simplified ratio
            </div>
          )}
        </div>

        {/* Reference table */}
        <div className="bg-white border border-border rounded-3xl p-6 shadow-sm mb-8">
          <h2 className="font-extrabold text-base mb-4">Standard social video sizes</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left pb-2 text-xs font-bold text-muted-foreground uppercase tracking-wide">Platform</th>
                  <th className="text-left pb-2 text-xs font-bold text-muted-foreground uppercase tracking-wide">Format</th>
                  <th className="text-left pb-2 text-xs font-bold text-muted-foreground uppercase tracking-wide">Ratio</th>
                  <th className="text-left pb-2 text-xs font-bold text-muted-foreground uppercase tracking-wide">Size</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  { platform: "YouTube Shorts", format: "Vertical", ratio: "9:16", size: "1080×1920" },
                  { platform: "YouTube", format: "Landscape", ratio: "16:9", size: "1920×1080" },
                  { platform: "TikTok", format: "Vertical", ratio: "9:16", size: "1080×1920" },
                  { platform: "Instagram Reels", format: "Vertical", ratio: "9:16", size: "1080×1920" },
                  { platform: "Instagram Feed", format: "Square", ratio: "1:1", size: "1080×1080" },
                  { platform: "Instagram Feed", format: "Portrait", ratio: "4:5", size: "1080×1350" },
                  { platform: "Facebook", format: "Landscape", ratio: "16:9", size: "1280×720" },
                  { platform: "Facebook Reels", format: "Vertical", ratio: "9:16", size: "1080×1920" },
                  { platform: "Twitter / X", format: "Landscape", ratio: "16:9", size: "1280×720" },
                  { platform: "LinkedIn", format: "Landscape", ratio: "16:9", size: "1920×1080" },
                  { platform: "Snapchat", format: "Vertical", ratio: "9:16", size: "1080×1920" },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-secondary/20 transition-colors">
                    <td className="py-2.5 font-medium">{row.platform}</td>
                    <td className="py-2.5 text-muted-foreground">{row.format}</td>
                    <td className="py-2.5 font-bold text-violet-600">{row.ratio}</td>
                    <td className="py-2.5 text-muted-foreground font-mono text-xs">{row.size}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA */}
        <ToolsCta
          headerText="Perfect aspect ratio? Now create the clip."
          subText="Paste Youtube video URL, ShortPurify auto-crops your video to the perfect 9:16 ratio, adds captions, and publishes to TikTok, YouTube Shorts, and Instagram Reels automatically."
        />
     

      </main>
  );
}
