"use client";

import { useCallback, useRef, useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";

const CORE_VERSION = "0.12.10";
const CORE_BASE_URL = `https://unpkg.com/@ffmpeg/core@${CORE_VERSION}/dist/umd`;

export function useFFmpeg() {
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadError, setLoadError] = useState("");

  const load = useCallback(async () => {
    if (ffmpegRef.current) return ffmpegRef.current;

    setLoading(true);
    setLoadError("");
    try {
      const ffmpeg = new FFmpeg();
      ffmpeg.on("progress", ({ progress: p }) => {
        setProgress(Math.min(100, Math.round(p * 100)));
      });

      await ffmpeg.load({
        coreURL: await toBlobURL(`${CORE_BASE_URL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${CORE_BASE_URL}/ffmpeg-core.wasm`, "application/wasm"),
      });

      ffmpegRef.current = ffmpeg;
      setLoaded(true);
      return ffmpeg;
    } catch {
      setLoadError("Couldn't load the video engine. Check your connection and try again.");
      throw new Error("ffmpeg-load-failed");
    } finally {
      setLoading(false);
    }
  }, []);

  return { load, loaded, loading, progress, setProgress, loadError };
}
