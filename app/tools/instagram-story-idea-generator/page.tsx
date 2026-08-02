"use client";

import { useState } from "react";
import { Sparkles, Copy, Check, Loader2 } from "lucide-react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import ToolsCta from "@/components/tools-cta";
import ToolsBreadcrumb from "@/components/tools-breadcrumb";
import { getToolError } from "@/lib/getToolError";

function getClientId() {
  if (typeof window === "undefined") return "ssr";
  let id = localStorage.getItem("sp_tool_client_id");
  if (!id) { id = crypto.randomUUID(); localStorage.setItem("sp_tool_client_id", id); }
  return id;
}

function parseIdeas(raw: string): string[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^\d+\.\s/.test(line))
    .map((line) => line.replace(/^\d+\.\s*/, "").trim());
}

export default function InstagramStoryIdeaGenerator() {
  const [description, setDescription] = useState("");
  const [ideas, setIdeas] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const generateTool = useAction(api.toolsActions.generateToolContent);

  const generate = async () => {
    if (!description.trim()) return;
    setLoading(true);
    setError("");
    setIdeas([]);
    try {
      const data = await generateTool({ tool: "instagram-story-idea", input: description, clientId: getClientId() });
      const raw = data.result ?? "";
      const parsed = parseIdeas(raw);
      setIdeas(parsed);
      if (!parsed.length) setError("Couldn't generate ideas for that input. Try adding a bit more detail.");
    } catch (err) {
      setError(getToolError(err));
    } finally {
      setLoading(false);
    }
  };

  const copy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const copyAll = async () => {
    await navigator.clipboard.writeText(ideas.map((idea, i) => `${i + 1}. ${idea}`).join("\n"));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 1500);
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-14">
      {/* Header */}
      <ToolsBreadcrumb toolName="Instagram Story Idea Generator" toolHref="/tools/instagram-story-idea-generator" />
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-pink-50 text-pink-600 border border-pink-100 px-3 py-1 rounded-full text-xs font-semibold mb-4">
          {/* eslint-disable-next-line @next/next-image */}
          <img src="/icons/instagram.png" alt="Instagram" className="w-3.5 h-3.5 object-contain" /> Free Tool
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-3">
          Instagram Story Idea Generator
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Get 8 engaging Instagram Story ideas with sticker suggestions. Powered by AI, free, no sign-up required.
        </p>
      </div>

      {/* Tool card */}
      <div className="bg-white border border-border rounded-3xl p-6 shadow-sm mb-6">
        <label className="block text-sm font-bold mb-2">
          Describe your niche or what you&apos;re promoting
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !loading) { e.preventDefault(); void generate(); } }}
          placeholder="e.g. skincare brand launching a new serum, personal trainer building a client base, small bakery sharing daily specials..."
          rows={3}
          className="w-full border border-border rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 bg-secondary/30"
        />
        <p className="text-xs text-muted-foreground mt-1 mb-4">The more detail you give, the better the ideas</p>
        <button
          onClick={() => void generate()}
          disabled={loading || !description.trim()}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? <><Loader2 size={16} className="animate-spin" /> Generating…</>
            : <><Sparkles size={16} /> Generate Story Ideas</>}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      {/* Results */}
      {ideas.length > 0 && (
        <div className="bg-white border border-border rounded-3xl p-6 shadow-sm mb-8 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-base flex items-center gap-2">
              <Sparkles size={15} className="text-primary" /> Your Story Ideas
            </h2>
            <button
              onClick={() => void copyAll()}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border hover:bg-secondary/40 transition-colors text-muted-foreground hover:text-foreground"
            >
              {copiedAll ? <><Check size={12} className="text-green-600" /> Copied!</> : <><Copy size={12} /> Copy All</>}
            </button>
          </div>

          {ideas.map((idea, index) => (
            <div key={index} className="flex items-start justify-between gap-3 bg-secondary/40 rounded-xl px-4 py-3">
              <p className="text-sm leading-relaxed">
                <span className="font-bold text-primary mr-1.5">{index + 1}.</span>
                {idea}
              </p>
              <button
                onClick={() => void copy(idea, index)}
                className="shrink-0 mt-0.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                {copiedIndex === index ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
              </button>
            </div>
          ))}

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
        headerText="Got your Story ideas? Now automate the Reels too."
        subText="Paste a YouTube video URL, ShortPurify cuts your long video into viral short clips, adds captions, and publishes directly to Instagram Reels in minutes."
      />
    </main>
  );
}
