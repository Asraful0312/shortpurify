"use node";

import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";

/** Matches every common YouTube URL form */
const YT_REGEX =
  /(?:youtube\.com\/(?:watch\?.*v=|shorts\/|embed\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;

export function extractVideoId(url: string): string | null {
  const m = url.match(YT_REGEX);
  return m ? m[1] : null;
}

/**
 * Resolves a YouTube URL to a direct CDN stream URL using YouTube's internal
 * Innertube API, then creates a project and kicks off the full AI pipeline.
 * No video data passes through our servers.
 */
export const createProjectFromYouTube = action({
  args: {
    youtubeUrl: v.string(),
    title: v.optional(v.string()),
    enabledPlatforms: v.optional(v.array(v.string())),
  },
  handler: async (ctx, { youtubeUrl, title, enabledPlatforms }): Promise<{ projectId: string }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) throw new Error("Not a valid YouTube URL");

    const workerUrl = process.env.VIDEO_WORKER_URL;
    const workerSecret = process.env.VIDEO_WORKER_SECRET;
    if (!workerUrl || !workerSecret) {
      throw new Error("Missing VIDEO_WORKER_URL or VIDEO_WORKER_SECRET environment variables. Ensure Modal worker is deployed.");
    }

    // Modal exposes each @modal.fastapi_endpoint as a separate subdomain URL.
    // It translates the Python function `process_video` into `process-video` in the URL.
    // Similarly, `extract_youtube_info` becomes `extract-youtube-info`.
    const extractUrl = workerUrl.replace("process-video", "extract-youtube-info");

    const res = await fetch(extractUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        youtubeUrl,
        workerSecret,
      }),
    });

    if (!res.ok) {
      throw new Error(`Worker returned HTTP ${res.status}`);
    }
    
    const data = await res.json();
    if (!data.ok || !data.playbackUrl) {
      throw new Error(data.error || "Failed to extract video playback URL. Ensure the YouTube video is available.");
    }

    const videoTitle = title?.trim() || data.title || "YouTube Import";

    const projectId = await ctx.runMutation(api.projects.createProjectAndStart, {
      title: videoTitle,
      originalUrl: data.playbackUrl,
      enabledPlatforms: enabledPlatforms ?? [],
    });

    return { projectId };
  },
});
