"use client";

import { useState } from "react";
import Image from "next/image";
import { Sparkles, Copy, Check, Loader2, Search, Tag, ListChecks, FileText } from "lucide-react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import ToolsBreadcrumb from "@/components/tools-breadcrumb";
import ToolsCta from "@/components/tools-cta";
import { getToolError } from "@/lib/getToolError";

function getClientId() {
  if (typeof window === "undefined") return "ssr";
  let id = localStorage.getItem("sp_tool_client_id");
  if (!id) { id = crypto.randomUUID(); localStorage.setItem("sp_tool_client_id", id); }
  return id;
}

type KeywordResult = {
  primaryKeyword: string;
  tags: string[];
  searchQueries: string[];
  descriptionKeywords: string[];
};

function extractSection(raw: string, section: string, next: string | null): string {
  const pattern = next
    ? new RegExp(`${section}:\\s*\\n([\\s\\S]*?)(?=\\n\\s*${next}:|$)`, "i")
    : new RegExp(`${section}:\\s*\\n([\\s\\S]*?)$`, "i");
  return raw.match(pattern)?.[1]?.trim() ?? "";
}

function parseResult(raw: string): KeywordResult {
  return {
    primaryKeyword: extractSection(raw, "PRIMARY_KEYWORD", "TAGS"),
    tags: extractSection(raw, "TAGS", "SEARCH_QUERIES")
      .split(",").map((t) => t.trim()).filter(Boolean),
    searchQueries: extractSection(raw, "SEARCH_QUERIES", "DESCRIPTION_KEYWORDS")
      .split("\n").map((t) => t.replace(/^[-•\d.]+\s*/, "").trim()).filter(Boolean),
    descriptionKeywords: extractSection(raw, "DESCRIPTION_KEYWORDS", null)
      .split(",").map((t) => t.trim()).filter(Boolean),
  };
}

export default function YouTubeKeywordTool() {
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState<KeywordResult | null>(null);
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
      const data = await generateTool({ tool: "youtube-keyword", input: topic, clientId: getClientId() });
      const parsed = parseResult(data.result ?? "");
      setResult(parsed);
      if (!parsed.primaryKeyword && !parsed.tags.length) {
        setError("Couldn't generate keywords for that input. Try adding a bit more detail.");
      }
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

  const copyAll = async () => {
    if (!result) return;
    const all = [
      `Primary keyword: ${result.primaryKeyword}`,
      `Tags: ${result.tags.join(", ")}`,
      `Search queries:\n${result.searchQueries.join("\n")}`,
      `Description keywords: ${result.descriptionKeywords.join(", ")}`,
    ].join("\n\n");
    await copy(all, "all");
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-14">
      <ToolsBreadcrumb toolName="YouTube Keyword Tool" toolHref="/tools/youtube-keyword-tool" />
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 border border-red-100 px-3 py-1 rounded-full text-xs font-semibold mb-4">
          <Image src="/icons/youtube.png" alt="YouTube" width={14} height={14} /> Free Tool
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-3">YouTube Keyword Tool</h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Get a primary keyword, tags, and real search phrases for your next YouTube video. Powered by AI — free, no sign-up.
        </p>
      </div>

      <div className="bg-white border border-border rounded-3xl p-6 shadow-sm mb-6">
        <label className="block text-sm font-bold mb-2">What is your video about?</label>
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !loading) { e.preventDefault(); void generate(); } }}
          placeholder="e.g. beginner guitar chords tutorial, how to fix a leaky faucet, best budget cameras for vlogging in 2026..."
          rows={3}
          className="w-full border border-border rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 bg-secondary/30"
        />
        <p className="text-xs text-muted-foreground mt-1 mb-4">The more specific the topic, the more useful the keywords</p>
        <button
          onClick={() => void generate()}
          disabled={loading || !topic.trim()}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? <><Loader2 size={16} className="animate-spin" /> Researching…</>
            : <><Sparkles size={16} /> Generate Keywords</>}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      {result && (result.primaryKeyword || result.tags.length > 0) && (
        <div className="bg-white border border-border rounded-3xl p-6 shadow-sm mb-8 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-base flex items-center gap-2">
              <Sparkles size={15} className="text-primary" /> Your Keyword Research
            </h2>
            <button
              onClick={() => void copyAll()}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border hover:bg-secondary/40 transition-colors text-muted-foreground hover:text-foreground"
            >
              {copied === "all" ? <><Check size={12} className="text-green-600" /> Copied!</> : <><Copy size={12} /> Copy All</>}
            </button>
          </div>

          {result.primaryKeyword && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5"><Search size={12} /> Primary keyword</span>
                <button onClick={() => void copy(result.primaryKeyword, "primary")} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  {copied === "primary" ? <><Check size={11} className="text-green-600" /> Copied</> : <><Copy size={11} /> Copy</>}
                </button>
              </div>
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm font-bold text-red-700">
                {result.primaryKeyword}
              </div>
            </div>
          )}

          {result.tags.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5"><Tag size={12} /> Video tags ({result.tags.length})</span>
                <button onClick={() => void copy(result.tags.join(", "), "tags")} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  {copied === "tags" ? <><Check size={11} className="text-green-600" /> Copied</> : <><Copy size={11} /> Copy</>}
                </button>
              </div>
              <div className="bg-secondary/40 rounded-xl px-4 py-3 flex flex-wrap gap-2">
                {result.tags.map((tag) => (
                  <span key={tag} className="text-xs font-semibold text-foreground bg-white border border-border rounded-full px-2.5 py-1">{tag}</span>
                ))}
              </div>
            </div>
          )}

          {result.searchQueries.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5"><ListChecks size={12} /> Search queries viewers use</span>
                <button onClick={() => void copy(result.searchQueries.join("\n"), "queries")} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  {copied === "queries" ? <><Check size={11} className="text-green-600" /> Copied</> : <><Copy size={11} /> Copy</>}
                </button>
              </div>
              <ul className="bg-secondary/40 rounded-xl px-4 py-3 text-sm space-y-1.5">
                {result.searchQueries.map((q) => (
                  <li key={q} className="text-muted-foreground">{q}</li>
                ))}
              </ul>
            </div>
          )}

          {result.descriptionKeywords.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5"><FileText size={12} /> Description keywords</span>
                <button onClick={() => void copy(result.descriptionKeywords.join(", "), "desc")} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  {copied === "desc" ? <><Check size={11} className="text-green-600" /> Copied</> : <><Copy size={11} /> Copy</>}
                </button>
              </div>
              <div className="bg-secondary/40 rounded-xl px-4 py-3 text-sm text-muted-foreground">
                {result.descriptionKeywords.join(", ")}
              </div>
            </div>
          )}

          <button
            onClick={() => void generate()}
            disabled={loading}
            className="w-full text-sm font-semibold text-muted-foreground hover:text-foreground border border-border rounded-xl py-2.5 hover:bg-secondary/40 transition-colors"
          >
            Regenerate →
          </button>
        </div>
      )}

      <ToolsCta
        headerText="Got your keywords? Now make the video."
        subText="Paste a YouTube video URL, ShortPurify cuts it into short clips, adds captions, and publishes to TikTok, Instagram Reels, and YouTube Shorts in minutes."
      />
    </main>
  );
}
