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

const STYLE_ORDER = ["AESTHETIC", "FUNNY", "PROFESSIONAL", "MINIMAL", "BOLD"] as const;

const STYLE_LABELS: Record<(typeof STYLE_ORDER)[number], string> = {
  AESTHETIC: "Aesthetic",
  FUNNY: "Funny",
  PROFESSIONAL: "Professional",
  MINIMAL: "Minimal",
  BOLD: "Bold",
};

function parseBios(raw: string): { style: string; bio: string }[] {
  const results: { style: string; bio: string }[] = [];
  for (let i = 0; i < STYLE_ORDER.length; i++) {
    const key = STYLE_ORDER[i];
    const nextKey = STYLE_ORDER[i + 1];
    const pattern = nextKey
      ? new RegExp(`${key}:\\s*\\n([\\s\\S]*?)(?=\\n\\s*${nextKey}:|$)`, "i")
      : new RegExp(`${key}:\\s*\\n([\\s\\S]*?)$`, "i");
    const match = raw.match(pattern);
    const bio = match?.[1]?.trim();
    if (bio) results.push({ style: STYLE_LABELS[key], bio });
  }
  return results;
}

export default function InstagramBioGenerator() {
  const [description, setDescription] = useState("");
  const [bios, setBios] = useState<{ style: string; bio: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const generateTool = useAction(api.toolsActions.generateToolContent);

  const generate = async () => {
    if (!description.trim()) return;
    setLoading(true);
    setError("");
    setBios([]);
    try {
      const data = await generateTool({ tool: "instagram-bio", input: description, clientId: getClientId() });
      const raw = data.result ?? "";
      const parsed = parseBios(raw);
      setBios(parsed);
      if (!parsed.length) setError("Couldn't generate bios for that input. Try adding a bit more detail.");
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

  return (
    <main className="max-w-3xl mx-auto px-4 py-14">
      {/* Header */}
      <ToolsBreadcrumb toolName="Instagram Bio Generator" toolHref="/tools/instagram-bio-generator" />
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-pink-50 text-pink-600 border border-pink-100 px-3 py-1 rounded-full text-xs font-semibold mb-4">
          {/* eslint-disable-next-line @next/next-image */}
          <img src="/icons/instagram.png" alt="Instagram" className="w-3.5 h-3.5 object-contain" /> Free Tool
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-3">
          Instagram Bio Generator
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Get 5 ready-to-use Instagram bio options in different styles. Powered by AI, free, no sign-up required.
        </p>
      </div>

      {/* Tool card */}
      <div className="bg-white border border-border rounded-3xl p-6 shadow-sm mb-6">
        <label className="block text-sm font-bold mb-2">
          Describe yourself or your brand
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !loading) { e.preventDefault(); void generate(); } }}
          placeholder="e.g. freelance graphic designer who loves minimalist branding, mom of two sharing budget meal prep, personal trainer helping busy professionals get fit..."
          rows={3}
          className="w-full border border-border rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 bg-secondary/30"
        />
        <p className="text-xs text-muted-foreground mt-1 mb-4">The more detail you give, the better the bios</p>
        <button
          onClick={() => void generate()}
          disabled={loading || !description.trim()}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? <><Loader2 size={16} className="animate-spin" /> Generating…</>
            : <><Sparkles size={16} /> Generate Bios</>}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      {/* Results */}
      {bios.length > 0 && (
        <div className="bg-white border border-border rounded-3xl p-6 shadow-sm mb-8 flex flex-col gap-5">
          <h2 className="font-extrabold text-base flex items-center gap-2">
            <Sparkles size={15} className="text-primary" /> Your Instagram Bios
          </h2>

          {bios.map((item, index) => (
            <div key={item.style}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{item.style}</span>
                <div className="flex items-center gap-3">
                  <span className={`text-xs ${item.bio.length > 150 ? "text-red-500 font-semibold" : "text-muted-foreground"}`}>
                    {item.bio.length}/150
                  </span>
                  <button
                    onClick={() => void copy(item.bio, index)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copiedIndex === index ? <><Check size={11} className="text-green-600" /> Copied</> : <><Copy size={11} /> Copy</>}
                  </button>
                </div>
              </div>
              <div className="bg-secondary/40 rounded-xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed">
                {item.bio}
              </div>
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
        headerText="Got your bio? Now grow the profile behind it."
        subText="Paste a YouTube video URL, ShortPurify cuts your long video into viral short clips, adds captions, and publishes directly to Instagram Reels in minutes."
      />
    </main>
  );
}
