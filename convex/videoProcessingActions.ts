"use node";
/**
 * videoProcessingActions.ts
 *
 * Calls the Modal Python worker (smart_crop_active_speaker) to process clips.
 * Processed clips are stored in Cloudflare R2 — the worker PUTs directly to
 * presigned R2 URLs generated here before each call.
 *
 * Required env vars in Convex dashboard:
 *   VIDEO_WORKER_URL     — e.g. https://username--shortpurify-process-video.modal.run
 *   VIDEO_WORKER_SECRET  — shared secret set in Modal WORKER_SECRET env var
 *   R2_BUCKET / R2_ENDPOINT / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY — R2 creds
 */

import { ConvexError, v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { r2 } from "./r2storage";

interface WorkerResponse {
  ok: boolean;
  thumbnailUploaded?: boolean;
  error?: string;
}

async function callWorker(
  videoUrl: string,
  startTime: number,
  endTime: number,
  projectId: string,
  clipIndex: number,
  clipUploadUrl: string,
  thumbUploadUrl: string,
  cropMode: string = "smart_crop",
): Promise<WorkerResponse> {
  const workerUrl = process.env.VIDEO_WORKER_URL;
  const workerSecret = process.env.VIDEO_WORKER_SECRET ?? "";

  if (!workerUrl) {
    throw new ConvexError("VIDEO_WORKER_URL env var is not set");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8 * 60 * 1000); // 8 min timeout per clip

  try {
    const res = await fetch(workerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        videoUrl,
        startTime,
        endTime,
        projectId,
        clipIndex,
        workerSecret,
        clipUploadUrl,
        thumbUploadUrl,
        cropMode,
      }),
    });

    if (!res.ok) {
      throw new ConvexError(`Worker HTTP ${res.status}: ${await res.text()}`);
    }
    return res.json() as Promise<WorkerResponse>;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Processes all AI-identified clips via the Python worker and saves them
 * to the outputs table. Clips are stored directly in Cloudflare R2.
 */
