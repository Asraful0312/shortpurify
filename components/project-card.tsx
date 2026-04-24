"use client";

import Link from "next/link";
import { Video, Clock, CheckCircle2, AlertCircle, Loader2, Sparkles, Play, ScanSearch } from "lucide-react";
import { cn } from "@/lib/utils";
import { TextShimmerWave } from "./motion-primitives/text-shimmer-wave";
import { TextShimmer } from "./motion-primitives/text-shimmer";
import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export type ProjectStatus = "uploading" | "processing" | "awaiting_review" | "complete" | "failed";

export interface ProjectCardProps {
  id: string;
  title: string;
  status: ProjectStatus;
  createdAt: number;
  thumbnailUrl?: string;
  clipsCount?: number;
}

const statusConfig = {
  uploading: {
    icon: Loader2,
    className: "bg-blue-100 text-blue-700 border-blue-200",
    text: "Uploading",
    spin: true
  },
  processing: {
    icon: Sparkles,
    className: "bg-amber-100 text-amber-700 border-amber-200 animate-pulse",
    text: "AI Processing",
    spin: false
  },
  awaiting_review: {
    icon: ScanSearch,
    className: "bg-violet-100 text-violet-700 border-violet-200",
    text: "Awaiting Review",
    spin: false
  },
  complete: {
    icon: CheckCircle2,
    className: "bg-green-100 text-green-700 border-green-200",
    text: "Ready",
    spin: false
  },
  failed: {
    icon: AlertCircle,
    className: "bg-red-100 text-red-700 border-red-200",
    text: "Failed",
    spin: false
  }
};

export function ProjectCard({ project }: { project: ProjectCardProps }) {
  const config = statusConfig[project.status];
  const Icon = config.icon;
  const [thumbSrc, setThumbSrc] = useState(project.thumbnailUrl);
  const [thumbFailed, setThumbFailed] = useState(false);
  const refreshThumbnail = useAction(api.r2Actions.refreshProjectThumbnail);

  async function handleThumbError() {
    if (thumbFailed || !project.id) return;
    setThumbFailed(true);
    try {
      const fresh = await refreshThumbnail({ projectId: project.id as Id<"projects"> });
      if (fresh) { setThumbSrc(fresh); setThumbFailed(false); }
    } catch { /* no key available — show placeholder */ }
  }

  const dateStr = new Date(project.createdAt).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute:"2-digit"
  });

  return (
    <Link href={`/dashboard/${project.id}`} className="group block h-full">
      <div className="bg-white rounded-[1.5rem] border border-border overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/30 flex flex-col h-full">
        {/* Thumbnail Area */}
        <div className="relative aspect-video bg-secondary flex items-center justify-center overflow-hidden">
          {thumbSrc && !thumbFailed ? (
            <img src={thumbSrc} alt={project.title} onError={handleThumbError} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
             <div className="w-full h-full bg-linear-to-tr from-secondary/80 to-secondary flex flex-col items-center justify-center text-muted-foreground transition-transform duration-500 group-hover:scale-105">
               <Video size={36} className="opacity-40 mb-2" />
               <span className="text-xs font-semibold uppercase tracking-wider opacity-60">No Thumbnail</span>
             </div>
          )}
          
          <div className="absolute inset-0 bg-black/10 transition-opacity opacity-0 group-hover:opacity-100 flex items-center justify-center backdrop-blur-[2px]">
             <div className="w-12 h-12 rounded-full bg-white text-primary flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-all duration-300">
                <Play size={20} className="ml-1" fill="currentColor" />
             </div>
          </div>

   

            {config.text === "AI Processing" ? (
          <div className={cn("absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold border flex bg-amber-100 items-center gap-1.5 shadow-sm backdrop-blur-md",)}>
              <TextShimmer>Processing...</TextShimmer>
          </div>
            ) : config.text === "Uploading" ? (
                <div className={cn("absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold border flex bg-blue-100 items-center gap-1.5 shadow-sm backdrop-blur-md",)}>
              <TextShimmer>Uploading...</TextShimmer>
          </div>
            ) : config.text === "Awaiting Review" ? (
                <div className={cn("absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 shadow-sm backdrop-blur-md bg-violet-100 text-violet-700 border-violet-200")}>
            <ScanSearch size={12} />
            Review clips
          </div>
            ) :  config.text === "Ready" ?(
                 <div className={cn("absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 shadow-sm backdrop-blur-md bg-green-700 text-white border-green-800")}>
            <CheckCircle2 size={12} />
            Ready
          </div>
            ) : (
                 <div className={cn("absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 shadow-sm backdrop-blur-md bg-red-100 text-red-700 border-red-200")}>
            <AlertCircle size={12} />
            Failed
          </div>
            )}
        </div>

        {/* Content Area */}
        <div className="p-5 flex-1 flex flex-col">
          <h3 className="font-bold text-foreground text-lg mb-1 line-clamp-1 group-hover:text-primary transition-colors">{project.title}</h3>
          
          <div className="flex items-center justify-between mt-auto pt-4 text-xs text-muted-foreground font-medium">
             <div className="flex items-center gap-1.5">
               <Clock size={14} />
               <span>{dateStr}</span>
             </div>
             {project.status === "complete" && project.clipsCount && (
                <div className="bg-secondary px-2 py-1.5 rounded-md text-foreground/80 font-bold border border-border/80 shadow-sm">
                  {project.clipsCount} clips
                </div>
             )}
          </div>
        </div>
      </div>
    </Link>
  );
}
