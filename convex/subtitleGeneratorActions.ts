"use node";

import { v, ConvexError } from "convex/values";
import { action } from "./_generated/server";
import { rateLimiter } from "./rateLimits";
import { r2 } from "./r2storage";
import { AssemblyAI } from "assemblyai";
import { randomUUID } from "node:crypto";

// Free tool cap — kept short since this is a lead-gen tool, not the paid product,
// and it bounds worst-case AssemblyAI cost per request.
export const MAX_SUBTITLE_DURATION_SECONDS = 120;

export const getFreeSubtitleUploadUrl = action({
  args: { clientId: v.string() },
  handler: async (ctx, { clientId }) => {
    const key = clientId.slice(0, 64);
    const { ok } = await rateLimiter.limit(ctx, "subtitleUpload", { key });
    if (!ok) throw new ConvexError("Too many uploads. Please wait a moment and try again.");

    const { key: objectKey, url } = await r2.generateUploadUrl(`free-tools/subtitles/${randomUUID()}`);
    return { uploadUrl: url, key: objectKey };
  },
});

export const generateFreeSubtitles = action({
  args: { key: v.string(), clientId: v.string() },
  handler: async (ctx, { key, clientId }) => {
    const rlKey = clientId.slice(0, 64);
    const [perMinute, perDay, globalPerDay] = await Promise.all([
      rateLimiter.limit(ctx, "subtitleGenerate", { key: rlKey }),
      rateLimiter.limit(ctx, "subtitleGenerateDaily", { key: rlKey }),
      rateLimiter.limit(ctx, "subtitleGenerateGlobalDaily", { key: "global" }),
    ]);
    if (!perMinute.ok) throw new ConvexError("Too many requests. Please wait a moment and try again.");
    if (!perDay.ok) throw new ConvexError("Daily limit reached for the free subtitle generator. Please try again tomorrow.");
    if (!globalPerDay.ok) throw new ConvexError("The free subtitle generator is at capacity for today. Please try again tomorrow.");

    const apiKey = process.env.ASSEMBLYAI_API_KEY;
    if (!apiKey) throw new ConvexError("Service not configured.");

    try {
      const audioUrl = await r2.getUrl(key, { expiresIn: 60 * 60 });
      const client = new AssemblyAI({ apiKey });

      const transcript = await client.transcripts.transcribe({
        audio_url: audioUrl,
        punctuate: true,
        format_text: true,
        language_detection: true,
      });

      if (transcript.status === "error" || !transcript.text) {
        throw new ConvexError(`Transcription failed: ${transcript.error ?? "no speech detected"}`);
      }

      if ((transcript.audio_duration ?? 0) > MAX_SUBTITLE_DURATION_SECONDS) {
        throw new ConvexError(`This clip is longer than the free ${MAX_SUBTITLE_DURATION_SECONDS / 60}-minute limit. Trim it first and try again.`);
      }

      const [srt, vtt] = await Promise.all([
        client.transcripts.subtitles(transcript.id, "srt"),
        client.transcripts.subtitles(transcript.id, "vtt"),
      ]);

      return {
        text: transcript.text,
        srt,
        vtt,
        duration: transcript.audio_duration ?? 0,
      };
    } finally {
      try {
        await r2.deleteObject(ctx, key);
      } catch (err) {
        console.warn(`[subtitleGeneratorActions] Could not delete ${key}:`, err);
      }
    }
  },
});
