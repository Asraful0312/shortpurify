"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Copy, Check, Loader2, ImageIcon, ExternalLink } from "lucide-react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import ToolsNavBar from "@/components/tools-nav-bar";
import ToolsCta from "@/components/tools-cta";
import ToolsBreadcrumb from "@/components/tools-breadcrumb";
import { getToolError } from "@/lib/getToolError";

function getClientId() {
  if (typeof window === "undefined") return "ssr";
  let id = localStorage.getItem("sp_tool_client_id");
  if (!id) { id = crypto.randomUUID(); localStorage.setItem("sp_tool_client_id", id); }
  return id;
}

const AI_TOOLS = ["MIDJOURNEY", "DALLE", "STABLE_DIFFUSION"] as const;
type AiTool = typeof AI_TOOLS[number];

const AI_TOOL_STYLE: Record<AiTool, {
  label: string;
  description: string;
  color: string;
  bg: string;
  border: string;
  link: string;
  linkLabel: string;
}> = {
  MIDJOURNEY: {
    label: "Midjourney",
    description: "Paste into /imagine in the Midjourney Discord or midjourney.com",
    color: "text-indigo-700",
    bg: "bg-indigo-50",
    border: "border-indigo-100",
    link: "https://www.midjourney.com",
    linkLabel: "Open Midjourney",
  },
  DALLE: {
    label: "DALL·E 3",
    description: "Paste into ChatGPT (GPT-4o) or the OpenAI image API",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    link: "https://chatgpt.com",
    linkLabel: "Open ChatGPT",
  },
  STABLE_DIFFUSION: {
    label: "Stable Diffusion",
    description: "Paste into Automatic1111, ComfyUI, or Leonardo.ai",
    color: "text-orange-700",
    bg: "bg-orange-50",
    border: "border-orange-100",
    link: "https://leonardo.ai",
    linkLabel: "Open Leonardo.ai",
  },
};

interface ParsedResult {
  prompts: Record<AiTool, string>;
  tips: string[];
}

function parseResult(raw: string): ParsedResult {
  const result: Record<AiTool, string> = { MIDJOURNEY: "", DALLE: "", STABLE_DIFFUSION: "" };

  const sections: Record<string, string> = {
    MIDJOURNEY: "MIDJOURNEY",
    DALLE: "DALLE",
    STABLE_DIFFUSION: "STABLE_DIFFUSION",
  };

  for (const [key, label] of Object.entries(sections)) {
    const regex = new RegExp(`${label}:\\s*\\n([\\s\\S]*?)(?=\\n(?:MIDJOURNEY|DALLE|STABLE_DIFFUSION|TIPS):|$)`, "i");
    const match = raw.match(regex);
    if (match?.[1]) result[key as AiTool] = match[1].trim();
  }

  const tipsMatch = raw.match(/TIPS:\s*\n([\s\S]*?)$/i);
  const tips = tipsMatch?.[1]
    ?.split("\n")
    .map((l) => l.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean) ?? [];

  return { prompts: result, tips };
}

