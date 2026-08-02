"use client";

import { useState } from "react";
import { Download, Link as LinkIcon, AlertCircle, CheckCircle2, Video, Image as ImageIcon, Loader2, Zap } from "lucide-react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import ToolsBreadcrumb from "@/components/tools-breadcrumb";
import ToolsCta from "@/components/tools-cta";
import Image from "next/image";
import { toast } from "sonner";
import { getToolError } from "@/lib/getToolError";
import { forceDownload, downloadBlob } from "@/lib/forceDownload";
import { useColdStartRetry } from "@/hooks/useColdStartRetry";
import { useVideoPreview } from "@/hooks/useVideoPreview";

function getClientId() {
  if (typeof window === "undefined") return "ssr";
  let id = localStorage.getItem("sp_tool_client_id");
  if (!id) { id = crypto.randomUUID(); localStorage.setItem("sp_tool_client_id", id); }
  return id;
}

export default function FacebookVideoDownloadHelper() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ url?: string; images?: string[]; type?: string } | null>(null);
  const [error, setError] = useState("");
  const [downloadingIndex, setDownloadingIndex] = useState<number | "main" | null>(null);

  const extractVideo = useAction(api.toolsActions.extractFacebookVideo);
  const preview = useVideoPreview(result?.type !== "gallery" ? result?.url : undefined);

  const runExtract = async () => {
    if (!url.trim()) return;

    setIsLoading(true);
    setResult(null);
    setError("");

    try {
      const res = await extractVideo({ url: url.trim(), clientId: getClientId() });
      setResult(res);
      toast.success("Extraction successful!");
    } catch (err: unknown) {
      const message = getToolError(err);
      setError(message);
      toast.error(message);
      if (/temporarily unavailable/i.test(message)) coldStart.start();
    } finally {
      setIsLoading(false);
    }
  };

  const coldStart = useColdStartRetry(() => void runExtract());

  const handleExtract = (e: React.FormEvent) => {
    e.preventDefault();
    void runExtract();
  };

  const handleDownload = async (fileUrl: string, filename: string, key: number | "main") => {
    setDownloadingIndex(key);
    if (key === "main" && preview.blob) {
      downloadBlob(preview.blob, filename);
      setDownloadingIndex(null);
      return;
    }
    const ok = await forceDownload(fileUrl, filename);
    if (!ok) {
      window.open(fileUrl, "_blank", "noopener,noreferrer");
      toast.error("Direct download was blocked — opened the file in a new tab instead. Right-click it to save.");
    }
    setDownloadingIndex(null);
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-14">
        <ToolsBreadcrumb toolName="Facebook Video Download Helper" toolHref="/tools/facebook-video-downloader" />

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1 rounded-full text-xs font-semibold mb-4">
             <Image src="/icons/facebook.png" alt="Facebook" width={14} height={14} className="object-contain" /> Free Tool
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3 italic">
            Facebook Video Download Helper
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Paste a public Facebook video, Reel, or Watch link and we&apos;ll try to fetch a downloadable file. This free helper depends on public extraction services, so some links may fail.
          </p>
        </div>

        {/* Downloader Card */}
        <div className="bg-white border border-border rounded-[2.5rem] p-8 shadow-sm mb-12 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />

          <form onSubmit={handleExtract} className="relative flex flex-col gap-6">
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase tracking-wider">
                <LinkIcon size={16} className="text-primary" /> Paste Facebook Link
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.facebook.com/watch/?v=..."
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
            {coldStart.isWaking ? (
              <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
                <Loader2 size={18} className="mt-0.5 shrink-0 animate-spin" />
                <div>
                  <p className="font-semibold">The extractor is waking up from idle — this can take a bit on the free tier.</p>
                  <p>Automatically retrying in {coldStart.secondsLeft}s…</p>
                </div>
              </div>
            ) : error && (
              <div className="mt-4 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {result && (
              <div className="mt-4 p-6 bg-secondary/20 rounded-3xl border border-dashed border-border animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col items-center text-center gap-6">
                  {result.url && result.type !== "gallery" ? (
                    preview.previewUrl ? (
                      <video src={preview.previewUrl} controls playsInline className="w-full max-w-sm rounded-2xl bg-black" />
                    ) : preview.failed ? (
                      <div className="w-full max-w-sm rounded-2xl bg-secondary/40 border border-border flex flex-col items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
                        <Video size={32} />
                        <p>Preview unavailable, but the download below should still work.</p>
                      </div>
                    ) : (
                      <div className="w-full max-w-sm rounded-2xl bg-secondary/40 border border-border flex items-center justify-center py-16">
                        <Loader2 size={28} className="animate-spin text-muted-foreground" />
                      </div>
                    )
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                      <ImageIcon size={40} className="text-primary" />
                    </div>
                  )}

                  <div className="space-y-2">
                    <h3 className="text-xl font-black">Download link found</h3>
                    <p className="text-sm text-muted-foreground">A public extraction service returned a downloadable file for this Facebook link.</p>
                  </div>

                  {result.url && (
                    <button
                      onClick={() => void handleDownload(result.url!, "facebook-video.mp4", "main")}
                      disabled={downloadingIndex === "main"}
                      className="w-full sm:w-auto bg-emerald-600 text-white px-10 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 disabled:opacity-60"
                    >
                      {downloadingIndex === "main" ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
                      {downloadingIndex === "main" ? "Downloading…" : "Download MP4"}
                    </button>
                  )}

                  {result.images && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full">
                      {result.images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => void handleDownload(img, `facebook-image-${idx + 1}.jpg`, idx)}
                          disabled={downloadingIndex === idx}
                          className="relative group overflow-hidden rounded-xl bg-white border border-border aspect-square"
                        >
                          <Image src={img} alt={`Gallery ${idx}`} fill sizes="(min-width: 640px) 33vw, 50vw" className="object-cover group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            {downloadingIndex === idx ? <Loader2 size={20} className="text-white animate-spin" /> : <Download size={20} className="text-white" />}
                          </div>
                        </button>
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
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-6">
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
              Private, deleted, or unsupported videos and Reels may not work with any free downloader.
            </p>
          </div>
          <div className="bg-white border border-border rounded-3xl p-8 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 mb-6">
              <Zap size={24} />
            </div>
            <h3 className="font-extrabold text-lg mb-3">Free With Limits</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              No account required, but free extraction can be unstable. For saving your own videos, Facebook&apos;s built-in save/share options are the safest fallback.
            </p>
          </div>
        </div>

        <div className="mt-12">
          <ToolsCta
            headerText="Ready to dominate Short Form Video?"
            subText="ShortPurify doesn't just download videos — it helps you automate your entire content workflow. Turn YouTube videos into TikToks, Reels, and Shorts in minutes."
          />
        </div>

      </main>
  );
}
