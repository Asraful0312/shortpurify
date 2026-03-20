import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Creates a project record and schedules the AI pipeline.
 * Called by the frontend right after UploadThing completes.
 */
export const createProjectAndStart = mutation({
  args: {
    title: v.string(),
    originalUrl: v.string(),
    originalSize: v.optional(v.number()),
    enabledPlatforms: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found — please refresh the page");

    const projectId = await ctx.db.insert("projects", {
      userId: user._id,
      title: args.title,
      originalUrl: args.originalUrl,
      originalSize: args.originalSize,
      enabledPlatforms: args.enabledPlatforms,
      status: "processing",
      processingStep: "Queued…",
      createdAt: Date.now(),
    });

    // Kick off the durable AI pipeline (must run from an action, so we schedule it)
    await ctx.scheduler.runAfter(0, internal.workflow.kickoff, {
      projectId,
      videoUrl: args.originalUrl,
    });

    return projectId;
  },
});

/** List all projects for the current user, newest first. */
export const listUserProjects = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return [];

    return await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

/** Get a single project by ID. */
export const getProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    return await ctx.db.get(projectId);
  },
});

/** Save transcript data (text + words) after step 1. */
export const saveTranscript = internalMutation({
  args: {
    projectId: v.id("projects"),
    transcriptText: v.string(),
    transcriptWords: v.array(
      v.object({
        text: v.string(),
        start: v.number(),
        end: v.number(),
        speaker: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, { projectId, transcriptText, transcriptWords }) => {
    await ctx.db.patch(projectId, { transcriptText, transcriptWords });
  },
});

/** Used internally by the workflow to update project status & step label. */
export const updateProjectStatus = internalMutation({
  args: {
    projectId: v.id("projects"),
    status: v.union(
      v.literal("uploading"),
      v.literal("processing"),
      v.literal("complete"),
      v.literal("failed"),
    ),
    processingStep: v.optional(v.string()),
    clipsCount: v.optional(v.number()),
    workflowId: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
  },
  handler: async (
    ctx,
    { projectId, status, processingStep, clipsCount, workflowId, thumbnailUrl },
  ) => {
    const patch: Record<string, unknown> = { status };
    if (processingStep !== undefined) patch.processingStep = processingStep;
    if (clipsCount !== undefined) patch.clipsCount = clipsCount;
    if (workflowId !== undefined) patch.workflowId = workflowId;
    if (thumbnailUrl !== undefined) patch.thumbnailUrl = thumbnailUrl;
    await ctx.db.patch(projectId, patch);
  },
});
