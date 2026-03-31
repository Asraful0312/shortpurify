"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useWorkspace } from "@/components/workspace-context";
import SingleVideoUploader from "@/components/upload-dropzone";
import { ChevronDown, ChevronUp, Upload, LucideYoutube, Loader2, AlertCircle, Crop, Layers, Play, X } from "lucide-react";
import { cn, friendlyError } from "@/lib/utils";
import Image from "next/image";

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
  const { activeOrgId } = useWorkspace();
  const createProject = useMutation(api.projects.createProjectAndStart);
  const importFromYouTube = useAction(api.youtubeActions.createProjectFromYouTube);
  const usageData = useQuery(api.usage.getUsage, { workspaceId: activeOrgId ?? undefined });

  const [tab, setTab] = useState<Tab>("youtube");
  const [title, setTitle] = useState("");
  const [showPlatforms, setShowPlatforms] = useState(false);
  const [enabledPlatforms, setEnabledPlatforms] = useState<string[]>(
    ALL_PLATFORMS.map((p) => p.id),
  );
  const [cropMode, setCropMode] = useState<"smart_crop" | "blur_background">("smart_crop");
  const [previewMode, setPreviewMode] = useState<"smart_crop" | "blur_background" | null>(null);

  // YouTube-specific state
  const [youtubeUrl, setLucideYoutubeUrl] = useState("");
  const [ytLoading, setYtLoading] = useState(false);
  const [ytError, setYtError] = useState("");

  // File upload error state
  const [uploadError, setUploadError] = useState("");

  // Duration detected from selected file (browser reads this before upload)
  const [fileDurationMinutes, setFileDurationMinutes] = useState<number | undefined>(undefined);

  const togglePlatform = (id: string) => {
    setEnabledPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const handleUploadComplete = async (url: string, size: number, fileName: string, key: string) => {
    setUploadError("");
    const fromFile = fileName.replace(/\.[^/.]+$/, "").replace(/[_-]+/g, " ").trim();
    const finalTitle = title.trim() || fromFile || "Untitled Project";
    try {
      const projectId = await createProject({
        title: finalTitle,
        originalUrl: url,
        originalSize: size,
        originalKey: key,
        enabledPlatforms: enabledPlatforms.length > 0 ? enabledPlatforms : ALL_PLATFORMS.map((p) => p.id),
        cropMode,
        workspaceId: activeOrgId ?? undefined,
        estimatedDurationMinutes: fileDurationMinutes,
      });
      router.push(`/dashboard/${projectId}`);
    } catch (err: unknown) {
      setUploadError(friendlyError(err));
    }
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
        cropMode,
        workspaceId: activeOrgId ?? undefined,
      });
      router.push(`/dashboard/${projectId}`);
    } catch (err: unknown) {
      setYtError(friendlyError(err));
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
            onClick={() => setTab("youtube")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all",
              tab === "youtube"
                ? "bg-white shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Image src="/icons/youtube.png" alt="youtube" width={15} height={15}/>
            YouTube URL
          </button>
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
        </div>
      </div>

      {/* Title input */}
      {/* <div className="relative z-10 w-full max-w-2xl mb-4">
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
      </div> */}

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

      {/* Crop mode selector */}
      <div className="relative z-10 w-full max-w-2xl mb-4">
        <p className="text-sm font-bold text-foreground mb-2">Video Format</p>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {([
            {
              value: "smart_crop",
              icon: <Crop size={18} />,
              label: "Smart Crop",
              desc: "AI follows the speaker best for talking-head content",
            },
            {
              value: "blur_background",
              icon: <Layers size={18} />,
              label: "Blur Background",
              desc: "Full frame centered on blurred background nothing gets cut",
            },
          ] as const).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setCropMode(opt.value)}
              className={cn(
                "relative flex flex-col items-start gap-1.5 p-3.5 rounded-xl border-2 text-left transition-all",
                cropMode === opt.value
                  ? "border-primary bg-primary/5"
                  : "border-border bg-white hover:border-primary/30",
              )}
            >
              <span className={cn("p-1.5 rounded-lg", cropMode === opt.value ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground")}>
                {opt.icon}
              </span>
              <span className="font-bold text-sm">{opt.label}</span>
              <span className="text-xs text-muted-foreground leading-snug">{opt.desc}</span>
              <span
                role="button"
                onClick={(e) => { e.stopPropagation(); setPreviewMode(opt.value); }}
                className="absolute top-2.5 right-2.5 flex items-center gap-1 text-[10px] font-semibold text-muted-foreground hover:text-primary transition-colors bg-secondary hover:bg-primary/10 px-2 py-1 rounded-full"
              >
                <Play size={9} className="fill-current" />
                Preview
              </span>
            </button>
          ))}
        </div>

 
      </div>

      {/* Tab content */}
      <div className="relative z-10 w-full max-w-2xl">
        {tab === "file" ? (
          <div className="flex flex-col gap-3">
            <SingleVideoUploader
              onUploadComplete={handleUploadComplete}
              disabled={
                // Block upload if project count already at limit
                usageData != null &&
                usageData.limits.projects != null &&
                usageData.usage.projectsUsed >= usageData.limits.projects
              }
              onFileSelected={(file) => {
                setUploadError("");
                setFileDurationMinutes(undefined);

                // Check project count limit immediately
                if (
                  usageData?.limits.projects != null &&
                  usageData.usage.projectsUsed >= usageData.limits.projects
                ) {
                  setUploadError(
                    `You've used all ${usageData.limits.projects} projects this month on the ${usageData.tier === "starter" ? "Free" : usageData.tier} plan.`
                  );
                  return false; // cancel upload
                }

                // Read video duration from browser metadata before upload starts
                const video = document.createElement("video");
                video.preload = "metadata";
                video.onloadedmetadata = () => {
                  URL.revokeObjectURL(video.src);
                  if (!isFinite(video.duration)) return;

                  const durationMins = Math.ceil(video.duration / 60);
                  setFileDurationMinutes(durationMins);

                  // Check minute limit upfront — block before wasting bandwidth
                  if (usageData) {
                    const remaining = usageData.limits.minutes - usageData.usage.minutesUsed;
                    if (durationMins > remaining) {
                      setUploadError(
                        remaining <= 0
                          ? `You've used all ${usageData.limits.minutes} video minutes this month. Upgrade or wait until next month.`
                          : `This video is ~${durationMins} min but you only have ${remaining} min left this month. Upgrade for more.`
                      );
                    }
                  }
                };
                video.src = URL.createObjectURL(file);
              }}
            />
            {uploadError && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700">
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-semibold">{uploadError}</p>
                  <a href="/dashboard/billing" className="text-xs font-bold underline mt-0.5 inline-block">
                    Upgrade plan →
                  </a>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white border border-border rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                  <Image src="/icons/youtube.png" alt="youtube" width={18} height={18}/>
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
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
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
              Works with videos, Shorts, and unlisted videos. The video is processed directly nothing is stored on our servers.
            </p>
          </div>
        )}

      </div>

      {/* Video preview modal */}
      {previewMode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setPreviewMode(null)}
        >
          <div
            className="relative rounded-2xl overflow-hidden bg-black shadow-2xl w-full max-w-[320px] aspect-9/16"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              key={previewMode}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            >
              <source src={previewMode === "smart_crop" ? "/video/smart-crop-demo.mp4" : "/video/blur-background-demo.mp4"} type="video/mp4" />
            </video>
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                {previewMode === "smart_crop" ? "Smart Crop" : "Blur Background"} Example
              </span>
            </div>
            <button
              onClick={() => setPreviewMode(null)}
              className="absolute top-3 right-3 flex items-center justify-center w-7 h-7 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white hover:bg-black/80 transition-colors"
            >
              <X size={14} />
            </button>
            <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent pointer-events-none" />
          </div>
        </div>
      )}

      {/* Decorative blurs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-accent/5 rounded-full blur-[100px]" />
      </div>
    </div>
  );
}
