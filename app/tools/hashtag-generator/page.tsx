"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { Sparkles, Copy, Check, Loader2, Hash } from "lucide-react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import ToolsNavBar from "@/components/tools-nav-bar";
import ToolsCta from "@/components/tools-cta";
import Image from "next/image";
import ToolsBreadcrumb from "@/components/tools-breadcrumb";
import { getToolError } from "@/lib/getToolError";

function getClientId() {
  if (typeof window === "undefined") return "ssr";
  let id = localStorage.getItem("sp_tool_client_id");
  if (!id) { id = crypto.randomUUID(); localStorage.setItem("sp_tool_client_id", id); }
  return id;
}

const PLATFORMS = ["INSTAGRAM", "TIKTOK", "YOUTUBE"] as const;
type Platform = typeof PLATFORMS[number];

const PLATFORM_STYLE: Record<Platform, { label: string; color: string; bg: string; border: string, icon: ReactNode }> = {
  INSTAGRAM: { label: "Instagram", color: "text-pink-600", bg: "bg-pink-50", border: "border-pink-100", icon: <Image src="/icons/instagram.png" alt="Instagram" width={16} height={16} /> },
  TIKTOK:    { label: "TikTok",    color: "text-slate-800", bg: "bg-slate-50", border: "border-slate-200", icon: <Image src="/icons/tik-tok.png" alt="TikTok" width={16} height={16} /> },
  YOUTUBE:   { label: "YouTube Shorts", color: "text-red-600", bg: "bg-red-50", border: "border-red-100", icon: <Image src="/icons/youtube-short.png" alt="YouTube" width={16} height={16} /> },
};

function parseHashtags(raw: string): Record<Platform, string[]> {
  const result: Record<Platform, string[]> = { INSTAGRAM: [], TIKTOK: [], YOUTUBE: [] };
  for (const platform of PLATFORMS) {
    const regex = new RegExp(`${platform}:\\s*\\n([\\s\\S]*?)(?=\\n(?:INSTAGRAM|TIKTOK|YOUTUBE):|$)`, "i");
    const match = raw.match(regex);
    if (match?.[1]) {
      result[platform] = match[1]
        .split(/\s+/)
        .map((t) => t.trim())
        .filter((t) => t.startsWith("#"));
    }
  }
  return result;
}

