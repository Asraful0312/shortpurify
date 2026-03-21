"use client"

import { Check, Clapperboard, Copy, Download, Eye, EyeOff, Loader2, Pause, Play, Send, Star, Volume2, VolumeX, Wand2, X } from "lucide-react";
import ActionButton from "../shared/action-button";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { OutputClipProps } from "@/lib/types";
import { PublishModal } from "./publish-modal";
import { downloadVideo } from "@/lib/download";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SubtitleOverlay, DEFAULT_SUBTITLE_SETTINGS, SubtitleSettings } from "../subtitle-overlay";
import { SubtitleEditor } from "../subtitle-editor";

function FullscreenPlayer({
  clip,
  onClose,
}: {
  clip: OutputClipProps;
  onClose: () => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const retryRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [playing, setPlaying] = useState(true);
  const [retryKey, setRetryKey] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [muted, setMuted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [subtitleSettings, setSubtitleSettings] = useState<SubtitleSettings>(DEFAULT_SUBTITLE_SETTINGS);
  const [showSubtitleEditor, setShowSubtitleEditor] = useState(false);
  const [showInfo, setShowInfo] = useState(true);

  const exportWithSubtitles = useAction(api.exportActions.exportWithSubtitles);

  const isCloudinary = clip.videoUrl.includes("res.cloudinary.com");
  const hasSubtitles = (clip.subtitleWords?.length ?? 0) > 0;
  // Auto-hide title/caption when edit panel is open so subtitles aren't covered
  const infoVisible = showInfo && !showSubtitleEditor;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
      if (retryRef.current) clearTimeout(retryRef.current);
    };
  }, []);

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

  const handleError = () => {
    if (!isCloudinary) return;
    setProcessing(true);
    retryRef.current = setTimeout(() => setRetryKey((k) => k + 1), 8000);
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
    try {
      if (subtitleSettings.enabled && (clip.subtitleWords?.length ?? 0) > 0 && clip.clipKey) {
        try {
          const { downloadUrl } = await exportWithSubtitles({
            clipKey: clip.clipKey,
            clipTitle: clip.title,
            subtitleWords: clip.subtitleWords!,
            settings: subtitleSettings,
          });
          const a = document.createElement("a");
          a.href = downloadUrl;
          a.download = `${clip.title}.mp4`;
          a.click();
          return;
        } catch {
          // BURN_SUBTITLES_URL not configured — fall back to plain download
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
      <div className="flex flex-row items-end justify-center w-full h-full max-w-7xl relative gap-8">
        {/* Close */}
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="absolute top-2 right-2 sm:-top-2 sm:-right-2 z-100 p-3 rounded-full text-white hover:bg-white/10 transition-colors pointer-events-auto"
        >
          <X size={28} strokeWidth={2.5} />
        </button>

        {/* Video Box */}
        <div
          className="relative h-full sm:h-100vh sm:aspect-9/16 sm:max-h-[85vh] w-full sm:w-auto bg-black sm:rounded-3xl overflow-hidden border border-white/5"
          onClick={(e) => e.stopPropagation()}
        >
          <div ref={containerRef} className="relative w-full h-full group/player">
            <video
              key={retryKey}
              ref={ref}
              src={clip.videoUrl}
              className="w-full h-full object-cover"
              preload="auto"
              playsInline
              onLoadedMetadata={handleLoadedMetadata}
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
                onSettingsChange={setSubtitleSettings}
                editable={showSubtitleEditor}
              />
            )}

            {/* Processing */}
            {processing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-3 z-10">
                <div className="relative">
                  <Clapperboard size={32} className="text-white/40" />
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

          {/* Score Pill */}
          <div className="absolute top-6 right-6 z-50">
            <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-full text-[14px] font-black flex items-center gap-2 shadow-xl text-black">
              <Star size={16} className="text-accent fill-accent" />
              <span>Score: {clip.viralScore}</span>
            </div>
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
            {hasSubtitles && (
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
        </div>

        {/* Desktop sidebar */}
        <div className="hidden sm:flex flex-col gap-6 items-center" onClick={(e) => e.stopPropagation()}>
          {hasSubtitles && (
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

          {/* Subtitle editor panel */}
          {showSubtitleEditor && hasSubtitles && (
            <div className="mt-2">
              <SubtitleEditor
                settings={subtitleSettings}
                onChange={setSubtitleSettings}
                onClose={() => setShowSubtitleEditor(false)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Mobile subtitle editor — bottom sheet */}
      {showSubtitleEditor && hasSubtitles && (
        <div
          className="sm:hidden absolute bottom-0 left-0 right-0 z-50 p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <SubtitleEditor
            settings={subtitleSettings}
            onChange={setSubtitleSettings}
            onClose={() => setShowSubtitleEditor(false)}
          />
        </div>
      )}

      <PublishModal
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        clipTitle={clip.title}
      />
    </div>,
    document.body,
  );
}

export default FullscreenPlayer
