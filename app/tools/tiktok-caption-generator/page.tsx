"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Copy, Check, ArrowRight, Loader2 } from "lucide-react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import ToolsCta from "@/components/tools-cta";
import ToolsNavBar from "@/components/tools-nav-bar";
import ToolsBreadcrumb from "@/components/tools-breadcrumb";
import { getToolError } from "@/lib/getToolError";

function getClientId() {
  if (typeof window === "undefined") return "ssr";
  let id = localStorage.getItem("sp_tool_client_id");
  if (!id) { id = crypto.randomUUID(); localStorage.setItem("sp_tool_client_id", id); }
  return id;
}

export default function TikTokCaptionGenerator() {
  const [description, setDescription] = useState("");
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedHashtags, setCopiedHashtags] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const generateTool = useAction(api.toolsActions.generateToolContent);

  const generate = async () => {
    if (!description.trim()) return;
    setLoading(true);
    setError("");
    setCaption("");
    setHashtags("");
    try {
      const data = await generateTool({ tool: "tiktok-caption", input: description, clientId: getClientId() });
      const raw = data.result ?? "";
      const captionMatch = raw.match(/CAPTION:\s*\n([\s\S]*?)(?=\n\s*HASHTAGS:|$)/i);
      const hashtagsMatch = raw.match(/HASHTAGS:\s*\n([\s\S]*?)$/i);
      setCaption(captionMatch?.[1]?.trim() ?? raw);
      setHashtags(hashtagsMatch?.[1]?.trim() ?? "");
    } catch (err) {
      setError(getToolError(err));
    } finally {
      setLoading(false);
    }
  };

  const copy = async (text: string, type: "caption" | "hashtags" | "all") => {
    await navigator.clipboard.writeText(text);
    if (type === "caption") { setCopiedCaption(true); setTimeout(() => setCopiedCaption(false), 1500); }
    if (type === "hashtags") { setCopiedHashtags(true); setTimeout(() => setCopiedHashtags(false), 1500); }
    if (type === "all") { setCopiedAll(true); setTimeout(() => setCopiedAll(false), 1500); }
  };

  const hasResult = caption || hashtags;

  return (
    <main className="max-w-3xl mx-auto px-4 py-14">
        {/* Header */}
        <ToolsBreadcrumb toolName="TikTok Caption Generator" toolHref="/tools/tiktok-caption-generator" />
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-pink-50 text-pink-600 border border-pink-100 px-3 py-1 rounded-full text-xs font-semibold mb-4">
            {/* eslint-disable-next-line @next/next-image */}
            <img src="/icons/tik-tok.png" alt="TikTok" className="w-3.5 h-3.5 object-contain" /> Free Tool
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">
            TikTok Caption Generator
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Generate viral TikTok captions with hashtags in seconds. Powered by AI free, no sign-up required.
          </p>
        </div>

        {/* Tool card */}
        <div className="bg-white border border-border rounded-3xl p-6 shadow-sm mb-6">
          <label className="block text-sm font-bold mb-2">
            Describe your TikTok video
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !loading) { e.preventDefault(); void generate(); }}}
            placeholder="e.g. showing my morning skincare routine with products under $20, cooking a viral pasta recipe in 60 seconds, day in my life as a software engineer..."
            rows={3}
            className="w-full border border-border rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 bg-secondary/30"
          />
          <p className="text-xs text-muted-foreground mt-1 mb-4">The more detail you give, the better the caption</p>
          <button
            onClick={() => void generate()}
            disabled={loading || !description.trim()}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Generating…</>
              : <><Sparkles size={16} /> Generate Caption &amp; Hashtags</>}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Results */}
        {hasResult && (
          <div className="bg-white border border-border rounded-3xl p-6 shadow-sm mb-8 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-base flex items-center gap-2">
                <Sparkles size={15} className="text-primary" /> Your TikTok Caption
              </h2>
              <button
                onClick={() => void copy(`${caption}\n\n${hashtags}`, "all")}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border hover:bg-secondary/40 transition-colors text-muted-foreground hover:text-foreground"
              >
                {copiedAll ? <><Check size={12} className="text-green-600" /> Copied!</> : <><Copy size={12} /> Copy All</>}
              </button>
            </div>

            {caption && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Caption</span>
                  <button
                    onClick={() => void copy(caption, "caption")}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copiedCaption ? <><Check size={11} className="text-green-600" /> Copied</> : <><Copy size={11} /> Copy</>}
                  </button>
                </div>
                <div className="bg-secondary/40 rounded-xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed">
                  {caption}
                </div>
              </div>
            )}

            {hashtags && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Hashtags</span>
                  <button
                    onClick={() => void copy(hashtags, "hashtags")}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copiedHashtags ? <><Check size={11} className="text-green-600" /> Copied</> : <><Copy size={11} /> Copy</>}
                  </button>
                </div>
                <div className="bg-secondary/40 rounded-xl px-4 py-3 text-sm text-pink-600 font-medium leading-relaxed">
                  {hashtags}
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

        {/* CTA */}
       <ToolsCta
          headerText="Got your caption? Now create the clip."
          subText="Paste Youtube video URL, ShortPurify cuts your long video into viral short clips, adds captions, and publishes directly to TikTok in minutes."
        />

      </main>
  );
}
