"use node";
/**
 * r2Actions.ts — Node.js R2 actions.
 * generateUploadUrl:    returns a presigned PUT URL + key for direct browser upload.
 * getServingUrl:        returns a 7-day signed GET URL for a stored R2 key.
 * deleteOriginalVideo:  deletes the original upload from R2 after clip generation.
 */

import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { r2 } from "./r2storage";

export const generateUploadUrl = action({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    return await r2.generateUploadUrl();
  },
});

export const getServingUrl = action({
  args: { key: v.string() },
  handler: async (_ctx, { key }) => {
    return await r2.getUrl(key, { expiresIn: 60 * 60 * 24 * 7 });
  },
});

/**
 * Daily cron handler — deletes R2 files and DB records for expired outputs.
 * Processes up to 100 per run; the cron fires again tomorrow for any remainder.
 */
export const deleteExpiredClips = internalAction({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expired: { _id: string; clipKey?: string; thumbnailKey?: string; exportKey?: string }[] =
      await ctx.runQuery(internal.crons.getExpiredOutputs, { now, limit: 100 });

    if (expired.length === 0) return;
    console.log(`[cron] Deleting ${expired.length} expired clips`);

    for (const output of expired) {
      for (const key of [output.clipKey, output.thumbnailKey, output.exportKey]) {
        if (!key) continue;
        try {
          await r2.deleteObject(ctx, key);
        } catch (err) {
          console.warn(`[cron] R2 delete failed for key ${key}:`, err);
        }
      }
      await ctx.runMutation(internal.crons.deleteOutput, {
        outputId: output._id as import("./_generated/dataModel").Id<"outputs">,
      });
    }

    console.log(`[cron] Expired clip cleanup done — ${expired.length} removed`);
  },
});

export const deleteOriginalVideo = internalAction({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const project = await ctx.runQuery(api.projects.getProject, { projectId });
    if (!project?.originalKey) return; // YouTube URL or already cleaned up

    try {
      await r2.deleteObject(ctx, project.originalKey);
      console.log(`[r2] Deleted original video: ${project.originalKey}`);
    } catch (err) {
      // Non-fatal — log and continue. The clip exports are already done.
      console.warn(`[r2] Could not delete ${project.originalKey}:`, err);
    }

    await ctx.runMutation(internal.projects.clearOriginalKey, { projectId });
  },
});
