"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { AssemblyAI } from "assemblyai";

/**
 * Submits the video URL to AssemblyAI and waits for the transcript.
 * Returns full text, word-level timestamps (ms), and audio duration.
 */
export const transcribeVideo = internalAction({
  args: { videoUrl: v.string() },
  handler: async (_ctx, { videoUrl }) => {
    const client = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY! });

    const transcript = await client.transcripts.transcribe({
      audio_url: videoUrl,
      speaker_labels: true,
      punctuate: true,
      format_text: true,
    });

    if (transcript.status === "error" || !transcript.text) {
      throw new Error(
        `AssemblyAI transcription failed: ${transcript.error ?? "no text returned"}`,
      );
    }

    // Simplify word objects — keep only what we store in Convex
    const words = (transcript.words ?? []).map((w) => ({
      text: w.text ?? "",
      start: w.start ?? 0, // milliseconds
      end: w.end ?? 0,     // milliseconds
      speaker: w.speaker ?? undefined,
    }));

    return {
      text: transcript.text,
      words,
      duration: transcript.audio_duration ?? 0,
    };
  },
});
