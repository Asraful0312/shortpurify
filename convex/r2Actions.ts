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
 * Delete the original uploaded video from R2 after all clips have been generated.
 * Safe to call for YouTube projects — they have no originalKey, so it's a no-op.
 */
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
