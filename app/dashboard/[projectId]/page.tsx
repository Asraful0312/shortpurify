"use client";

import { ProcessingStatus } from "@/components/dashboard/processing-status";
import DeleteProjectDialog from "@/components/dashboard/project/delete-project-dialog";
import MultiPlatformCaptionCard from "@/components/dashboard/project/multi-platform-caption-card";
import TranscriptViewer from "@/components/dashboard/project/transcript-viewer";
import { OutputPreview } from "@/components/output-preview";
import { DEFAULT_SUBTITLE_SETTINGS } from "@/components/subtitle-overlay";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWorkspace } from "@/components/workspace-context";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { downloadAllAsZip } from "@/lib/download";
import { formatDuration, friendlyError, getProcessingSteps, timeAgo } from "@/lib/utils";
import { useAction, useMutation, useQuery } from "convex/react";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Clock,
  DownloadCloud,
  FileText,
  Loader2,
  Pencil,
  Trash2,
  X
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";



export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as Id<"projects">;
  const [zipDownloading, setZipDownloading] = useState(false);
  const [zipProgress, setZipProgress] = useState({ done: 0, total: 0 });
  const [zipSubtitleWarning, setZipSubtitleWarning] = useState<string | null>(null);
  const [zipBurnLimitError, setZipBurnLimitError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Rename state
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [renameError, setRenameError] = useState("");
  const [renameSaving, setRenameSaving] = useState(false);

  const { myRole, activeOrgId } = useWorkspace();
  const canRename = myRole === "owner" || myRole === "admin" || myRole === null; // null = personal workspace

  const project = useQuery(api.projects.getProject, { projectId });
  const outputs = useQuery(api.outputs.listProjectOutputs, { projectId });
  const usage = useQuery(api.usage.getUsage, { workspaceId: activeOrgId ?? undefined });
  const exportWithSubtitles = useAction(api.exportActions.exportWithSubtitles);
  const deleteProject = useAction(api.projects.deleteProject);
  const renameProject = useMutation(api.projects.renameProject);

  const canZip = usage?.limits.zipExport ?? false;

  function startRename() {
    setRenameValue(project?.title ?? "");
    setRenameError("");
    setRenaming(true);
  }

  async function commitRename() {
    if (!renameValue.trim() || renameValue.trim() === project?.title) {
      setRenaming(false);
      return;
    }
    setRenameSaving(true);
    setRenameError("");
    try {
      await renameProject({ projectId, title: renameValue.trim() });
      setRenaming(false);
    } catch (e) {
      setRenameError(friendlyError(e, "Failed to rename project"));
    } finally {
      setRenameSaving(false);
    }
  }

 
  if (project === undefined) {
    return (
      <div className="p-6 md:p-10 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-secondary rounded-xl w-40" />
          <div className="h-12 bg-secondary rounded-xl w-2/3" />
          <div className="grid sm:grid-cols-3 gap-6 mt-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-secondary rounded-3xl aspect-9/16" />
            ))}
          </div>
        </div>
      </div>
    );
  }


  if (project === null) {
    return (
      <div className="p-6 md:p-10 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle size={40} className="text-muted-foreground" />
        <h2 className="text-2xl font-bold">Project not found</h2>
        <Link href="/dashboard" className="text-primary font-bold hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const isProcessing = project.status === "processing" || project.status === "uploading";
  const isFailed = project.status === "failed";
  const isComplete = project.status === "complete";

  const statusBadgeVariant =
    isComplete ? "default" : isFailed ? "destructive" : "secondary";

  const statusLabel =
    isComplete ? "Publish Ready" :
    isFailed ? "Failed" :
    project.processingStep ?? "Processing…";

  const hasTranscript = !!project.transcriptText;
  const tabCount = outputs?.length ?? 0;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full min-h-full flex flex-col pb-32">
      {/* Back */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-bold mb-8 transition-colors w-fit bg-white px-4 py-2 rounded-full border border-border shadow-sm"
      >
        <ArrowLeft size={16} /> Back to Projects
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 pb-8 border-b border-border/50">
        <div>
          <div className="flex items-start gap-3 mb-3 flex-wrap">
            <Badge
              variant={statusBadgeVariant}
              className="uppercase tracking-widest text-[10px] font-extrabold px-3 py-1"
            >
              {statusLabel}
            </Badge>
            <div className="text-muted-foreground text-sm font-medium flex items-center gap-1.5">
              <Clock size={14} /> {timeAgo(project.createdAt)}
            </div>
          </div>
          {renaming ? (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitRename();
                    if (e.key === "Escape") setRenaming(false);
                  }}
                  maxLength={120}
                  disabled={renameSaving}
                  className="text-2xl lg:text-3xl font-extrabold tracking-tight bg-transparent border-b-2 border-primary focus:outline-none w-full min-w-0 disabled:opacity-60"
                />
                <button
                  onClick={commitRename}
                  disabled={renameSaving}
                  className="shrink-0 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-1"
                >
                  {renameSaving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                  Save
                </button>
                <button
                  onClick={() => setRenaming(false)}
                  disabled={renameSaving}
                  className="shrink-0 p-1.5 rounded-xl hover:bg-secondary transition-colors disabled:opacity-50"
                >
                  <X size={16} />
                </button>
              </div>
              {renameError && (
                <p className="text-xs text-red-600 font-semibold">{renameError}</p>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 group/rename">
              <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
                {project.title}
              </h1>
              {canRename && (
                <button
                  onClick={startRename}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors opacity-0 group-hover/rename:opacity-100"
                  title="Rename project"
                >
                  <Pencil size={15} />
                </button>
              )}
            </div>
          )}
          <p className="text-muted-foreground mt-2 font-mono text-xs opacity-50">
            {project._id}
          </p>
        </div>
        <button
          onClick={() => setDeleteOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors text-sm font-semibold shrink-0"
        >
          <Trash2 size={15} /> Delete Project
        </button>
        {isComplete && outputs && outputs.length > 0 && !canZip && (
          <a
            href="/dashboard/billing"
            className="bg-foreground/10 text-foreground font-bold px-6 py-3 rounded-full border border-border transition-all hover:-translate-y-1 hover:shadow-md flex items-center gap-2 shrink-0 text-sm"
          >
            <DownloadCloud size={20} /> Download All (.ZIP) — Pro+
          </a>
        )}
        {isComplete && outputs && outputs.length > 0 && canZip && (
          <button
            disabled={zipDownloading}
            onClick={async () => {
              setZipDownloading(true);
              setZipProgress({ done: 0, total: outputs.length });
              setZipSubtitleWarning(null);
              setZipBurnLimitError(null);
              try {
                let subtitleFailCount = 0;
                // Generate subtitle exported URLs concurrently for all clips
                const exportedClips = await Promise.all(
                  outputs.map(async (o) => {
                    const clipStartMs = (o.startTime ?? 0) * 1000;
                    const clipEndMs = (o.endTime ?? Infinity) * 1000;
                    const subtitleWords = (project.transcriptWords ?? [])
                      .filter((w) => w.start >= clipStartMs && w.end <= clipEndMs)
                      .map((w) => ({
                        text: w.text,
                        startMs: w.start - clipStartMs,
                        endMs: w.end - clipStartMs,
                      }));

                    if (subtitleWords.length > 0 && o.clipKey) {
                      try {
                        const { downloadUrl } = await exportWithSubtitles({
                          outputId: o._id,
                          clipKey: o.clipKey,
                          clipTitle: o.title,
                          subtitleWords,
                          settings: project.subtitleSettings ?? DEFAULT_SUBTITLE_SETTINGS,
                        });
                        return { url: downloadUrl, title: o.title };
                      } catch (err) {
                        const msg = err instanceof Error ? err.message : String(err);
                        const clean = msg.match(/Uncaught (?:Convex)?Error:\s*([\s\S]+?)(?:\n\s*at |\n\s*Called by|$)/)?.[1]?.trim() ?? msg;
                        if (clean.includes("re-renders") || clean.includes("Upgrade")) {
                          throw new Error(clean); // abort entire zip — user must upgrade
                        }
                        subtitleFailCount++;
                        console.error(`Failed to burn subtitles for "${o.title}":`, err);
                      }
                    }
                    // Fallback to original clip
                    return { url: o.clipUrl, title: o.title };
                  })
                );
                if (subtitleFailCount > 0) {
                  setZipSubtitleWarning(
                    `Subtitles could not be burned for ${subtitleFailCount} clip${subtitleFailCount !== 1 ? "s" : ""} — downloaded without subtitles. Check browser console for details.`
                  );
                }

                await downloadAllAsZip(
                  exportedClips,
                  project.title,
                  (done, total) => setZipProgress({ done, total }),
                  {
                    projectTitle: project.title,
                    transcriptText: project.transcriptText,
                    transcriptWords: project.transcriptWords,
                    clipsMeta: outputs.map((o, i) => ({
                      index: i + 1,
                      title: o.title,
                      startTime: o.startTime,
                      endTime: o.endTime,
                      duration: o.startTime != null && o.endTime != null
                        ? o.endTime - o.startTime
                        : undefined,
                      viralScore: o.viralScore,
                      caption: o.content,
                      captions: o.captions,
                    })),
                  },
                );
              } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                if (msg.includes("re-renders") || msg.includes("Upgrade")) {
                  setZipBurnLimitError(msg);
                }
              } finally {
                setZipDownloading(false);
              }
            }}
            className="bg-foreground text-background font-bold px-6 py-3 rounded-full shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl active:scale-95 flex items-center gap-2 shrink-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
          >
            {zipDownloading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                {zipProgress.done}/{zipProgress.total} clips…
              </>
            ) : (
              <>
                <DownloadCloud size={20} /> Download All (.ZIP)
              </>
            )}
          </button>
        )}
      </div>

      {/* Burn limit error — upgrade required */}
      {zipBurnLimitError && (
        <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 max-w-xl">
          <AlertCircle size={16} className="text-red-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-800">{zipBurnLimitError}</p>
            <a href="/dashboard/billing" className="text-xs font-bold text-red-700 underline mt-1 inline-block">
              Upgrade your plan →
            </a>
          </div>
          <button onClick={() => setZipBurnLimitError(null)} className="text-red-400 hover:text-red-600 shrink-0">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Subtitle burn warning */}
      {zipSubtitleWarning && (
        <div className="mb-6 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 max-w-xl">
          <AlertCircle size={16} className="text-amber-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">{zipSubtitleWarning}</p>
            <p className="text-xs text-amber-700 mt-1">
              Make sure <code className="font-mono bg-amber-100 px-1 rounded">BURN_SUBTITLES_URL</code> is set in Convex and the Modal worker is deployed.
            </p>
          </div>
          <button onClick={() => setZipSubtitleWarning(null)} className="text-amber-500 hover:text-amber-700 shrink-0">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Processing state */}
      {isProcessing && (
        <div className="mb-10 max-w-lg">
          <ProcessingStatus steps={getProcessingSteps(project.processingStep)} />
          <p className="text-sm text-muted-foreground mt-4 font-medium">
            This usually takes 1-3 minutes. You can close this tab - we will keep processing.
          </p>
        </div>
      )}

      {/* Failed state */}
      {isFailed && (
        <div className="mb-8 flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-5 max-w-lg">
          <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-700">Pipeline failed</p>
            <p className="text-sm text-red-600 mt-1">
              Something went wrong during processing. Please try uploading again.
            </p>
            <Link
              href="/dashboard/upload"
              className="text-sm font-bold text-red-700 underline mt-2 inline-block"
            >
              Try again
            </Link>
          </div>
        </div>
      )}

      {/* Tabs */}
      {(outputs && outputs.length > 0) || hasTranscript ? (
        <Tabs defaultValue="clips">
          <TabsList className="mb-6">
            <TabsTrigger value="clips">
              Clips
              {tabCount > 0 && (
                <span className="ml-1.5 text-xs bg-primary/10 text-primary px-1.5 rounded-full">
                  {tabCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="captions">Captions</TabsTrigger>
            {hasTranscript && (
              <TabsTrigger value="transcript">
                <FileText size={14} className="mr-1.5" />
                Transcript
              </TabsTrigger>
            )}
          </TabsList>

          {/* Clips */}
          <TabsContent value="clips">
            {outputs && outputs.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {outputs.map((clip) => {
                  const clipStartMs = (clip.startTime ?? 0) * 1000;
                  const clipEndMs = (clip.endTime ?? Infinity) * 1000;
                  const subtitleWords = (project.transcriptWords ?? [])
                    .filter((w) => w.start >= clipStartMs && w.end <= clipEndMs)
                    .map((w) => ({
                      text: w.text,
                      startMs: w.start - clipStartMs,
                      endMs: w.end - clipStartMs,
                    }));
                  return (
                  <OutputPreview
                    key={clip._id}
                    projectId={projectId}
                    initialSubtitleSettings={project.subtitleSettings ?? DEFAULT_SUBTITLE_SETTINGS as any}
                    clip={{
                      id: clip._id,
                      title: clip.title,
                      videoUrl: clip.clipUrl,
                      viralScore: clip.viralScore ?? 0,
                      duration: formatDuration(clip.startTime, clip.endTime),
                      caption: clip.content,
                      platform: clip.platform,
                      captions: clip.captions ?? { [clip.platform]: clip.content },
                      startTime: clip.startTime,
                      endTime: clip.endTime,
                      clipKey: clip.clipKey,
                      subtitleWords: subtitleWords.length > 0 ? subtitleWords : undefined,
                    }}
                  />
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No clips generated yet.</p>
            )}
          </TabsContent>

          {/* Captions — all platforms per clip */}
          <TabsContent value="captions">
            <div className="flex flex-col gap-6 w-full">
              {outputs?.map((clip) => (
                <MultiPlatformCaptionCard
                  key={clip._id}
                  title={clip.title}
                  platform={clip.platform}
                  captions={clip.captions ?? { [clip.platform]: clip.content }}
                  viralScore={clip.viralScore ?? 0}
                  startTime={clip.startTime}
                  endTime={clip.endTime}
                />
              ))}
            </div>
          </TabsContent>

          {/* Transcript */}
          {hasTranscript && (
            <TabsContent value="transcript">
              <TranscriptViewer
                text={project.transcriptText ?? ""}
                words={project.transcriptWords ?? []}
                clips={
                  outputs?.map((o) => ({
                    title: o.title,
                    startTime: o.startTime ?? 0,
                    endTime: o.endTime ?? 0,
                    viralScore: o.viralScore ?? 0,
                  })) ?? []
                }
              />
            </TabsContent>
          )}
        </Tabs>
      ) : null}

      {/* Empty clips while complete */}
      {isComplete && outputs?.length === 0 && (
        <p className="text-muted-foreground text-sm">
          No clips were generated for this project.
        </p>
      )}

      {/* Delete confirmation dialog */}
      {deleteOpen && (
        <DeleteProjectDialog
          projectTitle={project.title}
          clipCount={outputs?.length ?? 0}
          onConfirm={async () => {
            await deleteProject({ projectId });
            router.push("/dashboard");
          }}
          onClose={() => setDeleteOpen(false)}
        />
      )}
    </div>
  );
}

