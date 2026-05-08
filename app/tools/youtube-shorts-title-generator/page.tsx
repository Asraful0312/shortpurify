"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Copy, Check, ArrowRight, Loader2, Youtube } from "lucide-react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import Image from "next/image";
import ToolsCta from "@/components/tools-cta";
import ToolsBreadcrumb from "@/components/tools-breadcrumb";
import { getToolError } from "@/lib/getToolError";

function getClientId() {
  if (typeof window === "undefined") return "ssr";
  let id = localStorage.getItem("sp_tool_client_id");
  if (!id) { id = crypto.randomUUID(); localStorage.setItem("sp_tool_client_id", id); }
  return id;
}

export default function YouTubeShortsTitleGenerator() {
  const [topic, setTopic] = useState("");
  const [titles, setTitles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<number | null>(null);
  const generateTool = useAction(api.toolsActions.generateToolContent);

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError("");
    setTitles([]);
    try {
      const data = await generateTool({ tool: "youtube-shorts-title", input: topic, clientId: getClientId() });
      const lines = (data.result ?? "")
        .split("\n")
        .map((l) => l.replace(/^\d+[\.\)]\s*/, "").trim())
        .filter(Boolean);
      setTitles(lines);
    } catch (err) {
      setError(getToolError(err));
    } finally {
      setLoading(false);
    }
  };

  const copy = async (text: string, i: number) => {
    await navigator.clipboard.writeText(text);
    setCopied(i);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <main className="max-w-3xl mx-auto px-4 py-14">
        {/* Header */}
        <ToolsBreadcrumb toolName="YouTube Shorts Title Generator" toolHref="/tools/youtube-shorts-title-generator" />
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 border border-red-100 px-3 py-1 rounded-full text-xs font-semibold mb-4">
            <Image src="/icons/youtube.png" alt="Youtube" width={16} height={16} /> Free Tool
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">
            YouTube Shorts Title Generator
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Generate 10 viral YouTube Shorts titles instantly. Powered by AI, free, no sign-up required.
          </p>
        </div>

        {/* Tool card */}
        <div className="bg-white border border-border rounded-3xl p-6 shadow-sm mb-6">
          <label className="block text-sm font-bold mb-2">
            What is your video about?
          </label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !loading) { e.preventDefault(); void generate(); }}}
            placeholder="e.g. 5 money habits that changed my life, how to learn coding in 30 days, morning routine for productivity..."
            rows={3}
            className="w-full border border-border rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 bg-secondary/30"
          />
          <p className="text-xs text-muted-foreground mt-1 mb-4">Be specific — better input = better titles</p>
          <button
            onClick={() => void generate()}
            disabled={loading || !topic.trim()}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Generating…</>
              : <><Sparkles size={16} /> Generate 10 Titles</>}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Results */}
        {titles.length > 0 && (
          <div className="bg-white border border-border rounded-3xl p-6 shadow-sm mb-8">
            <h2 className="font-extrabold text-base mb-4 flex items-center gap-2">
              <Sparkles size={15} className="text-primary" /> Your 10 YouTube Shorts Titles
            </h2>
            <div className="flex flex-col gap-2">
              {titles.map((title, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-3 px-4 py-3 bg-secondary/40 rounded-xl group hover:bg-secondary/70 transition-colors"
                >
                  <span className="text-sm font-medium flex-1">{title}</span>
                  <button
                    onClick={() => void copy(title, i)}
                    className="shrink-0 p-1.5 rounded-lg hover:bg-white transition-colors text-muted-foreground hover:text-foreground"
                    title="Copy"
                  >
                    {copied === i ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => void generate()}
              disabled={loading}
              className="mt-4 w-full text-sm font-semibold text-muted-foreground hover:text-foreground border border-border rounded-xl py-2.5 hover:bg-secondary/40 transition-colors"
            >
              Generate 10 more →
            </button>
          </div>
        )}

        {/* CTA */}
        <ToolsCta
          headerText="Got a great title? Now make the clip."
          subText="Paste Youtube video URL, ShortPurify cuts your long video into viral short clips, adds captions, and publishes directly to YouTube Shorts in minutes."
        />
      

        {/* SEO content */}
        <div className="mt-12 prose prose-sm max-w-none text-muted-foreground">
          <h2 className="text-foreground font-extrabold text-xl">How to write great YouTube Shorts titles</h2>
          <p>A great YouTube Shorts title does three things: stops the scroll, sets expectations, and triggers curiosity. The best performing titles in 2025 use numbers (&quot;5 ways…&quot;), strong action verbs, and a clear benefit.</p>
          <h3 className="text-foreground font-bold">Tips for higher click-through rates</h3>
          <ul>
            <li>Keep titles under 60 characters so they don&apos;t get cut off</li>
            <li>Front-load the most important keyword in the first 3 words</li>
            <li>Use brackets like [SHOCKING] or (Must Watch) sparingly but effectively</li>
            <li>Ask a question your target audience is already wondering</li>
            <li>Test 2-3 different titles by re-uploading or using A/B tools</li>
          </ul>
          <h3 className="text-foreground font-bold">Other free tools you might like</h3>
          <ul>
            <li><Link href="/tools/tiktok-caption-generator" className="text-primary">TikTok Caption Generator</Link> — viral captions + hashtags</li>
            <li><Link href="/tools/video-aspect-ratio-calculator" className="text-primary">Video Aspect Ratio Calculator</Link> — get the perfect size for every platform</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
