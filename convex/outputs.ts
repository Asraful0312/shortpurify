import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";

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
