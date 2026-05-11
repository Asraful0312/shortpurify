"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { CheckCircle2, Heading1 } from "lucide-react";
import ToolsBreadcrumb from "@/components/tools-breadcrumb";
import ToolsCta from "@/components/tools-cta";

export default function YouTubeShortsTitleLengthChecker() {
  const [title, setTitle] = useState("");

  const stats = useMemo(() => {
    const chars = title.length;
    const words = title.trim() ? title.trim().split(/\s+/).length : 0;
    return {
      chars,
      words,
      remaining: 100 - chars,
      status: chars === 0 ? "Enter a title" : chars <= 45 ? "Great mobile length" : chars <= 70 ? "Good title length" : chars <= 100 ? "May truncate on mobile" : "Too long for YouTube",
    };
  }, [title]);

  return (
    <main className="max-w-3xl mx-auto px-4 py-14">
        <ToolsBreadcrumb toolName="YouTube Shorts Title Length Checker" toolHref="/tools/youtube-shorts-title-length-checker" />

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 border border-red-100 px-3 py-1 rounded-full text-xs font-semibold mb-4">
            <Image src="/icons/youtube-short.png" alt="YouTube Shorts" width={14} height={14} /> Free Tool
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">YouTube Shorts Title Length Checker</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Check title characters, words, and mobile readability before uploading a Short.
          </p>
        </div>

        <div className="bg-white border border-border rounded-3xl p-6 shadow-sm mb-8">
          <label className="font-bold flex items-center gap-2 mb-3"><Heading1 size={18} className="text-red-600" /> Shorts title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Type your YouTube Shorts title..."
            className="w-full border border-border rounded-2xl px-4 py-4 text-sm bg-secondary/30 focus:outline-none focus:ring-2 focus:ring-red-200"
          />
          <div className={`mt-4 rounded-2xl border p-5 ${stats.chars > 0 && stats.chars <= 70 ? "bg-emerald-50 border-emerald-100" : "bg-amber-50 border-amber-100"}`}>
            <p className={`text-2xl font-black ${stats.chars > 0 && stats.chars <= 70 ? "text-emerald-700" : "text-amber-700"}`}>{stats.status}</p>
            <p className="text-sm text-muted-foreground mt-1">{stats.remaining >= 0 ? `${stats.remaining} characters remaining` : `${Math.abs(stats.remaining)} characters over YouTube's title limit`}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="bg-white border border-border rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-bold text-muted-foreground">Characters</p>
            <p className="text-2xl font-black">{stats.chars}</p>
          </div>
          <div className="bg-white border border-border rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-bold text-muted-foreground">Words</p>
            <p className="text-2xl font-black">{stats.words}</p>
          </div>
        </div>

        <div className="bg-white border border-border rounded-3xl p-6 shadow-sm mb-8">
          <h2 className="font-extrabold text-lg mb-4">Shorts title checklist</h2>
          <ul className="space-y-3">
            {["Put the main keyword early.", "Keep the mobile title readable under about 45-70 characters.", "Use curiosity, but avoid clickbait that the video cannot satisfy.", "Remove filler words before upload."].map((tip) => (
              <li key={tip} className="flex gap-2 text-sm text-muted-foreground"><CheckCircle2 size={15} className="text-emerald-500 mt-0.5 shrink-0" /> {tip}</li>
            ))}
          </ul>
        </div>

        <ToolsCta headerText="Title ready? Make the Short." subText="ShortPurify turns long videos into short clips with captions and smart vertical framing." />

      </main>
  );
}
