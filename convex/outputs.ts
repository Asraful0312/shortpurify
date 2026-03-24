import { v } from "convex/values";
import { internalMutation, internalQuery, query } from "./_generated/server";

/** Get all clips for a project, ordered by viral score descending. */
export const listProjectOutputs = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const outputs = await ctx.db
      .query("outputs")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();

    return outputs.sort((a, b) => (b.viralScore ?? 0) - (a.viralScore ?? 0));
  },
});

/** Look up a single output record (used by exportActions for cache checks). */
export const getOutput = internalQuery({
  args: { outputId: v.id("outputs") },
  handler: async (ctx, { outputId }) => ctx.db.get(outputId),
});

/** Save publish status + request/job IDs after kicking off a social publish. */
export const savePublishInfo = internalMutation({
  args: {
    outputId: v.id("outputs"),
    publishStatus: v.union(v.literal("pending"), v.literal("success"), v.literal("failed")),
    publishRequestId: v.optional(v.string()),
    publishJobId: v.optional(v.string()),
  },
  handler: async (ctx, { outputId, publishStatus, publishRequestId, publishJobId }) => {
    await ctx.db.patch(outputId, {
      publishStatus,
      publishedAt: Date.now(),
      ...(publishRequestId !== undefined && { publishRequestId }),
      ...(publishJobId !== undefined && { publishJobId }),
    });
  },
});

/** Persist the export cache key + settings hash after a successful Modal export. */
export const saveExportCache = internalMutation({
  args: {
    outputId: v.id("outputs"),
    exportKey: v.string(),
    exportSettingsHash: v.string(),
  },
  handler: async (ctx, { outputId, exportKey, exportSettingsHash }) => {
    await ctx.db.patch(outputId, { exportKey, exportSettingsHash });
  },
});

/** Save a single generated clip. Called by videoProcessingActions inside the workflow. */
export const saveOutput = internalMutation({
  args: {
    projectId: v.id("projects"),
    title: v.string(),
    platform: v.string(),
    content: v.string(),
    captions: v.optional(v.record(v.string(), v.string())),
    viralScore: v.optional(v.number()),
    clipUrl: v.string(),
    thumbnailUrl: v.optional(v.string()),
    clipKey: v.optional(v.string()),
    thumbnailKey: v.optional(v.string()),
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("outputs", {
      projectId: args.projectId,
      title: args.title,
      platform: args.platform,
      content: args.content,
      captions: args.captions,
      viralScore: args.viralScore,
      clipUrl: args.clipUrl,
      thumbnailUrl: args.thumbnailUrl,
      clipKey: args.clipKey,
      thumbnailKey: args.thumbnailKey,
      startTime: args.startTime,
      endTime: args.endTime,
    });
  },
});