export default function HashtagGenerator() {
  const [topic, setTopic] = useState("");
  const [hashtags, setHashtags] = useState<Record<Platform, string[]> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const generateTool = useAction(api.toolsActions.generateToolContent);

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError("");
    setHashtags(null);
    try {
      const data = await generateTool({ tool: "hashtag-generator", input: topic, clientId: getClientId() });
      setHashtags(parseHashtags(data.result ?? ""));
    } catch (err) {
      setError(getToolError(err));
    } finally {
      setLoading(false);
    }
  };

  const copyTags = async (tags: string[], key: string) => {
    await navigator.clipboard.writeText(tags.join(" "));
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const copyAll = async () => {
    if (!hashtags) return;
    const all = PLATFORMS.flatMap((p) => hashtags[p]).join(" ");
    await navigator.clipboard.writeText(all);
    setCopied("all");
    setTimeout(() => setCopied(null), 1500);
  };

  const hasResults = hashtags && PLATFORMS.some((p) => hashtags[p].length > 0);

  return (
    <div className="min-h-screen bg-[#FAFAF8]">

      <main className="max-w-3xl mx-auto px-4 py-14">
        {/* Header */}
        <ToolsBreadcrumb toolName="Hashtag Generator" toolHref="/tools/hashtag-generator" />
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-600 border border-violet-100 px-3 py-1 rounded-full text-xs font-semibold mb-4">
            <Hash size={13} /> Free Tool
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">
            Hashtag Generator
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Generate the best hashtags for Instagram, TikTok, and YouTube Shorts instantly. Powered by AI — free, no sign-up required.
          </p>
        </div>

        {/* Tool card */}
        <div className="bg-white border border-border rounded-3xl p-6 shadow-sm mb-6">
          <label className="block text-sm font-bold mb-2">
            What is your content about?
          </label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !loading) { e.preventDefault(); void generate(); } }}
            placeholder="e.g. morning skincare routine, home workout for beginners, how to save money in your 20s, travel vlog in Japan..."
            rows={3}
            className="w-full border border-border rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 bg-secondary/30"
          />
          <p className="text-xs text-muted-foreground mt-1 mb-4">Be specific — niche topics get better hashtag suggestions</p>
          <button
            onClick={() => void generate()}
            disabled={loading || !topic.trim()}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Generating…</>
              : <><Sparkles size={16} /> Generate Hashtags</>}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Results */}
        {hasResults && hashtags && (
          <div className="bg-white border border-border rounded-3xl p-6 shadow-sm mb-8 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-base flex items-center gap-2">
                <Sparkles size={15} className="text-primary" /> Your Hashtags
              </h2>
              <button
                onClick={() => void copyAll()}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border hover:bg-secondary/40 transition-colors text-muted-foreground hover:text-foreground"
              >
                {copied === "all"
                  ? <><Check size={12} className="text-green-600" /> Copied!</>
                  : <><Copy size={12} /> Copy All</>}
              </button>
            </div>

            {PLATFORMS.map((platform) => {
              const tags = hashtags[platform];
              if (!tags.length) return null;
              const style = PLATFORM_STYLE[platform];
              return (
                <div key={platform}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {style.icon}
                    <span className={`text-xs font-bold uppercase tracking-wide ${style.color}`}>
                      {style.label}
                    </span>
                    </div>
                    
                    <button
                      onClick={() => void copyTags(tags, platform)}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {copied === platform
                        ? <><Check size={11} className="text-green-600" /> Copied</>
                        : <><Copy size={11} /> Copy</>}
                    </button>
                  </div>
                  <div className={`rounded-xl px-4 py-3 border ${style.bg} ${style.border} flex flex-wrap gap-2`}>
                    {tags.map((tag) => (
                      <span key={tag} className={`text-xs font-semibold ${style.color}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">{tags.length} hashtags</p>
                </div>
              );
            })}

            <button
              onClick={() => void generate()}
              disabled={loading}
              className="w-full text-sm font-semibold text-muted-foreground hover:text-foreground border border-border rounded-xl py-2.5 hover:bg-secondary/40 transition-colors"
            >
              Regenerate →
            </button>
          </div>
        )}

        {/* CTA */}
        <ToolsCta
          headerText="Ready to post? Let AI make the clip too."
          subText="Paste Youtube video URL or upload your video. ShortPurify cuts your long video into short clips, adds captions, and publishes directly to Instagram, TikTok, and YouTube Shorts in minutes."
        />

        {/* SEO content */}
        <div className="mt-12 prose prose-sm max-w-none text-muted-foreground">
          <h2 className="text-foreground font-extrabold text-xl">How to use hashtags effectively in 2025</h2>
          <p>Hashtags work differently on each platform. On Instagram, a mix of niche and mid-size hashtags outperforms spamming 30 broad ones. On TikTok, hashtags influence the For You Page algorithm. On YouTube Shorts, they help with topic categorization rather than direct discovery.</p>
          <h3 className="text-foreground font-bold">Instagram hashtag strategy</h3>
          <ul>
            <li>Use 5–15 targeted hashtags, not the maximum 30 quality over quantity</li>
            <li>Mix: 3–4 niche tags (under 100K posts), 5–7 medium (100K–1M), 2–3 broad (1M+)</li>
            <li>Avoid banned or overused hashtags they can suppress your reach</li>
          </ul>
          <h3 className="text-foreground font-bold">TikTok hashtag strategy</h3>
          <ul>
            <li>3–5 hashtags is enough TikTok&apos;s algorithm relies more on content than tags</li>
            <li>Always include at least one trending hashtag relevant to your niche</li>
            <li>#FYP and #ForYou are too saturated use niche-specific tags instead</li>
          </ul>
          <h3 className="text-foreground font-bold">YouTube Shorts hashtag strategy</h3>
          <ul>
            <li>Add 3–5 hashtags in the description YouTube shows the first 3 above the title</li>
            <li>Use your main keyword as the first hashtag</li>
            <li>Too many hashtags can result in YouTube ignoring all of them</li>
          </ul>
          <h3 className="text-foreground font-bold">Other free tools you might like</h3>
          <ul>
            <li><Link href="/tools/tiktok-caption-generator" className="text-primary">TikTok Caption Generator</Link> — viral captions + hashtags</li>
            <li><Link href="/tools/youtube-shorts-title-generator" className="text-primary">YouTube Shorts Title Generator</Link> — 10 click-worthy titles instantly</li>
            <li><Link href="/tools/video-aspect-ratio-calculator" className="text-primary">Video Aspect Ratio Calculator</Link> — perfect size for every platform</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
