"use client"

import { Check, ChevronDown, ChevronUp, Copy, Cpu, Download, Eye, EyeOff, Loader2, Pause, Play, Send, Star, Volume2, VolumeX, Wand2, X } from "lucide-react";
import ActionButton from "../shared/action-button";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { OutputClipProps } from "@/lib/types";
import { PublishModal } from "./publish-modal";
import { downloadVideo } from "@/lib/download";
import { useAction, useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { SubtitleOverlay, SubtitleSettings } from "../subtitle-overlay";
import { SubtitleEditor } from "../subtitle-editor";
import { useWorkspace } from "../workspace-context";
import { DEFAULT_SUBTITLE_SETTINGS } from "@/lib/subtitle";

function FullscreenPlayer({
  clips,
  currentIndex,
  onNavigate,
  onClose,
  projectId,
  initialSubtitleSettings,
}: {
  clips: OutputClipProps[];
  currentIndex: number;
  onNavigate: (index: number) => void;
  onClose: () => void;
  projectId?: Id<"projects">;
  initialSubtitleSettings?: SubtitleSettings;
}) {
  const clip = clips[currentIndex];
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < clips.length - 1;

  const ref = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const retryRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const navThrottleRef = useRef(false);
  const videoBoxRef = useRef<HTMLDivElement>(null);
  const touchStartYRef = useRef(0);
  const publishOpenRef = useRef(false);
  const [playing, setPlaying] = useState(true);
  const [retryKey, setRetryKey] = useState(0);
  const [videoSrc, setVideoSrc] = useState(clip.videoUrl);
  const [processing, setProcessing] = useState(false);
  const [buffering, setBuffering] = useState(true);
  const [muted, setMuted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadingCanvas, setDownloadingCanvas] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  // Keep a ref in sync so event handlers always read the current value
  // without needing to re-register (avoids re-running the effect on modal open/close).
  useEffect(() => { publishOpenRef.current = publishOpen; }, [publishOpen]);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [subtitleSettings, setSubtitleSettings] = useState<SubtitleSettings>(
    initialSubtitleSettings ?? DEFAULT_SUBTITLE_SETTINGS
  );
  const [showSubtitleEditor, setShowSubtitleEditor] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [publishToast, setPublishToast] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloadWarning, setDownloadWarning] = useState<string | null>(null);

  const { isAuthenticated } = useConvexAuth();
  const { isAdmin, activeOrgId } = useWorkspace();
  const accountsQuery = useQuery(api.socialTokens.getAllTokens);
  const zernioAccountsQuery = useQuery(api.zernio.getMyAccounts);
  const usage = useQuery(api.usage.getUsage, { workspaceId: activeOrgId ?? undefined });
  // Use the same plan resolution as the sidebar: user's grantedTier only counts if they
  // OWN the workspace. An admin of a starter workspace stays on starter for feature gating.
  const workspaceTier = useQuery(api.usage.getDirectWorkspaceTier, { workspaceId: activeOrgId ?? undefined });
  // Merge native + Zernio accounts for the publish modal
  const accounts = [
    ...(accountsQuery ?? []).map((a) => ({ ...a, source: "native" as const })),
    ...(zernioAccountsQuery ?? []).map((a) => ({
      id: a.id,
      platform: a.platform,
      accountId: a.accountId,
      accountName: a.accountName,
      accountPicture: a.accountPicture,
      isExpired: false,
      source: "zernio" as const,
    })),
  ];
  const exportWithSubtitles = useAction(api.exportActions.exportWithSubtitles);
  const refreshClipUrl = useAction(api.outputs.refreshClipUrl);
  const saveSubtitleSettingsMutation = useMutation(api.projects.saveSubtitleSettings);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleSubtitleSettingsChange = (next: SubtitleSettings) => {
    setSubtitleSettings(next);
    if (!projectId) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveSubtitleSettingsMutation({ projectId, settings: next }).catch(() => {});
    }, 800);
  };

  const isCloudinary = clip.videoUrl.includes("res.cloudinary.com");
  const hasSubtitles = (clip.subtitleWords?.length ?? 0) > 0;
  // Auto-hide title/caption when edit panel is open so subtitles aren't covered
  const infoVisible = showInfo && !showSubtitleEditor;

  function navigate(delta: number) {
    if (navThrottleRef.current) return;
    const next = currentIndex + delta;
    if (next < 0 || next >= clips.length) return;
    navThrottleRef.current = true;

    const el = videoBoxRef.current;
    if (!el) {
      onNavigate(next);
      setTimeout(() => { navThrottleRef.current = false; }, 400);
      return;
    }

    const exitY = delta > 0 ? "-100%" : "100%";
    const enterY = delta > 0 ? "100%" : "-100%";

    // Slide current clip out
    el.style.transition = "transform 300ms cubic-bezier(0.4,0,0.2,1)";
    el.style.transform = `translateY(${exitY})`;

    setTimeout(() => {
      // Jump to opposite side (off-screen, no transition) and swap clip
      el.style.transition = "none";
      el.style.transform = `translateY(${enterY})`;
      onNavigate(next);

      // Two rAFs to ensure the browser has painted the off-screen position
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.transition = "transform 300ms cubic-bezier(0.4,0,0.2,1)";
          el.style.transform = "translateY(0)";
          setTimeout(() => { navThrottleRef.current = false; }, 320);
        });
      });
    }, 310);
  }

  // Reset player whenever we land on a new clip
  useEffect(() => {
    setVideoSrc(clips[currentIndex].videoUrl);
    setRetryKey((k) => k + 1);
    setProcessing(false);
    setShowInfo(false);
    setShowSubtitleEditor(false);
    setDownloadError(null);
    setDownloadWarning(null);
  }, [currentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.body.style.overflow = "hidden";

    // Suppress MEDIA_ERR_ABORTED (code 1) at the native level so the Next.js
    // dev overlay doesn't show "Runtime AbortError" when src changes mid-load.
    const el = ref.current;
    const suppressAbort = (e: Event) => {
      if ((e.target as HTMLVideoElement).error?.code === 1) e.stopImmediatePropagation();
    };
    el?.addEventListener("error", suppressAbort, true);

    // Wheel — scroll down = next, scroll up = prev
    // When a modal is open, skip navigation AND skip preventDefault so
    // the modal's own scroll container works normally.
    const onWheel = (e: WheelEvent) => {
      if (publishOpenRef.current) return;
      if (Math.abs(e.deltaY) < 20) return;
      e.preventDefault();
      navigate(e.deltaY > 0 ? 1 : -1);
    };

    // Touch — swipe up = next, swipe down = prev
    const onTouchStart = (e: TouchEvent) => { touchStartYRef.current = e.touches[0].clientY; };
    const onTouchEnd = (e: TouchEvent) => {
      if (publishOpenRef.current) return;
      const dy = touchStartYRef.current - e.changedTouches[0].clientY;
      if (Math.abs(dy) < 60) return;
      navigate(dy > 0 ? 1 : -1);
    };

    // Keyboard — Arrow keys
    const onKeyDown = (e: KeyboardEvent) => {
      if (publishOpenRef.current) return;
      if (e.key === "ArrowDown" || e.key === "ArrowRight") navigate(1);
      if (e.key === "ArrowUp"   || e.key === "ArrowLeft")  navigate(-1);
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("wheel", onWheel, { passive: false });
    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "auto";
      if (retryRef.current) clearTimeout(retryRef.current);
      el?.removeEventListener("error", suppressAbort, true);
      document.removeEventListener("wheel", onWheel);
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchend", onTouchEnd);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [currentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (ref.current) {
      ref.current.play().catch(() => setPlaying(false));
    }
  }, [retryKey]);

  const handleLoadedMetadata = () => {
    setProcessing(false);
    if (ref.current && isCloudinary && clip.startTime) {
      ref.current.currentTime = clip.startTime;
    }
  };

  const handleCanPlay = () => setBuffering(false);
  const handleWaiting = () => setBuffering(true);
  const handlePlaying = () => setBuffering(false);

  // Reset buffering spinner whenever the src reloads (retryKey bump or fresh URL)
  useEffect(() => { setBuffering(true); }, [retryKey, videoSrc]);

  const handleTimeUpdate = () => {
    if (!ref.current) return;
    const rawTime = ref.current.currentTime;
    const timeOffset = isCloudinary ? (clip.startTime ?? 0) : 0;
    setCurrentTimeMs((rawTime - timeOffset) * 1000);
    if (!isCloudinary || clip.endTime === undefined) return;
    if (rawTime >= clip.endTime) {
      ref.current.pause();
      if (clip.startTime !== undefined) ref.current.currentTime = clip.startTime;
      setPlaying(false);
    }
  };

  // Keep videoSrc in sync when the parent re-renders with a new signed URL
  // (happens when Convex re-queries after processing completes).
  // Only update when NOT actively playing to avoid aborting mid-playback.
  useEffect(() => {
    if (!playing && clip.videoUrl && clip.videoUrl !== videoSrc) {
      setVideoSrc(clip.videoUrl);
    }
  }, [clip.videoUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleError = async (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const videoEl = e.target as HTMLVideoElement;
    const code = videoEl.error?.code;

    // MEDIA_ERR_ABORTED (code 1) = browser cancelled its own fetch.
    // This fires when the src changes while a load is in-flight (React re-render).
    // It is not a real error — the new src will load immediately after.
    if (code === 1) return;

    // MEDIA_ERR_NETWORK (code 2) or MEDIA_ERR_SRC_NOT_SUPPORTED (code 4)
    // usually means the signed URL expired. Refresh and retry.
    if (isCloudinary) {
      setProcessing(true);
      retryRef.current = setTimeout(() => setRetryKey((k) => k + 1), 8000);
      return;
    }

    // For R2 clips: refresh the signed URL then force the player to reload.
    if (clip.clipKey) {
      try {
        const fresh = await refreshClipUrl({ clipKey: clip.clipKey });
        setVideoSrc(fresh);
        setRetryKey((k) => k + 1);
      } catch {
        // refresh failed — nothing more we can do
      }
    }
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!ref.current) return;
    if (ref.current.paused) {
      if (isCloudinary && clip.endTime !== undefined && ref.current.currentTime >= clip.endTime) {
        ref.current.currentTime = clip.startTime ?? 0;
      }
      ref.current.play();
      setPlaying(true);
    } else {
      ref.current.pause();
      setPlaying(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!ref.current) return;
    ref.current.muted = !ref.current.muted;
    setMuted(ref.current.muted);
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (downloading) return;
    setDownloading(true);
    setDownloadError(null);
    setDownloadWarning(null);
    try {
      if (subtitleSettings.enabled && (clip.subtitleWords?.length ?? 0) > 0 && clip.clipKey) {
        try {
          const { downloadUrl } = await exportWithSubtitles({
            outputId: clip.id as import("@/convex/_generated/dataModel").Id<"outputs">,
            clipKey: clip.clipKey,
            clipTitle: clip.title,
            subtitleWords: clip.subtitleWords!,
            settings: subtitleSettings,
          });
          await downloadVideo(downloadUrl, clip.title);
          return;
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          const clean = msg.match(/Uncaught (?:Convex)?Error:\s*([\s\S]+?)(?:\n\s*at |\n\s*Called by|$)/)?.[1]?.trim() ?? msg;
          if (clean.includes("re-renders") || clean.includes("Upgrade")) {
            setDownloadError(clean);
            setTimeout(() => setDownloadError(null), 6000);
            return;
          }
          setDownloadWarning("Subtitle export failed — downloading without subtitles.");
          setTimeout(() => setDownloadWarning(null), 5000);
        }
      }
      await downloadVideo(clip.videoUrl, clip.title);
    } finally {
      setDownloading(false);
    }
  };



  const copyCaption = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(clip.caption ?? clip.title);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSubtitleEditor = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowSubtitleEditor((v) => !v);
  };

  const toggleInfo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowInfo((v) => !v);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-9999 bg-black sm:bg-[#0f0f0f] flex items-center justify-center sm:p-8 animate-in fade-in duration-200"
     
    >
      <div className="flex flex-row items-end justify-center w-full h-full max-w-8xl relative gap-8 pb-8">
        {/* Close */}
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="absolute top-2 right-2 sm:-top-2 sm:-right-2 z-100 p-3 rounded-full text-white hover:bg-white/10 transition-colors pointer-events-auto"
        >
          <X size={28} strokeWidth={2.5} />
        </button>



        {/* Video Box */}
        <div
          className="relative h-full sm:h-100vh sm:aspect-11/18 sm:max-h-[95vh] w-full sm:w-auto overflow-hidden sm:rounded-3xl border border-white/5"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Sliding panel — translated by navigate() for the YouTube-style swipe */}
          <div ref={videoBoxRef} className="relative w-full h-full bg-black" style={{ willChange: "transform" }}>
          <div ref={containerRef} className="relative w-full h-full group/player">
            <video
              key={retryKey}
              ref={ref}
              src={videoSrc}
              className="w-full h-full object-cover"
              preload="auto"
              playsInline
              onLoadedMetadata={handleLoadedMetadata}
              onCanPlay={handleCanPlay}
              onWaiting={handleWaiting}
              onPlaying={handlePlaying}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setPlaying(false)}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onError={handleError}
              muted={muted}
            />

            {/* Subtitle overlay */}
            {hasSubtitles && (
              <SubtitleOverlay
                words={clip.subtitleWords!}
                currentTimeMs={currentTimeMs}
                settings={subtitleSettings}
                containerRef={containerRef as React.RefObject<HTMLDivElement>}
                onSettingsChange={handleSubtitleSettingsChange}
                editable={showSubtitleEditor}
              />
            )}

            {/* Initial load / mid-playback buffering */}
            {buffering && !processing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10 pointer-events-none">
                <Loader2 size={40} className="text-white/80 animate-spin" />
              </div>
            )}

            {/* Processing */}
            {processing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-3 z-10">
                <div className="relative">
                  <Loader2 size={32} className="text-white/40" />
                  <Loader2 size={16} className="text-primary animate-spin absolute -bottom-1 -right-1" />
                </div>
                <p className="text-white/80 text-xs font-semibold text-center px-4">
                  Cloudinary is transforming<br />your clip…
                </p>
                <p className="text-white/40 text-[10px]">Auto-refreshing every 8 s</p>
              </div>
            )}

            {/* Mute */}
            <button
              onClick={toggleMute}
              className="absolute top-6 left-6 z-50 p-3 rounded-full bg-black/30 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 transition-colors pointer-events-auto"
            >
              {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>

            {/* Play/Pause overlay */}
            {!processing && (
              <button
                onClick={togglePlay}
                className={cn(
                  "absolute inset-0 flex items-center justify-center transition-opacity pointer-events-auto",
                  playing ? "opacity-0" : "opacity-100"
                )}
              >
                <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-xl">
                  {playing
                    ? <Pause size={28} className="text-black" />
                    : <Play size={28} className="text-black ml-1" />}
                </div>
              </button>
            )}
          </div>

          {/* Score Pill + clip counter */}
          <div className="absolute top-6 right-6 z-50 flex flex-col items-end gap-2">
            <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-full text-[14px] font-black flex items-center gap-2 shadow-xl text-black">
              <Star size={16} className="text-accent fill-accent" />
              <span>Score: {clip.viralScore}</span>
            </div>
            {clips.length > 1 && (
              <div className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-white/80">
                {currentIndex + 1} / {clips.length}
              </div>
            )}
          </div>

          {/* Bottom gradient — fades with info panel */}
          <div className={cn(
            "absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/80 via-black/20 to-transparent pointer-events-none z-10 transition-opacity duration-300",
            infoVisible ? "opacity-100" : "opacity-0"
          )} />

          {/* Title + caption */}
          <div className={cn(
            "absolute bottom-10 left-6 right-20 z-20 pointer-events-none transition-all duration-300",
            infoVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
          )}>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/10 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[11px] font-black text-white uppercase tracking-widest">{clip.duration || "0:00"}</span>
            </div>
            <h4 className="font-black text-xl sm:text-2xl text-white mb-3 leading-tight drop-shadow-lg line-clamp-2">
              {clip.title}
            </h4>
            {clip.caption && (
              <p className="text-white/90 text-sm font-bold leading-relaxed line-clamp-3 drop-shadow-md max-w-md">
                {clip.caption}
              </p>
            )}
          </div>

          {/* Mobile action bar */}
          <div className="sm:hidden absolute right-4 bottom-12 flex flex-col gap-5 items-center z-20">
            {hasSubtitles && isAdmin && (
              <ActionButton icon={<Wand2 size={22} />} onClick={toggleSubtitleEditor} />
            )}
            <ActionButton
              icon={infoVisible ? <EyeOff size={18} /> : <Eye size={18} />}
              small
              onClick={toggleInfo}
            />
            <ActionButton icon={<Send size={22} className="ml-0.5" />} primary onClick={(e) => { e.stopPropagation(); setPublishOpen(true); }} />
            <ActionButton icon={copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />} small onClick={copyCaption} />
            <ActionButton
              icon={downloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
              small
              onClick={handleDownload}
            />
            
          </div>
          </div>{/* end sliding panel */}
        </div>{/* end clip container */}

        {/* Desktop sidebar */}
        <div className="hidden sm:flex flex-col gap-4 items-center" onClick={(e) => e.stopPropagation()}>
          {hasSubtitles && isAdmin && (
            <ActionButton icon={<Wand2 size={22} />} label="Edit" onClick={toggleSubtitleEditor} />
          )}
          <ActionButton
            icon={infoVisible ? <EyeOff size={18} /> : <Eye size={18} />}
            label={infoVisible ? "Hide" : "Info"}
            small
            onClick={toggleInfo}
          />
          <ActionButton icon={<Send size={22} className="ml-0.5" />} label="Post" primary onClick={(e) => { e.stopPropagation(); setPublishOpen(true); }} />
          <ActionButton icon={copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />} small onClick={copyCaption} />
          <ActionButton
            icon={downloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            small
            onClick={(e) => { e.stopPropagation(); handleDownload(e); }}
          />
         
        </div>
        {/* Subtitle editor panel — now on the right of buttons */}
        {showSubtitleEditor && hasSubtitles && isAdmin && (
          <div className="hidden sm:block animate-in slide-in-from-left-4 duration-300" onClick={(e) => e.stopPropagation()}>
            <SubtitleEditor
              settings={subtitleSettings}
              onChange={handleSubtitleSettingsChange}
              onClose={() => setShowSubtitleEditor(false)}
              plan={workspaceTier}
            />
          </div>
        )}
      </div>

      {/* Mobile subtitle editor — bottom sheet */}
      {showSubtitleEditor && hasSubtitles && isAdmin && (
        <div
          className="sm:hidden absolute bottom-0 left-0 right-0 z-50 p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <SubtitleEditor
            settings={subtitleSettings}
            onChange={handleSubtitleSettingsChange}
            onClose={() => setShowSubtitleEditor(false)}
          />
        </div>
      )}

      <PublishModal
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        accounts={accounts}
        isLoadingAccounts={!isAuthenticated || accountsQuery === undefined}
        clipTitle={clip.title}
        clipUrl={clip.videoUrl}
        clipKey={clip.clipKey}
        outputId={clip.id}
        defaultCaption={clip.caption}
        captions={clip.captions}
        canSchedule={usage?.limits.scheduledPublishing ?? false}
        workspaceId={activeOrgId ?? undefined}
        onPublished={(count) => {
          setPublishOpen(false);
          setPublishToast(`Published to ${count} account${count !== 1 ? "s" : ""}!`);
          setTimeout(() => setPublishToast(null), 4000);
        }}
      />

      {publishToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-300 flex items-center gap-2 bg-green-600 text-white px-5 py-3 rounded-2xl shadow-xl font-semibold text-sm animate-in slide-in-from-bottom-2">
          <Check size={16} />
          {publishToast}
        </div>
      )}

      {downloadWarning && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-300 max-w-sm w-full mx-4 flex items-center gap-3 bg-amber-500 text-white px-5 py-3 rounded-2xl shadow-xl text-sm animate-in slide-in-from-bottom-2">
          <X size={16} className="shrink-0" />
          <span>{downloadWarning}</span>
        </div>
      )}

      {downloadError && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-300 max-w-sm w-full mx-4 flex items-start gap-3 bg-red-600 text-white px-5 py-3 rounded-2xl shadow-xl text-sm animate-in slide-in-from-bottom-2">
          <X size={16} className="shrink-0 mt-0.5" />
          <span>
            {downloadError}{" "}
            <a href="/dashboard/billing" className="underline font-bold">Upgrade →</a>
          </span>
        </div>
      )}
    </div>,
    document.body,
  );
}

export default FullscreenPlayer
