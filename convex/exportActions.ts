"use node";
/**
 * exportActions.ts — Server-side subtitle burn export with R2 caching.
 *
 * Required env vars (at least one worker URL must be set):
 *   BURN_SUBTITLES_CANVAS_URL — node-canvas worker (fast, ~30-90s) — tried first
 *   BURN_SUBTITLES_URL        — Python Modal worker (fallback)
 *   VIDEO_WORKER_SECRET       — shared secret for worker auth
 *
 * Cache behaviour:
 *   On first export: runs worker, stores (exportKey, settingsHash) on the output record.
 *   On re-download with same settings: returns signed URL for the cached R2 file — no worker call.
 *   On re-download with changed settings: re-runs worker, overwrites R2 file, updates hash.
 */

import { createHash } from "crypto";
import { ConvexError, v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { internal, api } from "./_generated/api";
import { r2 } from "./r2storage";

const DEFAULT_SUBTITLE_SETTINGS = {
  enabled: true,
  x: 50, y: 78,
  fontSize: 26,
  fontFamily: "Inter, sans-serif",
  textColor: "#ffffff",
  highlightColor: "#000000",
  highlightBg: "#facc15",
  wordsPerLine: 3,
  template: "classic",
};

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
  template: v.optional(v.string()),
});

// ─── Worker call helper ───────────────────────────────────────────────────────

async function callBurnWorker(url: string, payload: Record<string, unknown>): Promise<void> {
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    const txt = await resp.text().catch(() => resp.statusText);
    throw new Error(`Burn worker error ${resp.status}: ${txt}`);
  }
  const result = (await resp.json()) as { ok: boolean; error?: string };
  if (!result.ok) throw new Error(result.error ?? "Burn failed");
}

/** Tries canvas worker first; falls back to Python worker if canvas URL is set but fails. */
async function burnSubtitles(
  payload: Record<string, unknown>,
  canvasUrl: string | undefined,
  pythonUrl: string | undefined,
): Promise<void> {
  if (canvasUrl) {
    try {
      await callBurnWorker(canvasUrl, payload);
      return;
    } catch (err) {
      if (!pythonUrl) throw err;
      // Canvas failed — fall through to Python worker
    }
  }
  if (pythonUrl) {
    await callBurnWorker(pythonUrl, payload);
    return;
  }
  throw new Error("No burn worker URL configured");
}


