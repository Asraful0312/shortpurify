import { v } from "convex/values";
import { action, internalMutation, internalQuery, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { r2 } from "./r2storage";
import { PLAN_LIMITS } from "./usage";

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

/**
 * Generate a fresh signed R2 URL for a clip key.
 * Called when the stored clipUrl has expired (7-day TTL).
 */
export const refreshClipUrl = action({
  args: { clipKey: v.string() },
  handler: async (ctx, { clipKey }): Promise<string> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return r2.getUrl(clipKey, { expiresIn: 60 * 60 * 24 * 7 });
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

/** Persist the export cache key + settings hash after a successful Modal export. Optionally increments burnCount. */
export const saveExportCache = internalMutation({
  args: {
    outputId: v.id("outputs"),
    exportKey: v.string(),
    exportSettingsHash: v.string(),
    incrementBurn: v.optional(v.boolean()),
  },
  handler: async (ctx, { outputId, exportKey, exportSettingsHash, incrementBurn }) => {
    const output = await ctx.db.get(outputId);
    await ctx.db.patch(outputId, {
      exportKey,
      exportSettingsHash,
      ...(incrementBurn && { burnCount: (output?.burnCount ?? 0) + 1 }),
    });
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
  handler: async (ctx, args): Promise<any> => {
    // Resolve user's plan tier to set clip retention expiry
    const project = await ctx.db.get(args.projectId);
    let expiresAt: number | undefined;
    if (project) {
      const tier = await ctx.runQuery(internal.usage.getTierForUser, {
        userId: project.userId,
        workspaceId: project.workspaceId,
      });
      const retentionDays = PLAN_LIMITS[tier].clipRetentionDays;
      if (retentionDays !== Infinity) {
        expiresAt = Date.now() + retentionDays * 24 * 60 * 60 * 1000;
      }
    }

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
      expiresAt,
      createdAt: Date.now(),
    });
  },
});
