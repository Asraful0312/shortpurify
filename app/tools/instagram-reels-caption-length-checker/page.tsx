"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Hash, MessageSquareText } from "lucide-react";
import ToolsBreadcrumb from "@/components/tools-breadcrumb";
import ToolsCta from "@/components/tools-cta";

const MAX_INSTAGRAM_CAPTION = 2200;

export default function InstagramReelsCaptionLengthChecker() {
  const [caption, setCaption] = useState("");

  const stats = useMemo(() => {
    const hashtags = caption.match(/#[\p{L}\p{N}_]+/gu) ?? [];
    const words = caption.trim() ? caption.trim().split(/\s+/).length : 0;
    const chars = caption.length;
    return {
      chars,
      remaining: MAX_INSTAGRAM_CAPTION - chars,
      words,
      hashtags: hashtags.length,
      lines: caption ? caption.split("\n").length : 0,
      status: chars <= 150 ? "Short and scroll-friendly" : chars <= 500 ? "Good caption length" : chars <= 2200 ? "Long caption" : "Too long",
    };
  }, [caption]);

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <main className="max-w-3xl mx-auto px-4 py-14">
        <ToolsBreadcrumb toolName="Instagram Reels Caption Length Checker" toolHref="/tools/instagram-reels-caption-length-checker" />

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-pink-50 text-pink-600 border border-pink-100 px-3 py-1 rounded-full text-xs font-semibold mb-4">
            <Image src="/icons/instagram.png" alt="Instagram" width={14} height={14} /> Free Tool
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">Instagram Reels Caption Length Checker</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Count caption characters, words, lines, and hashtags before posting your Reel.
          </p>
        </div>

        <div className="bg-white border border-border rounded-3xl p-6 shadow-sm mb-8">
          <label className="font-bold flex items-center gap-2 mb-3"><MessageSquareText size={18} className="text-pink-600" /> Paste your caption</label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={7}
            placeholder="Write or paste your Instagram Reels caption here..."
            className="w-full border border-border rounded-2xl px-4 py-3 text-sm resize-none bg-secondary/30 focus:outline-none focus:ring-2 focus:ring-pink-200"
          />
          <div className={`mt-4 rounded-2xl border p-5 ${stats.remaining >= 0 ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"}`}>
            <p className={`text-2xl font-black ${stats.remaining >= 0 ? "text-emerald-700" : "text-red-700"}`}>{stats.status}</p>
            <p className="text-sm text-muted-foreground mt-1">{stats.remaining >= 0 ? `${stats.remaining} characters remaining` : `${Math.abs(stats.remaining)} characters over the limit`}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            ["Characters", stats.chars],
            ["Words", stats.words],
            ["Hashtags", stats.hashtags],
            ["Lines", stats.lines],
          ].map(([label, value]) => (
            <div key={label} className="bg-white border border-border rounded-2xl p-4 shadow-sm">
              <p className="text-xs font-bold text-muted-foreground">{label}</p>
              <p className="text-2xl font-black">{value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white border border-border rounded-3xl p-6 shadow-sm mb-8">
          <h2 className="font-extrabold text-lg mb-4 flex items-center gap-2"><Hash size={18} className="text-pink-600" /> Caption tips</h2>
          <ul className="space-y-3">
            {["Put the hook in the first line.", "Use line breaks for readability.", "Keep hashtags relevant instead of maxing out every time.", "Use a simple call to action when the Reel asks for comments or saves."].map((tip) => (
              <li key={tip} className="flex gap-2 text-sm text-muted-foreground"><CheckCircle2 size={15} className="text-emerald-500 mt-0.5 shrink-0" /> {tip}</li>
            ))}
          </ul>
        </div>

        <ToolsCta headerText="Caption ready? Make the Reel next." subText="ShortPurify turns long videos into short, captioned clips for Instagram Reels, TikTok, and YouTube Shorts." />

        <div className="mt-12 prose prose-sm max-w-none text-muted-foreground">
          <h2 className="text-foreground font-extrabold text-xl">Instagram Reels caption length</h2>
          <p>Instagram captions can be long, but Reels usually perform better when the first line is short and useful. Use this counter to keep your caption readable while staying within platform limits.</p>
          <h3 className="text-foreground font-bold">Related tools</h3>
          <ul>
            <li><Link href="/tools/hashtag-generator" className="text-primary">Hashtag Generator</Link></li>
            <li><Link href="/tools/instagram-reels-safe-zone-checker" className="text-primary">Instagram Reels Safe Zone Checker</Link></li>
          </ul>
        </div>
      </main>
    </div>
  );
}