export const saveClipsToDb = internalAction({
  args: {
    projectId: v.id("projects"),
    videoUrl: v.string(),
    cropMode: v.optional(v.string()),
    clips: v.array(
      v.object({
        title: v.string(),
        startTime: v.number(),
        endTime: v.number(),
        duration: v.optional(v.number()),
        viralScore: v.number(),
        platform: v.string(),
        reason: v.optional(v.string()),
        captions: v.record(v.string(), v.string()),
      }),
    ),
  },
  handler: async (ctx, { projectId, videoUrl, clips, cropMode = "smart_crop" }) => {
    // Generate R2 presigned upload URLs for all clips before dispatching workers.
    const presigned = await Promise.all(
      clips.map(async (_, i) => {
        const clipKey = `${projectId}-clip${i}.mp4`;
        const thumbKey = `${projectId}-clip${i}-thumb.jpg`;
        const { url: clipUploadUrl } = await r2.generateUploadUrl(clipKey);
        const { url: thumbUploadUrl } = await r2.generateUploadUrl(thumbKey);
        return { clipKey, thumbKey, clipUploadUrl, thumbUploadUrl };
      }),
    );

    // Process clips in batches of 3 — avoids overwhelming Modal with cold-start requests.
    // Clips are saved to DB immediately after each batch so they appear in the UI progressively.
    const BATCH_SIZE = 3;
    const totalBatches = Math.ceil(clips.length / BATCH_SIZE);
    let savedCount = 0;
    let firstThumbnail: string | undefined;

    for (let batchStart = 0; batchStart < clips.length; batchStart += BATCH_SIZE) {
      const batchNum = Math.floor(batchStart / BATCH_SIZE) + 1;

      const label = cropMode === "blur_background"
        ? `Processing clips (blur + FFmpeg)… ${savedCount}/${clips.length} done`
        : `Processing clips (AI crop + FFmpeg)… ${savedCount}/${clips.length} done`;

      await ctx.runMutation(internal.projects.updateProjectStatus, {
        projectId,
        status: "processing",
        processingStep: totalBatches > 1
          ? `${label} — batch ${batchNum}/${totalBatches}`
          : label,
      });

      const batch = clips.slice(batchStart, batchStart + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map(async (clip, batchIdx) => {
          const i = batchStart + batchIdx;
          const { clipKey, thumbKey, clipUploadUrl, thumbUploadUrl } = presigned[i];
          try {
            const result = await callWorker(
              videoUrl,
              clip.startTime,
              clip.endTime,
              projectId,
              i,
              clipUploadUrl,
              thumbUploadUrl,
              cropMode,
            );
            return { clip, i, result, clipKey, thumbKey };
          } catch (err) {
            console.error(`Worker threw for clip ${i} ("${clip.title}"): ${err}`);
            return {
              clip,
              i,
              result: { ok: false, error: String(err) } as WorkerResponse,
              clipKey,
              thumbKey,
            };
          }
        }),
      );

      // Save each successful clip immediately — makes them appear in the UI as batches complete
      for (const { clip, i, result, clipKey, thumbKey } of batchResults) {
        if (!result.ok) {
          console.error(`Clip ${i} ("${clip.title}") failed: ${result.error}`);
          continue;
        }

        const clipUrl = await r2.getUrl(clipKey, { expiresIn: 60 * 60 * 24 * 7 });
        const thumbnailUrl =
          result.thumbnailUploaded !== false
            ? await r2.getUrl(thumbKey, { expiresIn: 60 * 60 * 24 * 7 })
            : undefined;

        await ctx.runMutation(internal.outputs.saveOutput, {
          projectId,
          title: clip.title,
          platform: clip.platform,
          content: clip.captions[clip.platform] ?? Object.values(clip.captions)[0] ?? "",
          captions: clip.captions,
          viralScore: clip.viralScore,
          clipUrl,
          clipKey,
          thumbnailUrl,
          thumbnailKey: result.thumbnailUploaded !== false ? thumbKey : undefined,
          startTime: clip.startTime,
          endTime: clip.endTime,
        });

        savedCount++;

        if (!firstThumbnail && thumbnailUrl) {
          firstThumbnail = thumbnailUrl;
          await ctx.runMutation(internal.projects.updateProjectStatus, {
            projectId,
            status: "processing",
            thumbnailUrl: firstThumbnail,
            thumbnailKey: result.thumbnailUploaded !== false ? thumbKey : undefined,
          });
        }
      }
    }
  },
});

/**
 * Runs after user approves clips in review mode.
 * Processes clips via the Modal worker, marks the project complete, then cleans up the original video.
 */
export const runApprovedClips = internalAction({
  args: {
    projectId: v.id("projects"),
    videoUrl: v.string(),
    clips: v.array(v.object({
      title: v.string(),
      startTime: v.number(),
      endTime: v.number(),
      viralScore: v.number(),
      platform: v.string(),
      reason: v.optional(v.string()),
      captions: v.record(v.string(), v.string()),
    })),
    cropMode: v.optional(v.string()),
  },
  handler: async (ctx, { projectId, videoUrl, clips, cropMode }) => {
    try {
      await ctx.runAction(internal.videoProcessingActions.saveClipsToDb, {
        projectId,
        videoUrl,
        clips,
        cropMode,
      });

      await ctx.runMutation(internal.projects.updateProjectStatus, {
        projectId,
        status: "complete",
        processingStep: "Complete",
        clipsCount: clips.length,
      });
    } catch (err) {
      const msg = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
      console.error(`[review] runApprovedClips failed for ${projectId}: ${msg}`);
      await ctx.runMutation(internal.projects.updateProjectStatus, {
        projectId,
        status: "failed",
        processingStep: "Processing failed — please try again",
      });
    }

    try {
      await ctx.runAction(internal.r2Actions.deleteOriginalVideo, { projectId });
    } catch (err) {
      console.warn(`[review] deleteOriginalVideo failed (non-fatal):`, err);
    }
  },
});