export const exportWithSubtitles = action({
  args: {
    outputId: v.optional(v.id("outputs")), // used for cache lookup/save
    clipKey: v.string(),
    clipTitle: v.string(),
    subtitleWords: v.array(
      v.object({ text: v.string(), startMs: v.number(), endMs: v.number() }),
    ),
    settings: SETTINGS_VALIDATOR,
    forceCanvas: v.optional(v.boolean()), // test flag: bypass Python fallback
  },
  handler: async (ctx, { outputId, clipKey, subtitleWords, settings, forceCanvas }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");

    const canvasUrl = undefined; // canvas worker disabled — use Python only
    const pythonUrl = process.env.BURN_SUBTITLES_URL;
    const workerSecret = process.env.VIDEO_WORKER_SECRET ?? "";
    if (!pythonUrl) throw new ConvexError("No burn worker URL configured (set BURN_SUBTITLES_URL)");

    const exportKey = `exports/${clipKey.replace(/\.mp4$/, "")}-subtitled.mp4`;

    // Resolve plan tier BEFORE cache check — affects watermark and template gating.
    // Uses resolveWorkspaceTier internally so grantedTier is respected.
    let isPaid = false;
    let watermark = "shortpurify.com";
    if (outputId) {
      const output = await ctx.runQuery(internal.outputs.getOutput, { outputId });
      const project = output
        ? await ctx.runQuery(api.projects.getProject, { projectId: output.projectId })
        : null;
      if (project) {
        isPaid = await ctx.runQuery(internal.usage.isPaidPlan, {
          workspaceId: project.workspaceId ?? undefined,
          fallbackEntityId: project.userId,
        });
        if (isPaid) watermark = "";
      }
    } else {
      const user = await ctx.runQuery(internal.users.getUserByClerkId, {
        clerkId: identity.subject,
      });
      if (user) {
        isPaid = await ctx.runQuery(internal.usage.isPaidPlan, { fallbackEntityId: user._id });
        if (isPaid) watermark = "";
      }
    }

    // Comic subtitle template is a paid-only feature
    if (settings.template === "comic" && !isPaid) {
      throw new ConvexError(
        "The Comic subtitle template requires a Pro or Agency plan. Upgrade to export with this style."
      );
    }

    // Hash includes watermark so a plan upgrade produces a different hash → cache miss → re-render
    const settingsHash = createHash("sha256")
      .update(JSON.stringify({ ...settings, watermark, v: "15" }))
      .digest("hex")
      .slice(0, 16);

    if (outputId) {
      const output = await ctx.runQuery(internal.outputs.getOutput, { outputId });
      if (output?.exportKey === exportKey && output?.exportSettingsHash === settingsHash) {
        // Cache hit — same settings AND same watermark status — skip worker entirely
        const downloadUrl = await r2.getUrl(exportKey, { expiresIn: 60 * 60 });
        return { downloadUrl };
      }

      // Cache miss — check burn limit before calling worker
      if (output) {
        const project = await ctx.runQuery(api.projects.getProject, { projectId: output.projectId });
        if (project) {
          const burnLimit = await ctx.runQuery(internal.usage.getBurnLimit, {
            workspaceId: project.workspaceId ?? undefined,
            fallbackEntityId: project.userId,
          });
          if (burnLimit !== null && (output.burnCount ?? 0) >= burnLimit) {
            throw new ConvexError(
              `You've used all ${burnLimit} subtitle re-renders on your plan for this clip. Upgrade to Pro Creator for more.`
            );
          }
        }
      }
    }

    // Signed GET URL so worker can download the clip
    const clipUrl = await r2.getUrl(clipKey, { expiresIn: 60 * 60 });

    // Presigned PUT URL for the export output (deterministic key → overwrites old export)
    const { url: uploadUrl } = await r2.generateUploadUrl(exportKey);

    const payload = { workerSecret, clipUrl, uploadUrl, subtitleWords, settings, watermark };
    try {
      if (forceCanvas) {
        if (!canvasUrl) throw new Error("Canvas worker not configured (BURN_SUBTITLES_CANVAS_URL is not set)");
        await callBurnWorker(canvasUrl, payload);
      } else {
        await burnSubtitles(payload, canvasUrl, pythonUrl);
      }
    } catch (err) {
      throw new ConvexError(String(err));
    }

    if (outputId) {
      await ctx.runMutation(internal.outputs.saveExportCache, {
        outputId,
        exportKey,
        exportSettingsHash: settingsHash,
        incrementBurn: true,
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

    const settings = project.subtitleSettings ?? DEFAULT_SUBTITLE_SETTINGS;
    if (!settings.enabled) return null;

    // Derive subtitle words from transcript, offset-adjusted to clip start
    const clipStartMs = (output.startTime ?? 0) * 1000;
    const clipEndMs   = (output.endTime   ?? Infinity) * 1000;
    const subtitleWords = (project.transcriptWords ?? [])
      .filter((w) => w.start >= clipStartMs && w.end <= clipEndMs)
      .map((w) => ({ text: w.text, startMs: w.start - clipStartMs, endMs: w.end - clipStartMs }));

    if (subtitleWords.length === 0) return null;

    const exportKey = `exports/${output.clipKey.replace(/\.mp4$/, "")}-subtitled.mp4`;

    // Resolve watermark BEFORE cache check so plan upgrades invalidate the cached watermarked file
    const paid = await ctx.runQuery(internal.usage.isPaidPlan, {
      workspaceId: project.workspaceId ?? undefined,
      fallbackEntityId: project.userId,
    });
    const watermark = paid ? "" : "shortpurify.com";

    // Hash includes watermark — upgrading from Starter to Pro yields a different hash → cache miss
    const settingsHash = createHash("sha256")
      .update(JSON.stringify({ ...settings, watermark, v: "4" }))
      .digest("hex")
      .slice(0, 16);

    // Cache hit — same settings AND same watermark status
    if (output.exportKey === exportKey && output.exportSettingsHash === settingsHash) {
      return exportKey;
    }

    // Cache miss — run burn worker (silently skip if not configured)
    const canvasUrl = undefined; // canvas worker disabled — use Python only
    const pythonUrl = process.env.BURN_SUBTITLES_URL;
    const workerSecret = process.env.VIDEO_WORKER_SECRET ?? "";
    if (!pythonUrl) return null;

    const clipUrl            = await r2.getUrl(output.clipKey, { expiresIn: 60 * 60 });
    const { url: uploadUrl } = await r2.generateUploadUrl(exportKey);

    const payload = { workerSecret, clipUrl, uploadUrl, subtitleWords, settings, watermark };
    try {
      await burnSubtitles(payload, canvasUrl, pythonUrl);
    } catch {
      return null; // skip silently — publish will use raw clip
    }

    await ctx.runMutation(internal.outputs.saveExportCache, { outputId, exportKey, exportSettingsHash: settingsHash });

    return exportKey;
  },
});
