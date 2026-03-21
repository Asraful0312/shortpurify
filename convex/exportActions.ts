"use node";
/**
 * exportActions.ts — Server-side subtitle burn export.
 *
 * Required env vars:
 *   BURN_SUBTITLES_URL   — Modal burn_subtitles endpoint URL
 *   VIDEO_WORKER_SECRET  — shared secret for Modal auth
 */

import { v } from "convex/values";
import { action } from "./_generated/server";
import { r2 } from "./r2storage";

export const exportWithSubtitles = action({
  args: {
    clipKey: v.string(),       // R2 key of the source clip
    clipTitle: v.string(),
    subtitleWords: v.array(
      v.object({ text: v.string(), startMs: v.number(), endMs: v.number() }),
    ),
    settings: v.object({
      enabled: v.boolean(),
      x: v.number(),
      y: v.number(),
      fontSize: v.number(),
      fontFamily: v.string(),
      textColor: v.string(),
      highlightColor: v.string(),
      highlightBg: v.string(),
      wordsPerLine: v.number(),
    }),
  },
  handler: async (ctx, { clipKey, clipTitle, subtitleWords, settings }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const workerUrl = process.env.BURN_SUBTITLES_URL;
    const workerSecret = process.env.VIDEO_WORKER_SECRET ?? "";
    if (!workerUrl) throw new Error("BURN_SUBTITLES_URL env var is not set");

    // Signed GET URL so Modal can download the clip
    const clipUrl = await r2.getUrl(clipKey, { expiresIn: 60 * 60 });

    // Presigned PUT URL for the export output
    const exportKey = `exports/${clipKey.replace(/\.mp4$/, "")}-subtitled.mp4`;
    const { url: uploadUrl } = await r2.generateUploadUrl(exportKey);

    // Call Modal
    const resp = await fetch(workerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workerSecret,
        clipUrl,
        uploadUrl,
        subtitleWords,
        settings,
      }),
    });

    if (!resp.ok) {
      const txt = await resp.text().catch(() => resp.statusText);
      throw new Error(`Burn worker error ${resp.status}: ${txt}`);
    }

    const result = (await resp.json()) as { ok: boolean; error?: string };
    if (!result.ok) throw new Error(result.error ?? "Burn failed");

    // Return a 1-hour signed download URL for the exported file
    const downloadUrl = await r2.getUrl(exportKey, { expiresIn: 60 * 60 });
    return { downloadUrl };
  },
});
