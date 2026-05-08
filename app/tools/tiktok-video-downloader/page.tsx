"use client";

import { useState } from "react";
import { Download, Link as LinkIcon, AlertCircle, CheckCircle2, Video, Image as ImageIcon, Loader2, Zap } from "lucide-react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import ToolsBreadcrumb from "@/components/tools-breadcrumb";
import ToolsCta from "@/components/tools-cta";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

function getClientId() {
  if (typeof window === "undefined") return "ssr";
  let id = localStorage.getItem("sp_tool_client_id");
  if (!id) { id = crypto.randomUUID(); localStorage.setItem("sp_tool_client_id", id); }
  return id;
}

export default function TikTokVideoDownloader() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ url?: string; images?: string[]; type?: string } | null>(null);
  const [error, setError] = useState("");
  
  const extractVideo = useAction(api.toolsActions.extractTikTokVideo);

  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    setResult(null);
    setError("");

    try {
      const res = await extractVideo({ url: url.trim(), clientId: getClientId() });
      setResult(res);
      toast.success("Extraction successful!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to extract video. Please check the URL.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <main className="max-w-4xl mx-auto px-4 py-14">
        <ToolsBreadcrumb toolName="TikTok Video Downloader" toolHref="/tools/tiktok-video-downloader" />
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-pink-50 text-pink-600 border border-pink-100 px-3 py-1 rounded-full text-xs font-semibold mb-4">
             <Image src="/icons/tik-tok.png" alt="TikTok" width={14} height={14} className="object-contain" /> Free Tool
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3 italic">
            TikTok Video Download Helper
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Paste a public TikTok link and we&apos;ll try to fetch a downloadable file. This free helper depends on public extraction services, so some links may fail.
          </p>
        </div>

        {/* Downloader Card */}
        <div className="bg-white border border-border rounded-[2.5rem] p-8 shadow-sm mb-12 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
          
          <form onSubmit={handleExtract} className="relative flex flex-col gap-6">
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase tracking-wider">
                <LinkIcon size={16} className="text-primary" /> Paste TikTok Link
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.tiktok.com/@user/video/..."
                  className="flex-1 bg-secondary/30 border border-border rounded-2xl px-6 py-4 font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <button
                  type="submit"
                  disabled={isLoading || !url.trim()}
                  className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-lg shadow-primary/20"
                >
                  {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
                  {isLoading ? "Checking..." : "Try Download"}
                </button>
              </div>
            </div>

            {/* Results */}
            {error && (
              <div className="mt-4 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {result && (
              <div className="mt-4 p-6 bg-secondary/20 rounded-3xl border border-dashed border-border animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col items-center text-center gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                    {result.type === "gallery" ? <ImageIcon size={40} className="text-primary" /> : <Video size={40} className="text-primary" />}
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-xl font-black">Download link found</h3>
                    <p className="text-sm text-muted-foreground">A public extraction service returned a downloadable file for this TikTok link.</p>
                  </div>

                  {result.url && (
                    <a 
                      href={result.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto bg-emerald-600 text-white px-10 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                    >
                      <Download size={20} /> Download MP4
                    </a>
                  )}

                  {result.images && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full">
                      {result.images.map((img, idx) => (
                        <a key={idx} href={img} target="_blank" rel="noopener noreferrer" className="relative group overflow-hidden rounded-xl bg-white border border-border aspect-square">
                          <Image src={img} alt={`Gallery ${idx}`} fill sizes="(min-width: 640px) 33vw, 50vw" className="object-cover group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Download size={20} className="text-white" />
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white border border-border rounded-3xl p-8 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600 mb-6">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="font-extrabold text-lg mb-3">Best-Effort Download</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We try free public extraction services first. If they are down, rate-limited, or blocked, the page explains what happened.
            </p>
          </div>
          <div className="bg-white border border-border rounded-3xl p-8 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-6">
              <Video size={24} />
            </div>
            <h3 className="font-extrabold text-lg mb-3">Public Links Only</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Private, deleted, region-blocked, age-restricted, or unsupported videos may not work with any free downloader.
            </p>
          </div>
          <div className="bg-white border border-border rounded-3xl p-8 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 mb-6">
              <Zap size={24} />
            </div>
            <h3 className="font-extrabold text-lg mb-3">Free With Limits</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              No account required, but free extraction can be unstable. For saving your own videos, TikTok&apos;s built-in save/share options are the safest fallback.
            </p>
          </div>
        </div>

        <div className="mt-12">
          <ToolsCta 
            headerText="Ready to dominate Short Form Video?"
            subText="ShortPurify doesn't just download videos — it helps you automate your entire content workflow. Turn YouTube videos into TikToks, Reels, and Shorts in minutes."
          />
        </div>

        {/* SEO Content */}
        <div className="prose prose-sm max-w-none text-muted-foreground border-t border-border pt-12">
          <h2 className="text-foreground font-extrabold text-2xl">How to try downloading a TikTok video</h2>
          <p>TikTok download tools can be unreliable because public extraction services go offline, get rate-limited, or lose support for TikTok changes. This helper is free and best-effort: it works when the link is public and an available extractor can process it.</p>
          
          <h3 className="text-foreground font-bold text-lg mt-8">Simple steps to save TikTok videos to MP4:</h3>
          <ol>
            <li><strong>Copy Link:</strong> Find the TikTok video you want to download, click the &quot;Share&quot; button, and select &quot;Copy Link&quot;.</li>
            <li><strong>Paste URL:</strong> Open ShortPurify&apos;s TikTok Downloader and paste the link into the input box above.</li>
            <li><strong>Try Download:</strong> Click the button. If a free extractor can process the link, you&apos;ll get a downloadable file.</li>
          </ol>

          <h3 className="text-foreground font-bold text-lg mt-8">What to do if download fails</h3>
          <p>If this free helper cannot extract your TikTok link, it usually means the public extraction service is unavailable or TikTok blocked that request. You can still try:</p>
          <ul>
            <li><strong>Use TikTok&apos;s own save option:</strong> Open the video, tap Share, then Save video when available.</li>
            <li><strong>Check the link:</strong> Make sure the video is public, still online, and not region-blocked.</li>
            <li><strong>Try later:</strong> Free extraction services often recover after rate limits or temporary outages.</li>
          </ul>

          <div className="bg-secondary/30 rounded-2xl p-6 mt-10">
            <h3 className="text-foreground font-bold text-lg mb-4 mt-0">More Viral Creator Tools</h3>
            <ul className="grid sm:grid-cols-2 gap-4 list-none p-0 m-0">
              <li><Link href="/tools/tiktok-caption-generator" className="text-primary font-bold hover:underline">TikTok Caption Generator →</Link></li>
              <li><Link href="/tools/best-time-to-post-on-tiktok" className="text-primary font-bold hover:underline">Best Time to Post (2025) →</Link></li>
              <li><Link href="/tools/hashtag-generator" className="text-primary font-bold hover:underline">Viral Hashtag Generator →</Link></li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
