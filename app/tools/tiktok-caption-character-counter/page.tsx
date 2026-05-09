"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AtSign, CheckCircle2, MessageCircle } from "lucide-react";
import ToolsBreadcrumb from "@/components/tools-breadcrumb";
import ToolsCta from "@/components/tools-cta";

const PRACTICAL_LIMIT = 2200;

export default function TikTokCaptionCharacterCounter() {
  const [caption, setCaption] = useState("");

  const stats = useMemo(() => {
    const hashtags = caption.match(/#[\p{L}\p{N}_]+/gu) ?? [];
    const mentions = caption.match(/@[\p{L}\p{N}_.]+/gu) ?? [];
    const chars = caption.length;
    return {
      chars,
      hashtags: hashtags.length,
      mentions: mentions.length,
      words: caption.trim() ? caption.trim().split(/\s+/).length : 0,
      remaining: PRACTICAL_LIMIT - chars,
      status: chars <= 80 ? "Short hook caption" : chars <= 300 ? "Strong TikTok length" : chars <= PRACTICAL_LIMIT ? "Long but usable" : "Too long",
    };
  }, [caption]);

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <main className="max-w-3xl mx-auto px-4 py-14">
        <ToolsBreadcrumb toolName="TikTok Caption Character Counter" toolHref="/tools/tiktok-caption-character-counter" />

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-pink-50 text-pink-600 border border-pink-100 px-3 py-1 rounded-full text-xs font-semibold mb-4">
            <Image src="/icons/tik-tok.png" alt="TikTok" width={14} height={14} /> Free Tool
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">TikTok Caption Character Counter</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Check TikTok caption length, hashtags, mentions, and readability before posting.
          </p>
        </div>

        <div className="bg-white border border-border rounded-3xl p-6 shadow-sm mb-8">
          <label className="font-bold flex items-center gap-2 mb-3"><MessageCircle size={18} className="text-pink-600" /> Paste caption</label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={7}
            placeholder="Paste your TikTok caption here..."
            className="w-full border border-border rounded-2xl px-4 py-3 text-sm resize-none bg-secondary/30 focus:outline-none focus:ring-2 focus:ring-pink-200"
          />
          <div className={`mt-4 rounded-2xl border p-5 ${stats.remaining >= 0 ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"}`}>
            <p className={`text-2xl font-black ${stats.remaining >= 0 ? "text-emerald-700" : "text-red-700"}`}>{stats.status}</p>
            <p className="text-sm text-muted-foreground mt-1">{stats.remaining >= 0 ? `${stats.remaining} characters remaining in the practical limit` : `${Math.abs(stats.remaining)} characters over the practical limit`}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            ["Characters", stats.chars],
            ["Words", stats.words],
            ["Hashtags", stats.hashtags],
            ["Mentions", stats.mentions],
          ].map(([label, value]) => (
            <div key={label} className="bg-white border border-border rounded-2xl p-4 shadow-sm">
              <p className="text-xs font-bold text-muted-foreground">{label}</p>
              <p className="text-2xl font-black">{value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white border border-border rounded-3xl p-6 shadow-sm mb-8">
          <h2 className="font-extrabold text-lg mb-4 flex items-center gap-2"><AtSign size={18} className="text-pink-600" /> TikTok caption tips</h2>
          <ul className="space-y-3">
            {["Lead with the reason to watch or comment.", "Keep important words before the hashtags.", "Use 3-5 focused hashtags for most videos.", "Avoid stuffing mentions unless they add context."].map((tip) => (
              <li key={tip} className="flex gap-2 text-sm text-muted-foreground"><CheckCircle2 size={15} className="text-emerald-500 mt-0.5 shrink-0" /> {tip}</li>
            ))}
          </ul>
        </div>

        <ToolsCta headerText="Need a captioned TikTok clip?" subText="ShortPurify turns long videos into short clips with captions for TikTok, Reels, and Shorts." />

        <div className="mt-12 prose prose-sm max-w-none text-muted-foreground">
          <h2 className="text-foreground font-extrabold text-xl">TikTok caption length checker</h2>
          <p>TikTok captions can carry hashtags, context, and a call to action. This counter helps keep captions readable while giving the algorithm clear topic signals.</p>
          <h3 className="text-foreground font-bold">Related tools</h3>
          <ul>
            <li><Link href="/tools/tiktok-hashtag-counter" className="text-primary">TikTok Hashtag Counter</Link></li>
            <li><Link href="/tools/tiktok-caption-generator" className="text-primary">TikTok Caption Generator</Link></li>
          </ul>
        </div>
      </main>
    </div>
  );
}
