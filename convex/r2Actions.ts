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

/**
 * Refreshes the signed thumbnail URL for a project card.
 * Tries project.thumbnailKey first; falls back to the first output's thumbnailKey
 * so existing projects (created before thumbnailKey was stored) also benefit.
 */
export const refreshProjectThumbnail = action({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }): Promise<string | null> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // Resolve the R2 key — project record first, then first output fallback
    const key: string | null = await ctx.runQuery(
      internal.projects.resolveProjectThumbnailKey,
      { projectId },
    );
    if (!key) return null;

    const freshUrl = await r2.getUrl(key, { expiresIn: 60 * 60 * 24 * 7 });
    await ctx.runMutation(internal.projects.patchThumbnailUrl, {
      projectId,
      thumbnailUrl: freshUrl,
      thumbnailKey: key,
    });
    return freshUrl;
  },
});

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

    let succeeded = 0;
    let failed = 0;
    for (const output of expired) {
      try {
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
        succeeded++;
      } catch (err) {
        console.error(`[cron] Failed to delete output ${output._id}:`, err);
        failed++;
      }
    }

    console.log(`[cron] Expired clip cleanup done — ${succeeded} removed, ${failed} failed`);
  },
});

/**
 * Daily cron handler — soft-deletes projects past their expiresAt and cleans up their R2 files.
 * Soft-delete (not hard-delete) preserves the project row so monthly usage counts remain accurate.
 * Limits do not reset on expiry — they only reset on the 1st of each month.
 * Processes up to 50 per run; the cron fires again tomorrow for any remainder.
 */
export const deleteExpiredProjects = internalAction({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expired: {
      _id: string;
      userId: string;
      workspaceId?: string;
      originalKey?: string;
      thumbnailKey?: string;
    }[] = await ctx.runQuery(internal.crons.getExpiredProjects, { now, limit: 50 });

    if (expired.length === 0) return;
    console.log(`[cron] Expiring ${expired.length} projects`);

    let succeeded = 0;
    let skipped = 0;
    let failed = 0;
    for (const project of expired) {
      try {
        // Before deleting, verify the owner is still on a plan that requires this expiry.
        // If they've since upgraded (e.g. starter→pro), clear expiresAt and skip deletion.
        const currentTier = await ctx.runQuery(internal.usage.getTierForUser, {
          userId: project.userId as import("./_generated/dataModel").Id<"users">,
          workspaceId: project.workspaceId,
        });
        if (currentTier !== "starter") {
          await ctx.runMutation(internal.crons.clearProjectExpiry, {
            projectId: project._id as import("./_generated/dataModel").Id<"projects">,
          });
          console.log(`[cron] Skipped project ${project._id} — owner is now on ${currentTier} plan, expiresAt cleared`);
          skipped++;
          continue;
        }

        // Delete project-level R2 files (outputs have their own expiry cron)
        for (const key of [project.originalKey, project.thumbnailKey]) {
          if (!key) continue;
          try {
            await r2.deleteObject(ctx, key);
          } catch (err) {
            console.warn(`[cron] R2 delete failed for key ${key}:`, err);
          }
        }
        // purgeProjectData soft-deletes the project row and hard-deletes outputs/posts
        await ctx.runMutation(internal.projects.purgeProjectData, {
          projectId: project._id as import("./_generated/dataModel").Id<"projects">,
        });
        succeeded++;
      } catch (err) {
        // Catch per-project so one bad row never blocks the rest
        console.error(`[cron] Failed to expire project ${project._id}:`, err);
        failed++;
      }
    }

    console.log(`[cron] Project expiry done — ${succeeded} deleted, ${skipped} upgraded-plan skipped, ${failed} failed`);
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
