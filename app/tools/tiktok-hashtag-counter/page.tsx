"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { CheckCircle2, Hash } from "lucide-react";
import ToolsBreadcrumb from "@/components/tools-breadcrumb";
import ToolsCta from "@/components/tools-cta";

export default function TikTokHashtagCounter() {
  const [caption, setCaption] = useState("");

  const stats = useMemo(() => {
    const hashtags = caption.match(/#[\p{L}\p{N}_]+/gu) ?? [];
    const unique = Array.from(new Set(hashtags.map((tag) => tag.toLowerCase())));
    const count = hashtags.length;
    return {
      hashtags,
      unique,
      count,
      duplicates: count - unique.length,
      status: count === 0 ? "Add a few focused hashtags" : count <= 5 ? "Good hashtag count" : count <= 10 ? "A bit crowded" : "Too many hashtags",
    };
  }, [caption]);

  return (
    <main className="max-w-3xl mx-auto px-4 py-14">
        <ToolsBreadcrumb toolName="TikTok Hashtag Counter" toolHref="/tools/tiktok-hashtag-counter" />

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-pink-50 text-pink-600 border border-pink-100 px-3 py-1 rounded-full text-xs font-semibold mb-4">
            <Image src="/icons/tik-tok.png" alt="TikTok" width={14} height={14} /> Free Tool
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">TikTok Hashtag Counter</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Count hashtags, find duplicates, and keep your TikTok caption focused.
          </p>
        </div>

        <div className="bg-white border border-border rounded-3xl p-6 shadow-sm mb-8">
          <label className="font-bold flex items-center gap-2 mb-3"><Hash size={18} className="text-pink-600" /> Paste caption or hashtags</label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={6}
            placeholder="#tiktoktips #creator #shortformvideo"
            className="w-full border border-border rounded-2xl px-4 py-3 text-sm resize-none bg-secondary/30 focus:outline-none focus:ring-2 focus:ring-pink-200"
          />
          <div className={`mt-4 rounded-2xl border p-5 ${stats.count > 0 && stats.count <= 5 ? "bg-emerald-50 border-emerald-100" : "bg-amber-50 border-amber-100"}`}>
            <p className={`text-2xl font-black ${stats.count > 0 && stats.count <= 5 ? "text-emerald-700" : "text-amber-700"}`}>{stats.status}</p>
            <p className="text-sm text-muted-foreground mt-1">{stats.count} total hashtags · {stats.unique.length} unique · {stats.duplicates} duplicates</p>
          </div>
        </div>

        {stats.unique.length > 0 && (
          <div className="bg-white border border-border rounded-3xl p-6 shadow-sm mb-8">
            <h2 className="font-extrabold text-lg mb-4">Detected hashtags</h2>
            <div className="flex flex-wrap gap-2">
              {stats.unique.map((tag) => (
                <span key={tag} className="rounded-full bg-pink-50 border border-pink-100 px-3 py-1 text-sm font-bold text-pink-600">{tag}</span>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white border border-border rounded-3xl p-6 shadow-sm mb-8">
          <h2 className="font-extrabold text-lg mb-4">Hashtag mix checklist</h2>
          <ul className="space-y-3">
            {["Use 1-2 niche hashtags for the exact topic.", "Use 1-2 audience or community hashtags.", "Use one broad discovery tag only when it fits.", "Skip unrelated viral tags that confuse the algorithm."].map((tip) => (
              <li key={tip} className="flex gap-2 text-sm text-muted-foreground"><CheckCircle2 size={15} className="text-emerald-500 mt-0.5 shrink-0" /> {tip}</li>
            ))}
          </ul>
        </div>

        <ToolsCta headerText="Hashtags ready? Make the clip." subText="ShortPurify turns long videos into captioned TikToks, Reels, and Shorts." />

      </main>
  );
}
