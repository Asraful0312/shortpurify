"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Image as ImageIcon, LayoutGrid, RectangleVertical } from "lucide-react";
import ToolsBreadcrumb from "@/components/tools-breadcrumb";
import ToolsCta from "@/components/tools-cta";

const PRESETS = [
  { label: "Full Reels cover", ratio: "9:16", width: 1080, height: 1920, note: "Best upload canvas" },
  { label: "Profile grid crop", ratio: "3:4", width: 1080, height: 1440, note: "Keep title inside this crop" },
  { label: "Feed preview", ratio: "4:5", width: 1080, height: 1350, note: "Useful for feed visibility" },
  { label: "Square center", ratio: "1:1", width: 1080, height: 1080, note: "Avoid putting text outside this if grid matters" },
];

export default function InstagramReelsCoverSizeCalculator() {
  const [baseWidth, setBaseWidth] = useState(1080);
  const fullHeight = Math.round(baseWidth * 16 / 9);
  const gridHeight = Math.round(baseWidth * 4 / 3);
  const feedHeight = Math.round(baseWidth * 5 / 4);

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <main className="max-w-4xl mx-auto px-4 py-14">
        <ToolsBreadcrumb toolName="Instagram Reels Cover Size Calculator" toolHref="/tools/instagram-reels-cover-size-calculator" />

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-pink-50 text-pink-600 border border-pink-100 px-3 py-1 rounded-full text-xs font-semibold mb-4">
            <Image src="/icons/instagram.png" alt="Instagram" width={14} height={14} /> Free Tool
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">Instagram Reels Cover Size Calculator</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Design Reels covers that work in the Reels tab, feed preview, and profile grid.
          </p>
        </div>

        <div className="bg-white border border-border rounded-3xl p-6 shadow-sm mb-8">
          <label className="font-bold flex items-center gap-2 mb-3"><RectangleVertical size={18} className="text-pink-600" /> Cover width</label>
          <input type="number" value={baseWidth} onChange={(e) => setBaseWidth(Number(e.target.value) || 1080)} className="w-full border border-border rounded-xl px-4 py-3 bg-secondary/30 focus:outline-none focus:ring-2 focus:ring-pink-200" />
          <div className="grid sm:grid-cols-3 gap-3 mt-5">
            {[
              ["Full cover", `${baseWidth}x${fullHeight}`],
              ["Grid crop", `${baseWidth}x${gridHeight}`],
              ["Feed crop", `${baseWidth}x${feedHeight}`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-pink-50 border border-pink-100 p-4">
                <p className="text-xs font-bold text-pink-600/70">{label}</p>
                <p className="text-2xl font-black text-pink-700">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white border border-border rounded-3xl p-6 shadow-sm">
            <h2 className="font-extrabold mb-4 flex items-center gap-2"><ImageIcon size={18} className="text-pink-600" /> Cover presets</h2>
            <div className="space-y-3">
              {PRESETS.map((preset) => (
                <div key={preset.label} className="border border-border rounded-2xl p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold">{preset.label}</p>
                    <span className="text-xs font-black text-pink-600">{preset.ratio}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{preset.width}x{preset.height} · {preset.note}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-border rounded-3xl p-6 shadow-sm">
            <h2 className="font-extrabold mb-4 flex items-center gap-2"><LayoutGrid size={18} className="text-pink-600" /> Text placement rule</h2>
            <div className="mx-auto max-w-[220px] aspect-[9/16] rounded-2xl bg-slate-950 relative overflow-hidden">
              <div className="absolute inset-x-0 top-[12.5%] bottom-[12.5%] bg-pink-500/20 border-y-2 border-pink-300" />
              <div className="absolute inset-x-0 top-[21.875%] bottom-[21.875%] bg-emerald-400/20 border-y-2 border-emerald-300" />
              <p className="absolute inset-x-4 top-1/2 -translate-y-1/2 text-center text-white text-sm font-black">Title stays here</p>
            </div>
            <p className="text-sm text-muted-foreground mt-4">Keep important cover text close to the center so it survives profile grid and feed crops.</p>
          </div>
        </div>

        <ToolsCta headerText="Need Reels covers from long videos?" subText="ShortPurify helps turn long videos into short clips with captions and vertical framing for Reels." />

        <div className="mt-12 prose prose-sm max-w-none text-muted-foreground">
          <h2 className="text-foreground font-extrabold text-xl">Instagram Reels cover size</h2>
          <p>A full Instagram Reels cover uses the same vertical 9:16 canvas as the Reel. The tricky part is that Instagram may crop the cover in the feed and profile grid, so the title should stay near the center.</p>
          <h3 className="text-foreground font-bold">Related tools</h3>
          <ul>
            <li><Link href="/tools/instagram-reels-size-calculator" className="text-primary">Instagram Reels Size Calculator</Link></li>
            <li><Link href="/tools/instagram-reels-safe-zone-checker" className="text-primary">Instagram Reels Safe Zone Checker</Link></li>
          </ul>
        </div>
      </main>
    </div>
  );
}