export default function YouTubeThumbnailPromptGenerator() {
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState<ParsedResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const generateTool = useAction(api.toolsActions.generateToolContent);

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await generateTool({ tool: "youtube-thumbnail-prompt", input: topic, clientId: getClientId() });
      setResult(parseResult(data.result ?? ""));
    } catch (err) {
      setError(getToolError(err));
    } finally {
      setLoading(false);
    }
  };

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const hasResults = result && AI_TOOLS.some((t) => result.prompts[t]);

  return (
    <div className="min-h-screen bg-[#FAFAF8]">

      <main className="max-w-3xl mx-auto px-4 py-14">
        {/* Header */}
        <ToolsBreadcrumb toolName="YouTube Thumbnail Prompt Generator" toolHref="/tools/youtube-thumbnail-prompt-generator" />
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 border border-red-100 px-3 py-1 rounded-full text-xs font-semibold mb-4">
            <ImageIcon size={13} /> Free Tool
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">
            YouTube Thumbnail Prompt Generator
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Get optimized AI image prompts for your YouTube thumbnail for Midjourney, DALL·E 3, and Stable Diffusion. Free, no sign-up required.
          </p>
        </div>

        {/* Tool card */}
        <div className="bg-white border border-border rounded-3xl p-6 shadow-sm mb-6">
          <label className="block text-sm font-bold mb-2">
            What is your YouTube video about?
          </label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !loading) { e.preventDefault(); void generate(); } }}
            placeholder="e.g. I tried eating one meal a day for 30 days, 10 Python projects that got me hired, how I built a $10k/month app in 3 months..."
            rows={3}
            className="w-full border border-border rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 bg-secondary/30"
          />
          <p className="text-xs text-muted-foreground mt-1 mb-4">Include your video title or main hook for the best prompt</p>
          <button
            onClick={() => void generate()}
            disabled={loading || !topic.trim()}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Generating prompts…</>
              : <><Sparkles size={16} /> Generate Thumbnail Prompts</>}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Results */}
        {hasResults && result && (
          <div className="flex flex-col gap-4 mb-8">
            {AI_TOOLS.map((tool) => {
              const prompt = result.prompts[tool];
              if (!prompt) return null;
              const style = AI_TOOL_STYLE[tool];
              return (
                <div key={tool} className={`bg-white border rounded-3xl p-6 shadow-sm ${style.border}`}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className={`text-sm font-extrabold ${style.color}`}>{style.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{style.description}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={style.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground border border-border rounded-lg px-2.5 py-1.5 hover:bg-secondary/40 transition-colors"
                      >
                        {style.linkLabel} <ExternalLink size={10} />
                      </a>
                      <button
                        onClick={() => void copy(prompt, tool)}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border hover:bg-secondary/40 transition-colors text-muted-foreground hover:text-foreground"
                      >
                        {copied === tool
                          ? <><Check size={12} className="text-green-600" /> Copied!</>
                          : <><Copy size={12} /> Copy</>}
                      </button>
                    </div>
                  </div>
                  <div className={`rounded-xl px-4 py-3 text-sm leading-relaxed font-mono ${style.bg} ${style.color}`}>
                    {prompt}
                  </div>
                </div>
              );
            })}

            {/* Tips */}
            {result.tips.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-100 rounded-3xl p-6">
                <p className="text-sm font-extrabold text-yellow-800 mb-3 flex items-center gap-2">
                  <Sparkles size={14} /> Thumbnail tips for this video
                </p>
                <ul className="flex flex-col gap-2">
                  {result.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-yellow-900">
                      <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-yellow-200 text-yellow-800 text-xs flex items-center justify-center font-bold">{i + 1}</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => void generate()}
              disabled={loading}
              className="w-full text-sm font-semibold text-muted-foreground hover:text-foreground border border-border rounded-xl py-2.5 hover:bg-secondary/40 transition-colors bg-white"
            >
              Regenerate →
            </button>
          </div>
        )}

        {/* CTA */}
        <ToolsCta
          headerText="Great thumbnail? Now make the Short."
          subText="Paste Youtube video URL, ShortPurify cuts your long video into viral short clips, adds captions, and publishes directly to YouTube Shorts in minutes."
        />

        {/* SEO content */}
        <div className="mt-12 prose prose-sm max-w-none text-muted-foreground">
          <h2 className="text-foreground font-extrabold text-xl">How to create the perfect YouTube thumbnail with AI</h2>
          <p>A great YouTube thumbnail is responsible for up to 90% of your click-through rate. AI image generators like Midjourney and DALL·E 3 can create professional thumbnails in seconds but only if you give them the right prompt.</p>
          <h3 className="text-foreground font-bold">What makes a high-CTR YouTube thumbnail?</h3>
          <ul>
            <li><strong>Bold contrast</strong> use colors that pop against YouTube&apos;s white background (red, yellow, bright blue)</li>
            <li><strong>Expressive face</strong> thumbnails with a surprised or excited face get significantly more clicks</li>
            <li><strong>Minimal text</strong> 3-4 words maximum, large enough to read on mobile</li>
            <li><strong>Clear focal point</strong> one main subject, no clutter</li>
            <li><strong>16:9 ratio</strong> always design at 1280×720 pixels</li>
          </ul>
          <h3 className="text-foreground font-bold">Midjourney vs DALL·E 3 for YouTube thumbnails</h3>
          <p>Midjourney produces more cinematic, stylized results and handles lighting exceptionally well. DALL·E 3 (via ChatGPT) is better at following detailed text instructions and is more accessible without a subscription. Stable Diffusion gives you the most control via tools like ComfyUI, and Leonardo.ai offers a free tier with good quality.</p>
          <h3 className="text-foreground font-bold">Other free tools you might like</h3>
          <ul>
            <li><Link href="/tools/youtube-shorts-title-generator" className="text-primary underline">YouTube Shorts Title Generator</Link> 10 click-worthy titles instantly</li>
            <li><Link href="/tools/hashtag-generator" className="text-primary underline">Hashtag Generator</Link> Instagram, TikTok & YouTube hashtags</li>
            <li><Link href="/tools/tiktok-caption-generator" className="text-primary underline">TikTok Caption Generator</Link> viral captions + hashtags</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
