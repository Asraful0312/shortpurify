"use node";
/**
 * exportActions.ts — Server-side subtitle burn export with R2 caching.
 *
 * Required env vars:
 *   BURN_SUBTITLES_URL   — Modal burn_subtitles endpoint URL
 *   VIDEO_WORKER_SECRET  — shared secret for Modal auth
 *
 * Cache behaviour:
 *   On first export: runs Modal, stores (exportKey, settingsHash) on the output record.
 *   On re-download with same settings: returns signed URL for the cached R2 file — no Modal call.
 *   On re-download with changed settings: re-runs Modal, overwrites R2 file, updates hash.
 */

import { createHash } from "crypto";
import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { internal, api } from "./_generated/api";
import { r2 } from "./r2storage";

const SETTINGS_VALIDATOR = v.object({
  enabled: v.boolean(),
  x: v.number(),
  y: v.number(),
  fontSize: v.number(),
  fontFamily: v.string(),
  textColor: v.string(),
  highlightColor: v.string(),
  highlightBg: v.string(),
  wordsPerLine: v.number(),
});

export const exportWithSubtitles = action({
  args: {
    outputId: v.optional(v.id("outputs")), // used for cache lookup/save
    clipKey: v.string(),
    clipTitle: v.string(),
    subtitleWords: v.array(
      v.object({ text: v.string(), startMs: v.number(), endMs: v.number() }),
    ),
    settings: SETTINGS_VALIDATOR,
  },
  handler: async (ctx, { outputId, clipKey, clipTitle, subtitleWords, settings }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const workerUrl = process.env.BURN_SUBTITLES_URL;
    const workerSecret = process.env.VIDEO_WORKER_SECRET ?? "";
    if (!workerUrl) throw new Error("BURN_SUBTITLES_URL env var is not set");

    const exportKey = `exports/${clipKey.replace(/\.mp4$/, "")}-subtitled.mp4`;

    // Settings hash — first 16 hex chars of SHA-256, enough for uniqueness
    const settingsHash = createHash("sha256")
      .update(JSON.stringify(settings))
      .digest("hex")
      .slice(0, 16);

    // ── Cache check ────────────────────────────────────────────────────────────
    if (outputId) {
      const output = await ctx.runQuery(internal.outputs.getOutput, { outputId });
      if (output?.exportKey === exportKey && output?.exportSettingsHash === settingsHash) {
        // Cache hit — same settings, same file — skip Modal entirely
        const downloadUrl = await r2.getUrl(exportKey, { expiresIn: 60 * 60 });
        return { downloadUrl };
      }
    }

    // ── Cache miss — call Modal ────────────────────────────────────────────────
    // Signed GET URL so Modal can download the clip
    const clipUrl = await r2.getUrl(clipKey, { expiresIn: 60 * 60 });

    // Presigned PUT URL for the export output (deterministic key → overwrites old export)
    const { url: uploadUrl } = await r2.generateUploadUrl(exportKey);

    // TODO: Determine user plan and set watermark to "" for PRO users.
    const watermark = "shortpurify.com";

    const resp = await fetch(workerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workerSecret,
        clipUrl,
        uploadUrl,
        subtitleWords,
        settings,
        watermark,
      }),
    });

    if (!resp.ok) {
      const txt = await resp.text().catch(() => resp.statusText);
      throw new Error(`Burn worker error ${resp.status}: ${txt}`);
    }

    const result = (await resp.json()) as { ok: boolean; error?: string };
    if (!result.ok) throw new Error(result.error ?? "Burn failed");

    // ── Save cache ─────────────────────────────────────────────────────────────
    if (outputId) {
      await ctx.runMutation(internal.outputs.saveExportCache, {
        outputId,
        exportKey,
        exportSettingsHash: settingsHash,
      });
    }

    const downloadUrl = await r2.getUrl(exportKey, { expiresIn: 60 * 60 });
    return { downloadUrl };
  },
});

/**
 * Internal action called by publishClip handlers to auto-export a clip with
 * subtitles before uploading to social platforms.
 *
 * Returns the exportKey if subtitles were burned (or already cached),
 * or null if subtitles are disabled / no transcript words available.
 */
export const ensureExported = internalAction({
  args: { outputId: v.id("outputs") },
  handler: async (ctx, { outputId }): Promise<string | null> => {
    const output = await ctx.runQuery(internal.outputs.getOutput, { outputId });
    if (!output?.clipKey) return null;

    const project = await ctx.runQuery(api.projects.getProject, { projectId: output.projectId });
    if (!project) return null;

    const settings = project.subtitleSettings;
    if (!settings?.enabled) return null;

    // Derive subtitle words from transcript, offset-adjusted to clip start
    const clipStartMs = (output.startTime ?? 0) * 1000;
    const clipEndMs   = (output.endTime   ?? Infinity) * 1000;
    const subtitleWords = (project.transcriptWords ?? [])
      .filter((w) => w.start >= clipStartMs && w.end <= clipEndMs)
      .map((w) => ({ text: w.text, startMs: w.start - clipStartMs, endMs: w.end - clipStartMs }));

    if (subtitleWords.length === 0) return null;

    const exportKey     = `exports/${output.clipKey.replace(/\.mp4$/, "")}-subtitled.mp4`;
    const settingsHash  = createHash("sha256").update(JSON.stringify(settings)).digest("hex").slice(0, 16);

    // Cache hit — already exported with the same settings
    if (output.exportKey === exportKey && output.exportSettingsHash === settingsHash) {
      return exportKey;
    }

    // Cache miss — run burn worker
    const workerUrl    = process.env.BURN_SUBTITLES_URL;
    const workerSecret = process.env.VIDEO_WORKER_SECRET ?? "";
    if (!workerUrl) return null; // skip silently if worker not configured

    const clipUrl              = await r2.getUrl(output.clipKey, { expiresIn: 60 * 60 });
    const { url: uploadUrl }   = await r2.generateUploadUrl(exportKey);

    const resp = await fetch(workerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workerSecret, clipUrl, uploadUrl, subtitleWords, settings, watermark: "shortpurify.com" }),
    });

    if (!resp.ok) return null; // skip silently — publish will use raw clip

    const result = (await resp.json()) as { ok: boolean };
    if (!result.ok) return null;

    await ctx.runMutation(internal.outputs.saveExportCache, { outputId, exportKey, exportSettingsHash: settingsHash });

    return exportKey;
  },
});
