"use client";

import { useRef, useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Captions, Upload, Download, Loader2, AlertCircle, ShieldCheck, Copy, Check } from "lucide-react";
import ToolsBreadcrumb from "@/components/tools-breadcrumb";
import ToolsCta from "@/components/tools-cta";
import { getToolError } from "@/lib/getToolError";

const MAX_DURATION_SECONDS = 120;

function getClientId() {
  if (typeof window === "undefined") return "ssr";
  let id = localStorage.getItem("sp_tool_client_id");
  if (!id) { id = crypto.randomUUID(); localStorage.setItem("sp_tool_client_id", id); }
  return id;
}

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

type Stage = "idle" | "uploading" | "transcribing";

export default function VideoSubtitleGenerator() {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [duration, setDuration] = useState(0);
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ text: string; srt: string; vtt: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const getUploadUrl = useAction(api.subtitleGeneratorActions.getFreeSubtitleUploadUrl);
  const generateSubtitles = useAction(api.subtitleGeneratorActions.generateFreeSubtitles);

  const handleFile = (f: File | null) => {
    if (!f) return;
    if (!f.type.startsWith("video/") && !f.type.startsWith("audio/")) {
      setError("Please choose a video or audio file.");
      return;
    }
    setError("");
    setResult(null);
    setFile(f);
    setVideoUrl(URL.createObjectURL(f));
  };

  const onLoadedMetadata = () => {
    const d = videoRef.current?.duration ?? audioRef.current?.duration ?? 0;
    setDuration(d);
    if (d > MAX_DURATION_SECONDS) {
      setError(`This clip is ${Math.ceil(d)}s long. The free tool supports clips up to ${MAX_DURATION_SECONDS / 60} minutes — trim it first.`);
    }
  };

  const generate = async () => {
    if (!file || duration > MAX_DURATION_SECONDS) return;
    setError("");
    setResult(null);
    const clientId = getClientId();
    try {
      setStage("uploading");
      const { uploadUrl, key } = await getUploadUrl({ clientId });
      const putRes = await fetch(uploadUrl, { method: "PUT", body: file });
      if (!putRes.ok) throw new Error("Upload failed. Please try again.");

      setStage("transcribing");
      const data = await generateSubtitles({ key, clientId });
      setResult(data);
    } catch (err) {
      setError(getToolError(err));
    } finally {
      setStage("idle");
    }
  };

  const copyText = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const busy = stage !== "idle";

  return (
    <main className="max-w-3xl mx-auto px-4 py-14">
      <ToolsBreadcrumb toolName="Video Subtitle Generator" toolHref="/tools/video-subtitle-generator" />

      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-slate-50 text-slate-600 border border-slate-200 px-3 py-1 rounded-full text-xs font-semibold mb-4">
          <Captions size={13} /> Free Tool
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-3">Video Subtitle Generator</h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Get accurate AI captions for your video in seconds. Free for clips up to {MAX_DURATION_SECONDS / 60} minutes, no sign-up.
        </p>
      </div>

      <div className="bg-white border border-border rounded-3xl p-6 shadow-sm mb-6">
        {!file ? (
          <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-border rounded-2xl py-16 cursor-pointer hover:border-primary/40 hover:bg-secondary/20 transition-colors">
            <Upload size={28} className="text-muted-foreground" />
            <span className="font-bold text-sm">Click to choose a video or audio file</span>
            <span className="text-xs text-muted-foreground">MP4, MOV, MP3, WAV — up to {MAX_DURATION_SECONDS / 60} minutes</span>
            <input type="file" accept="video/*,audio/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
          </label>
        ) : (
          <div className="flex flex-col gap-5">
            {file.type.startsWith("video/") && (
              <video ref={videoRef} src={videoUrl} controls onLoadedMetadata={onLoadedMetadata} className="w-full rounded-2xl bg-black max-h-96" />
            )}
            {file.type.startsWith("audio/") && (
              <audio ref={audioRef} src={videoUrl} controls onLoadedMetadata={onLoadedMetadata} className="w-full" />
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => void generate()}
                disabled={busy || !file || duration > MAX_DURATION_SECONDS}
                className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {busy
                  ? <><Loader2 size={16} className="animate-spin" /> {stage === "uploading" ? "Uploading…" : "Transcribing… usually under a minute"}</>
                  : <><Captions size={16} /> Generate Subtitles</>}
              </button>
              <label className="flex items-center justify-center gap-2 border border-border font-semibold text-sm px-5 py-3 rounded-xl hover:bg-secondary/40 transition-colors cursor-pointer">
                Choose a different file
                <input type="file" accept="video/*,audio/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
              </label>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-6 flex flex-col gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Transcript</span>
                <button onClick={() => void copyText()} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  {copied ? <><Check size={11} className="text-green-600" /> Copied</> : <><Copy size={11} /> Copy</>}
                </button>
              </div>
              <div className="bg-secondary/40 rounded-xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                {result.text}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => downloadFile(result.srt, "subtitles.srt", "text/plain")}
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
              >
                <Download size={16} /> Download .SRT
              </button>
              <button
                onClick={() => downloadFile(result.vtt, "subtitles.vtt", "text/vtt")}
                className="flex-1 flex items-center justify-center gap-2 border border-border font-bold py-3 rounded-xl hover:bg-secondary/40 transition-colors"
              >
                <Download size={16} /> Download .VTT
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-start gap-3 bg-secondary/30 rounded-2xl px-5 py-4 mb-8 text-sm text-muted-foreground">
        <ShieldCheck size={18} className="text-primary mt-0.5 shrink-0" />
        <p>Your file is uploaded securely for transcription only and permanently deleted right after — we don&apos;t store or reuse it.</p>
      </div>

      <ToolsCta
        headerText="Want captions burned directly onto your video?"
        subText="ShortPurify auto-generates styled, animated captions and burns them onto your clips — plus smart crop and one-click publishing to TikTok, YouTube Shorts, and Instagram Reels."
      />
    </main>
  );
}
