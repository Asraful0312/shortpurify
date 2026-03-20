"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import SingleVideoUploader from "@/components/upload-dropzone";
import { ChevronDown, ChevronUp } from "lucide-react";

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

export default function UploadPage() {
  const router = useRouter();
  const createProject = useMutation(api.projects.createProjectAndStart);

  const [title, setTitle] = useState("");
  const [showPlatforms, setShowPlatforms] = useState(false);
  const [enabledPlatforms, setEnabledPlatforms] = useState<string[]>(
    ALL_PLATFORMS.map((p) => p.id),
  );

  const togglePlatform = (id: string) => {
    setEnabledPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const handleUploadComplete = async (url: string, size: number, fileName: string) => {
    // Use typed title, fall back to cleaned filename (strip extension + underscores)
    const fromFile = fileName.replace(/\.[^/.]+$/, "").replace(/[_-]+/g, " ").trim();
    const finalTitle = title.trim() || fromFile || "Untitled Project";
    const projectId = await createProject({
      title: finalTitle,
      originalUrl: url,
      originalSize: size,
      enabledPlatforms: enabledPlatforms.length > 0 ? enabledPlatforms : ALL_PLATFORMS.map((p) => p.id),
    });
    router.push(`/dashboard/${projectId}`);
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
          Drop your raw video and let AI extract the most viral moments automatically.
        </p>
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
          placeholder="e.g. Podcast Ep #45 – React 19 Deep Dive"
          maxLength={120}
          className="w-full border border-border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white placeholder:text-muted-foreground"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Leave blank to use the filename automatically.
        </p>
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

      {/* Dropzone */}
      <div className="relative z-10 w-full max-w-2xl">
        <SingleVideoUploader onUploadComplete={handleUploadComplete} />
      </div>

      {/* Decorative blurs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-accent/5 rounded-full blur-[100px]" />
      </div>
    </div>
  );
}
