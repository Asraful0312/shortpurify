"use client";

import { useRef, useState } from "react";
import { fetchFile } from "@ffmpeg/util";
import { Scissors, Upload, Download, Loader2, AlertCircle, ShieldCheck } from "lucide-react";
import ToolsBreadcrumb from "@/components/tools-breadcrumb";
import ToolsCta from "@/components/tools-cta";
import { useFFmpeg } from "@/hooks/useFFmpeg";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function VideoTrimmer() {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [duration, setDuration] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [outputUrl, setOutputUrl] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const { load, loading, progress, loadError } = useFFmpeg();

  const handleFile = (f: File | null) => {
    if (!f) return;
    if (!f.type.startsWith("video/")) {
      setError("Please choose a video file.");
      return;
    }
    setError("");
    setOutputUrl("");
    setFile(f);
    setVideoUrl(URL.createObjectURL(f));
  };

  const onLoadedMetadata = () => {
    const d = videoRef.current?.duration ?? 0;
    setDuration(d);
    setStart(0);
    setEnd(d);
  };

  const trim = async () => {
    if (!file) return;
    if (end <= start) {
      setError("End time must be after start time.");
      return;
    }
    setError("");
    setProcessing(true);
    setOutputUrl("");
    try {
      const ffmpeg = await load();
      const ext = file.name.split(".").pop()?.toLowerCase() || "mp4";
      const inputName = `input.${ext}`;
      await ffmpeg.writeFile(inputName, await fetchFile(file));
      await ffmpeg.exec([
        "-i", inputName, "-ss", String(start), "-to", String(end),
        "-c:v", "libx264", "-preset", "veryfast", "-c:a", "aac",
        "-movflags", "+faststart", "output.mp4",
      ]);
      const data = await ffmpeg.readFile("output.mp4");
      const blob = new Blob([data as BlobPart], { type: "video/mp4" });
      setOutputUrl(URL.createObjectURL(blob));
    } catch {
      setError("Couldn't trim this video. Try a shorter clip or a different file.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-14">
      <ToolsBreadcrumb toolName="Video Trimmer" toolHref="/tools/video-trimmer" />

      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-slate-50 text-slate-600 border border-slate-200 px-3 py-1 rounded-full text-xs font-semibold mb-4">
          <Scissors size={13} /> Free Tool
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-3">Video Trimmer</h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Cut a video to the exact clip you need, right in your browser. Free, no sign-up, nothing uploaded.
        </p>
      </div>

      <div className="bg-white border border-border rounded-3xl p-6 shadow-sm mb-6">
        {!file ? (
          <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-border rounded-2xl py-16 cursor-pointer hover:border-primary/40 hover:bg-secondary/20 transition-colors">
            <Upload size={28} className="text-muted-foreground" />
            <span className="font-bold text-sm">Click to choose a video</span>
            <span className="text-xs text-muted-foreground">MP4, MOV, WebM — processed locally in your browser</span>
            <input type="file" accept="video/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
          </label>
        ) : (
          <div className="flex flex-col gap-5">
            <video ref={videoRef} src={videoUrl} controls onLoadedMetadata={onLoadedMetadata} className="w-full rounded-2xl bg-black max-h-96" />

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1.5">Start ({formatTime(start)})</label>
                <input
                  type="range" min={0} max={duration || 0} step={0.1} value={start}
                  onChange={(e) => setStart(Math.min(Number(e.target.value), end - 0.1))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1.5">End ({formatTime(end)})</label>
                <input
                  type="range" min={0} max={duration || 0} step={0.1} value={end}
                  onChange={(e) => setEnd(Math.max(Number(e.target.value), start + 0.1))}
                  className="w-full"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground -mt-2">Clip length: {formatTime(Math.max(0, end - start))}</p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => void trim()}
                disabled={processing || loading}
                className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing || loading
                  ? <><Loader2 size={16} className="animate-spin" /> {loading ? "Loading engine…" : `Trimming… ${progress}%`}</>
                  : <><Scissors size={16} /> Trim Video</>}
              </button>
              <label className="flex items-center justify-center gap-2 border border-border font-semibold text-sm px-5 py-3 rounded-xl hover:bg-secondary/40 transition-colors cursor-pointer">
                Choose a different file
                <input type="file" accept="video/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
              </label>
            </div>
          </div>
        )}

        {(error || loadError) && (
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <p>{error || loadError}</p>
          </div>
        )}

        {outputUrl && (
          <div className="mt-6 p-6 bg-secondary/20 rounded-3xl border border-dashed border-border flex flex-col items-center text-center gap-4">
            <video src={outputUrl} controls className="w-full max-w-sm rounded-2xl bg-black" />
            <a
              href={outputUrl}
              download="trimmed-video.mp4"
              className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
            >
              <Download size={18} /> Download Trimmed MP4
            </a>
          </div>
        )}
      </div>

      <div className="flex items-start gap-3 bg-secondary/30 rounded-2xl px-5 py-4 mb-8 text-sm text-muted-foreground">
        <ShieldCheck size={18} className="text-primary mt-0.5 shrink-0" />
        <p>Your video never leaves your device. Trimming runs entirely in your browser using WebAssembly — nothing is uploaded to any server.</p>
      </div>

      <ToolsCta
        headerText="Need more than a quick trim?"
        subText="ShortPurify turns long videos into viral short clips automatically with AI captions, smart crop, and one-click publishing to TikTok, YouTube Shorts, and Instagram Reels."
      />
    </main>
  );
}
