"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import SingleVideoUploader from "@/components/upload-dropzone";
import { ChevronDown, ChevronUp, Upload, LucideYoutube, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const ALL_PLATFORMS = [
  { id: "tiktok",    label: "TikTok" },
  { id: "instagram", label: "Instagram Reels" },
  { id: "youtube",   label: "YouTube Shorts" },
  { id: "x",         label: "X / Twitter" },
  { id: "threads",   label: "Threads" },
  { id: "linkedin",  label: "LinkedIn" },
  { id: "snapchat",  label: "Snapchat" },
  { id: "blog",      label: "Blog Excerpt" },
];

type Tab = "file" | "youtube";

export default function UploadPage() {
  const router = useRouter();
  const createProject = useMutation(api.projects.createProjectAndStart);
  const importFromYouTube = useAction(api.youtubeActions.createProjectFromYouTube);

  const [tab, setTab] = useState<Tab>("file");
  const [title, setTitle] = useState("");
  const [showPlatforms, setShowPlatforms] = useState(false);
  const [enabledPlatforms, setEnabledPlatforms] = useState<string[]>(
    ALL_PLATFORMS.map((p) => p.id),
  );

  // YouTube-specific state
  const [youtubeUrl, setLucideYoutubeUrl] = useState("");
  const [ytLoading, setYtLoading] = useState(false);
  const [ytError, setYtError] = useState("");

  const togglePlatform = (id: string) => {
    setEnabledPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const handleUploadComplete = async (url: string, size: number, fileName: string, key: string) => {
    const fromFile = fileName.replace(/\.[^/.]+$/, "").replace(/[_-]+/g, " ").trim();
    const finalTitle = title.trim() || fromFile || "Untitled Project";
    const projectId = await createProject({
      title: finalTitle,
      originalUrl: url,
      originalSize: size,
      originalKey: key,
      enabledPlatforms: enabledPlatforms.length > 0 ? enabledPlatforms : ALL_PLATFORMS.map((p) => p.id),
    });
    router.push(`/dashboard/${projectId}`);
  };

  const handleYouTubeImport = async () => {
    setYtError("");
    const url = youtubeUrl.trim();
    if (!url) { setYtError("Paste a YouTube URL first."); return; }

    setYtLoading(true);
    try {
      const { projectId } = await importFromYouTube({
        youtubeUrl: url,
        title: title.trim() || undefined,
        enabledPlatforms: enabledPlatforms.length > 0 ? enabledPlatforms : ALL_PLATFORMS.map((p) => p.id),
      });
      router.push(`/dashboard/${projectId}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setYtError(msg);
      setYtLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 w-full min-h-screen flex flex-col items-center justify-center pb-32">
      {/* Header */}
      <div className="mb-10 text-center relative z-10 w-full max-w-2xl">
        <span className="bg-accent/10 border border-accent/20 text-accent font-bold px-4 py-1.5 rounded-full text-xs uppercase tracking-wider mb-5 inline-block">
          Step 1
        </span>
        <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 text-foreground">
          Create New Project
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
          Drop your raw video or import directly from YouTube.
        </p>
      </div>

      {/* Source tabs */}
      <div className="relative z-10 w-full max-w-2xl mb-6">
        <div className="flex rounded-xl border border-border bg-secondary/30 p-1 gap-1">
          <button
            type="button"
            onClick={() => setTab("file")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all",
              tab === "file"
                ? "bg-white shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Upload size={15} />
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setTab("youtube")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all",
              tab === "youtube"
                ? "bg-white shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <LucideYoutube size={15} className="text-red-500" />
            YouTube URL
          </button>
        </div>
      </div>

      {/* Title input */}
      <div className="relative z-10 w-full max-w-2xl mb-4">
        <label className="block text-sm font-bold text-foreground mb-1.5">
          Project Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={tab === "youtube" ? "Leave blank to use the video title" : "e.g. Podcast Ep #45 – React 19 Deep Dive"}
          maxLength={120}
          className="w-full border border-border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white placeholder:text-muted-foreground"
        />
      </div>

      {/* Platform toggles */}
      <div className="relative z-10 w-full max-w-2xl mb-4">
        <button
          type="button"
          onClick={() => setShowPlatforms((v) => !v)}
          className="flex items-center justify-between w-full bg-white border border-border rounded-xl px-4 py-3 text-sm font-semibold hover:bg-secondary/40 transition-colors"
        >
          <span>
            Caption platforms
            <span className="ml-2 text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              {enabledPlatforms.length} / {ALL_PLATFORMS.length} selected
            </span>
          </span>
          {showPlatforms ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showPlatforms && (
          <div className="mt-2 bg-white border border-border rounded-xl p-4 grid grid-cols-2 gap-2 shadow-sm">
            {ALL_PLATFORMS.map((p) => (
              <label
                key={p.id}
                className="flex items-center gap-2.5 cursor-pointer select-none group"
              >
                <input
                  type="checkbox"
                  checked={enabledPlatforms.includes(p.id)}
                  onChange={() => togglePlatform(p.id)}
                  className="w-4 h-4 accent-primary rounded"
                />
                <span className="text-sm font-medium group-hover:text-primary transition-colors">
                  {p.label}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Tab content */}
      <div className="relative z-10 w-full max-w-2xl">
        {tab === "file" ? (
          <SingleVideoUploader onUploadComplete={handleUploadComplete} />
        ) : (
          <div className="bg-white border border-border rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                <LucideYoutube size={18} className="text-red-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Import from YouTube</p>
                <p className="text-xs text-muted-foreground">Paste any YouTube video or Shorts URL</p>
              </div>
            </div>

            <input
              type="url"
              value={youtubeUrl}
              onChange={(e) => { setLucideYoutubeUrl(e.target.value); setYtError(""); }}
              onKeyDown={(e) => e.key === "Enter" && !ytLoading && handleYouTubeImport()}
              placeholder="https://www.youtube.com/watch?v=..."
              disabled={ytLoading}
              className="w-full border border-border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white placeholder:text-muted-foreground disabled:opacity-50"
            />

            {ytError && (
              <div className="flex items-start gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
                <p className="text-xs font-medium">{ytError}</p>
              </div>
            )}

            <button
              type="button"
              onClick={handleYouTubeImport}
              disabled={ytLoading || !youtubeUrl.trim()}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-bold py-3 rounded-xl text-sm transition-colors"
            >
              {ytLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Fetching video info…
                </>
              ) : (
                <>
                  <LucideYoutube size={16} />
                  Import & Create Clips
                </>
              )}
            </button>

            <p className="text-center text-xs text-muted-foreground">
              Works with videos, Shorts, and unlisted videos. The video is processed directly — nothing is stored on our servers.
            </p>
          </div>
        )}
      </div>

      {/* Decorative blurs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-accent/5 rounded-full blur-[100px]" />
      </div>
    </div>
  );
}
