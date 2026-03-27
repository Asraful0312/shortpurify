import { v } from "convex/values";
import { action, internalMutation, mutation, query } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { r2 } from "./r2storage";
import { Id } from "./_generated/dataModel";

/**
 * Creates a project record and schedules the AI pipeline.
 * Called by the frontend right after UploadThing completes.
 */
export const createProjectAndStart = mutation({
  args: {
    title: v.string(),
    originalUrl: v.string(),
    originalSize: v.optional(v.number()),
    originalKey: v.optional(v.string()),
    enabledPlatforms: v.optional(v.array(v.string())),
    cropMode: v.optional(v.string()),
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
      originalKey: args.originalKey,
      enabledPlatforms: args.enabledPlatforms,
      cropMode: args.cropMode,
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

/** Persist subtitle style settings for a project (shared across all its clips). */
export const saveSubtitleSettings = mutation({
  args: {
    projectId: v.id("projects"),
    settings: v.object({
      enabled: v.boolean(),
      x: v.number(),
      y: v.number(),
      fontSize: v.number(),
      fontFamily: v.string(),
      textColor: v.string(),
      highlightColor: v.string(),
      highlightBg: v.string(),
      wordsPerLine: v.number(),
    }),
  },
  handler: async (ctx, { projectId, settings }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    await ctx.db.patch(projectId, { subtitleSettings: settings });
  },
});

/** Clear originalKey after the original video has been deleted from R2. */
export const clearOriginalKey = internalMutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    await ctx.db.patch(projectId, { originalKey: undefined });
  },
});

/**
 * Permanently delete a project and all associated data:
 *  - All R2 files (clips, thumbnails, exports, original video)
 *  - All scheduled posts (pending jobs are cancelled)
 *  - All output records
 *  - The project record itself
 */
export const deleteProject = action({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const project = await ctx.runQuery(api.projects.getProject, { projectId });
    if (!project) throw new Error("Project not found");

    // Fetch all outputs so we know which R2 keys to clean up
    const outputs = await ctx.runQuery(api.outputs.listProjectOutputs, { projectId });

    // Delete every R2 file for every output (non-fatal — continue on error)
    for (const output of outputs) {
      for (const key of [output.clipKey, output.thumbnailKey, output.exportKey]) {
        if (key) {
          try { await r2.deleteObject(ctx, key); } catch (e) {
            console.warn("[r2] clip/thumb/export delete failed (non-fatal):", e);
          }
        }
      }
    }

    // Delete the original uploaded video if it's still in R2
    if (project.originalKey) {
      try { await r2.deleteObject(ctx, project.originalKey); } catch (e) {
        console.warn("[r2] original video delete failed (non-fatal):", e);
      }
    }

    // Purge all database records (outputs, scheduled posts, project row)
    await ctx.runMutation(internal.projects.purgeProjectData, { projectId });
  },
});

/** Internal mutation — deletes all DB rows for a project in one transaction. */
export const purgeProjectData = internalMutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const outputs = await ctx.db
      .query("outputs")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();

    for (const output of outputs) {
      // Cancel any pending Convex scheduler jobs and delete the scheduled post rows
      const posts = await ctx.db
        .query("scheduledPosts")
        .filter((q) => q.eq(q.field("outputId"), output._id))
        .collect();

      for (const post of posts) {
        if (post.convexJobId && post.status === "pending") {
          try {
            await ctx.scheduler.cancel(
              post.convexJobId as unknown as Id<"_scheduled_functions">
            );
          } catch {}
        }
        await ctx.db.delete(post._id);
      }

      await ctx.db.delete(output._id);
    }

    await ctx.db.delete(projectId);
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
