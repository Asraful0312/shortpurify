"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Copy, Check, Loader2, FileText, Clock, Lightbulb } from "lucide-react";
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

interface Script {
  hook: string;
  body: string;
  cta: string;
  duration: string;
  notes: string[];
}

function parseScript(raw: string): Script {
  const extract = (label: string, next: string) => {
    const regex = new RegExp(`${label}:\\s*\\n([\\s\\S]*?)(?=\\n(?:HOOK|BODY|CTA|DURATION|NOTES):|$)`, "i");
    return raw.match(regex)?.[1]?.trim() ?? "";
  };

  const notesRaw = raw.match(/NOTES:\s*\n([\s\S]*?)$/i)?.[1] ?? "";
  const notes = notesRaw
    .split("\n")
    .map((l) => l.replace(/^[-•*\d.]\s*/, "").trim())
    .filter(Boolean);

  return {
    hook: extract("HOOK", "BODY"),
    body: extract("BODY", "CTA"),
    cta: extract("CTA", "DURATION"),
    duration: extract("DURATION", "NOTES"),
    notes,
  };
}

const SECTION_STYLE = {
  hook:     { label: "Hook", sublabel: "First 3 seconds", icon: <Sparkles size={14} />, color: "text-red-600",    bg: "bg-red-50",    border: "border-red-100" },
  body:     { label: "Body", sublabel: "Core content",    icon: <FileText size={14} />,  color: "text-blue-700",  bg: "bg-blue-50",  border: "border-blue-100" },
  cta:      { label: "CTA",  sublabel: "Call to action",  icon: <Sparkles size={14} />,  color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-100" },
} as const;

export default function YouTubeShortsScriptGenerator() {
  const [topic, setTopic] = useState("");
  const [script, setScript] = useState<Script | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const generateTool = useAction(api.toolsActions.generateToolContent);

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError("");
    setScript(null);
    try {
      const data = await generateTool({ tool: "youtube-shorts-script", input: topic, clientId: getClientId() });
      setScript(parseScript(data.result ?? ""));
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

  const copyFullScript = () => {
    if (!script) return;
    const full = `HOOK:\n${script.hook}\n\nBODY:\n${script.body}\n\nCTA:\n${script.cta}`;
    void copy(full, "all");
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8]">

      <main className="max-w-3xl mx-auto px-4 py-14">
        {/* Header */}
        <ToolsBreadcrumb toolName="YouTube Shorts Script Generator" toolHref="/tools/youtube-shorts-script-generator" />
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 border border-red-100 px-3 py-1 rounded-full text-xs font-semibold mb-4">
            <FileText size={13} /> Free Tool
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">
            YouTube Shorts Script Generator
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Generate a complete Short script hook, body, and CTA in seconds. Powered by AI, free, no sign-up required.
          </p>
        </div>

        {/* Tool card */}
        <div className="bg-white border border-border rounded-3xl p-6 shadow-sm mb-6">
          <label className="block text-sm font-bold mb-2">
            What is your Short about?
          </label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !loading) { e.preventDefault(); void generate(); } }}
            placeholder="e.g. 3 habits that doubled my productivity, why you should drink water before coffee, the biggest mistake new investors make..."
            rows={3}
            className="w-full border border-border rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 bg-secondary/30"
          />
          <p className="text-xs text-muted-foreground mt-1 mb-4">Include the main message or hook idea for the best script</p>
          <button
            onClick={() => void generate()}
            disabled={loading || !topic.trim()}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Writing script…</>
              : <><Sparkles size={16} /> Generate Script</>}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Results */}
        {script && (
          <div className="flex flex-col gap-4 mb-8">
            {/* Top bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock size={14} />
                <span className="font-semibold">{script.duration || "~45 seconds"}</span>
              </div>
              <button
                onClick={copyFullScript}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border hover:bg-secondary/40 transition-colors text-muted-foreground hover:text-foreground"
              >
                {copied === "all"
                  ? <><Check size={12} className="text-green-600" /> Copied!</>
                  : <><Copy size={12} /> Copy Full Script</>}
              </button>
            </div>

            {/* Hook, Body, CTA */}
            {(["hook", "body", "cta"] as const).map((key) => {
              const text = script[key];
              if (!text) return null;
              const style = SECTION_STYLE[key];
              return (
                <div key={key} className={`border rounded-3xl p-5 ${style.bg} ${style.border}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={style.color}>{style.icon}</span>
                      <div>
                        <span className={`text-sm font-extrabold ${style.color}`}>{style.label}</span>
                        <span className="text-xs text-muted-foreground ml-2">{style.sublabel}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => void copy(text, key)}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {copied === key
                        ? <><Check size={11} className="text-green-600" /> Copied</>
                        : <><Copy size={11} /> Copy</>}
                    </button>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
                </div>
              );
            })}

            {/* Visual notes */}
            {script.notes.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-100 rounded-3xl p-5">
                <p className="text-sm font-extrabold text-yellow-800 mb-3 flex items-center gap-2">
                  <Lightbulb size={14} className="text-yellow-500" /> On-screen text &amp; visual tips
                </p>
                <ul className="flex flex-col gap-2">
                  {script.notes.map((note, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-yellow-900">
                      <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-yellow-200 text-yellow-800 text-xs flex items-center justify-center font-bold">{i + 1}</span>
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => void generate()}
              disabled={loading}
              className="w-full text-sm font-semibold text-muted-foreground hover:text-foreground border border-border rounded-xl py-2.5 hover:bg-secondary/40 bg-white transition-colors"
            >
              Regenerate script →
            </button>
          </div>
        )}

        {/* CTA */}
        <ToolsCta
          headerText="Got your script? Now record and publish."
          subText="Paste Youtube video URL, ShortPurify turns your long videos into short clips automatically with AI captions, smart crop, and one-click publishing to YouTube Shorts, TikTok, and Instagram Reels."
        />

        {/* SEO content */}
        <div className="mt-12 prose prose-sm max-w-none text-muted-foreground">
          <h2 className="text-foreground font-extrabold text-xl">How to write a YouTube Shorts script that keeps viewers watching</h2>
          <p>YouTube Shorts are won or lost in the first 3 seconds. Unlike long-form videos, you have no time to warm up your hook must be the very first thing viewers hear or see.</p>
          <h3 className="text-foreground font-bold">The 3-part Short script structure</h3>
          <ul>
            <li><strong>Hook (0–3s)</strong> — Start mid-thought. &quot;I can&apos;t believe this works...&quot; or &quot;Nobody talks about this.&quot; Avoid intros and name drops.</li>
            <li><strong>Body (3s–end)</strong> — Deliver the value fast. One idea per sentence. Cut anything that doesn&apos;t move the story forward.</li>
            <li><strong>CTA (last 3s)</strong> — Ask for one thing: follow, comment, or link. Never ask for multiple actions in one Short.</li>
          </ul>
          <h3 className="text-foreground font-bold">How long should a YouTube Shorts script be?</h3>
          <p>An average speaking pace is 130–150 words per minute. For a 30-second Short, write ~65 words. For 60 seconds, ~130 words. Keep it tight the algorithm rewards high retention, and shorter scripts typically perform better because viewers loop them.</p>
          <h3 className="text-foreground font-bold">Other free tools you might like</h3>
          <ul>
            <li><Link href="/tools/youtube-shorts-title-generator" className="text-primary">YouTube Shorts Title Generator</Link> — 10 click-worthy titles instantly</li>
            <li><Link href="/tools/youtube-shorts-duration-calculator" className="text-primary">YouTube Shorts Duration Calculator</Link> — find the optimal clip length</li>
            <li><Link href="/tools/youtube-thumbnail-prompt-generator" className="text-primary">YouTube Thumbnail Prompt Generator</Link> — AI prompts for Midjourney & DALL·E</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
