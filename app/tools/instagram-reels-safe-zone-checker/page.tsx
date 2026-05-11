"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { CheckCircle2, Frame, Ruler } from "lucide-react";
import ToolsBreadcrumb from "@/components/tools-breadcrumb";
import ToolsCta from "@/components/tools-cta";

export default function InstagramReelsSafeZoneChecker() {
  const [width, setWidth] = useState(1080);
  const [height, setHeight] = useState(1920);

  const safeZone = useMemo(() => ({
    top: Math.round(height * 0.14),
    bottom: Math.round(height * 0.2),
    side: Math.round(width * 0.06),
    safeWidth: Math.round(width * 0.88),
    safeHeight: Math.round(height * 0.66),
  }), [height, width]);

  return (
    <main className="max-w-4xl mx-auto px-4 py-14">
        <ToolsBreadcrumb toolName="Instagram Reels Safe Zone Checker" toolHref="/tools/instagram-reels-safe-zone-checker" />

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-pink-50 text-pink-600 border border-pink-100 px-3 py-1 rounded-full text-xs font-semibold mb-4">
            <Image src="/icons/instagram.png" alt="Instagram" width={14} height={14} /> Free Tool
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">Instagram Reels Safe Zone Checker</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Calculate where to keep captions, logos, and faces so Instagram buttons do not cover important content.
          </p>
        </div>

        <div className="grid md:grid-cols-[0.8fr_1fr] gap-6 mb-8">
          <div className="bg-white border border-border rounded-3xl p-6 shadow-sm">
            <h2 className="font-extrabold mb-4 flex items-center gap-2"><Ruler size={18} className="text-pink-600" /> Video size</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1.5">Width</label>
                <input type="number" value={width} onChange={(e) => setWidth(Number(e.target.value) || 1080)} className="w-full border border-border rounded-xl px-4 py-3 bg-secondary/30 focus:outline-none focus:ring-2 focus:ring-pink-200" />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1.5">Height</label>
                <input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value) || 1920)} className="w-full border border-border rounded-xl px-4 py-3 bg-secondary/30 focus:outline-none focus:ring-2 focus:ring-pink-200" />
              </div>
            </div>
            <button onClick={() => { setWidth(1080); setHeight(1920); }} className="mt-4 w-full rounded-xl border border-border py-2.5 text-sm font-bold hover:bg-pink-50 hover:border-pink-100">
              Reset to 1080x1920
            </button>
          </div>

          <div className="bg-white border border-border rounded-3xl p-6 shadow-sm">
            <h2 className="font-extrabold mb-4 flex items-center gap-2"><Frame size={18} className="text-pink-600" /> Safe area preview</h2>
            <div className="mx-auto max-w-[220px] aspect-9/16 rounded-[2rem] bg-slate-950 p-4 relative overflow-hidden">
              <div className="absolute inset-x-4 top-10 bottom-24 rounded-2xl border-2 border-emerald-400 bg-emerald-400/10" />
              <div className="absolute left-4 right-4 top-4 h-8 rounded-xl bg-red-500/25 border border-red-300/70" />
              <div className="absolute left-4 right-4 bottom-4 h-16 rounded-xl bg-red-500/25 border border-red-300/70" />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3">
                <div className="size-8 rounded-full bg-white/80" />
                <div className="size-8 rounded-full bg-white/80" />
                <div className="size-8 rounded-full bg-white/80" />
              </div>
              <p className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-xs font-bold text-emerald-200">Keep key text here</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-border rounded-3xl p-6 shadow-sm mb-8">
          <h2 className="font-extrabold text-lg mb-4">Recommended safe zone</h2>
          <div className="grid sm:grid-cols-5 gap-3">
            {[
              ["Top", `${safeZone.top}px`],
              ["Bottom", `${safeZone.bottom}px`],
              ["Sides", `${safeZone.side}px`],
              ["Safe width", `${safeZone.safeWidth}px`],
              ["Safe height", `${safeZone.safeHeight}px`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-secondary/30 p-4">
                <p className="text-xs font-bold text-muted-foreground">{label}</p>
                <p className="text-xl font-black">{value}</p>
              </div>
            ))}
          </div>
          <ul className="mt-5 space-y-2">
            {["Keep captions above the bottom controls.", "Avoid placing logos on the right action bar.", "Keep faces and product details near the center third."].map((tip) => (
              <li key={tip} className="flex gap-2 text-sm text-muted-foreground"><CheckCircle2 size={15} className="text-emerald-500 mt-0.5 shrink-0" /> {tip}</li>
            ))}
          </ul>
        </div>

        <ToolsCta headerText="Need safe captions automatically?" subText="ShortPurify crops and captions long videos into vertical clips for Instagram Reels, TikTok, and YouTube Shorts." />

      </main>
  );
}
