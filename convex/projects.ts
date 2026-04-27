import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { action, internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { r2 } from "./r2storage";
import { Id } from "./_generated/dataModel";
import { projectsAggregate } from "./aggregates";
import { creem } from "./billing";
import { PLAN_LIMITS } from "./usage";
import { rateLimiter } from "./rateLimits";

const PRODUCT_PLAN_MAP: Record<string, "pro" | "agency"> = {
  prod_Y9tigUuiNrmSvwHwikJhb: "pro",
  prod_16zm9hSnU7sIDUiL2xnqta: "pro",
  prod_6Dzfw7cKFtti6Ok8XSSMkr: "agency",
  prod_4ys826ufB69smQJCq4kD0o: "agency",
};
function tierFromId(id: string | null | undefined): "starter" | "pro" | "agency" {
  if (!id) return "starter";
  return PRODUCT_PLAN_MAP[id] ?? "starter";
}
function monthStart(): number {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
}

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
    workspaceId: v.optional(v.string()),
    // Duration in minutes — used for pre-flight minute limit check.
    // Pass this when it's known before upload (client-side video element, YouTube info).
    estimatedDurationMinutes: v.optional(v.number()),
    // When true the pipeline pauses after AI analysis so the user can review clips
    reviewMode: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found — please refresh the page");

    // ── Rate limiting ──────────────────────────────────────────────────────────
    const key = user._id;
    const [perMinute, perHour] = await Promise.all([
      rateLimiter.limit(ctx, "createProject", { key }),
      rateLimiter.limit(ctx, "createProjectHourly", { key }),
    ]);
    if (!perMinute.ok) {
      throw new ConvexError("You're creating projects too fast. Please wait a moment and try again.");
    }
    if (!perHour.ok) {
      throw new ConvexError("You've created too many projects this hour. Please try again later.");
    }
    // ─────────────────────────────────────────────────────────────────────────

    // ── Plan limit enforcement ─────────────────────────────────────────────────
    // Check manual granted tier override before hitting Creem
    const now = Date.now();
    const hasOverride = user.grantedTier &&
      (user.grantedTierExpiry == null || user.grantedTierExpiry > now);
    let tier: "starter" | "pro" | "agency";
    if (hasOverride) {
      tier = user.grantedTier as "pro" | "agency";
    } else {
      const entityId = args.workspaceId ?? user._id;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const subscription = await creem.subscriptions.getCurrent(ctx as any, { entityId });
      tier = tierFromId(subscription?.productId ?? null);
    }
    const limits = PLAN_LIMITS[tier];
    const planName = tier === "starter" ? "Free" : tier === "pro" ? "Pro Creator" : "Agency";
    const ms = monthStart();

    const projectsThisMonth = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.gte(q.field("createdAt"), ms))
      .collect();

    // Project count limit
    if (limits.projects !== Infinity && projectsThisMonth.length >= limits.projects) {
      throw new ConvexError(
        `${planName} plan limit of ${limits.projects} projects/month reached. Upgrade to continue.`
      );
    }

    // Minute limit — only enforced when duration is known upfront
    if (args.estimatedDurationMinutes !== undefined) {
      const minutesUsed = Math.round(
        projectsThisMonth.reduce((sum, p) => sum + (p.durationSeconds ?? 0), 0) / 60
      );
      const remaining = limits.minutes - minutesUsed;
      if (args.estimatedDurationMinutes > remaining) {
        throw new ConvexError(
          remaining <= 0
            ? `You've used all ${limits.minutes} video minutes on the ${planName} plan this month.`
            : `This video is ~${args.estimatedDurationMinutes} min but you only have ${remaining} min left this month on the ${planName} plan.`
        );
      }
    }
    // ─────────────────────────────────────────────────────────────────────────

    const projectId = await ctx.db.insert("projects", {
      userId: user._id,
      title: args.title,
      originalUrl: args.originalUrl,
      originalSize: args.originalSize,
      originalKey: args.originalKey,
      enabledPlatforms: args.enabledPlatforms,
      cropMode: args.cropMode,
      workspaceId: args.workspaceId,
      reviewMode: args.reviewMode,
      status: "processing",
      processingStep: "Queued…",
      createdAt: Date.now(),
    });

    // Maintain aggregate
    const doc = await ctx.db.get(projectId);
    await projectsAggregate.insert(ctx, doc!);

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

/**
 * List all projects visible in a workspace:
 *   - Projects explicitly tagged with this workspaceId
 *   - Personal projects owned by any workspace member
 *
 * Server-side: verifies the caller is actually a member before returning data.
 */
export const listWorkspaceProjects = query({
  args: { workspaceId: v.string() },
  handler: async (ctx, { workspaceId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    // Server-side membership check
    const callerMembership = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_clerk_workspace", (q) =>
        q.eq("clerkId", identity.subject).eq("workspaceId", workspaceId)
      )
      .unique();
    if (!callerMembership) return [];

    // Only return projects explicitly tagged with this workspace
    return await ctx.db
      .query("projects")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .order("desc")
      .collect();
  },
});

/** Paginated list of the current user's projects, newest first. */
export const listUserProjectsPaginated = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { page: [], isDone: true, continueCursor: "" };

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return { page: [], isDone: true, continueCursor: "" };

    return await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

/** Paginated list of workspace projects, newest first. */
export const listWorkspaceProjectsPaginated = query({
  args: { workspaceId: v.string(), paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { page: [], isDone: true, continueCursor: "" };

    const callerMembership = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_clerk_workspace", (q) =>
        q.eq("clerkId", identity.subject).eq("workspaceId", args.workspaceId)
      )
      .unique();
    if (!callerMembership) return { page: [], isDone: true, continueCursor: "" };

    return await ctx.db
      .query("projects")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

/** Get a single project by ID. */
export const getProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    return await ctx.db.get(projectId);
  },
});

/** Save transcript data (text + words + duration) after step 1. */
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
    durationSeconds: v.optional(v.number()),
  },
  handler: async (ctx, { projectId, transcriptText, transcriptWords, durationSeconds }) => {
    await ctx.db.patch(projectId, { transcriptText, transcriptWords, durationSeconds });
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
      template: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { projectId, settings }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const project = await ctx.db.get(projectId);
    if (!project) throw new Error("Project not found");

    // Allow project owner or workspace admin/owner
    const isOwner = project.userId === user._id;
    if (!isOwner && project.workspaceId) {
      const membership = await ctx.db
        .query("workspaceMembers")
        .withIndex("by_clerk_workspace", (q) =>
          q.eq("clerkId", identity.subject).eq("workspaceId", project.workspaceId!)
        )
        .unique();
      if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
        throw new Error("Not authorized");
      }
    } else if (!isOwner) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(projectId, { subtitleSettings: settings });
  },
});

/**
 * Rename a project. Allowed for:
 *   - The project owner (personal project)
 *   - Workspace owner or admin (workspace project)
 * Regular workspace members are rejected server-side.
 */
export const renameProject = mutation({
  args: { projectId: v.id("projects"), title: v.string() },
  handler: async (ctx, { projectId, title }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    const trimmed = title.trim();
    if (!trimmed) throw new ConvexError("Title cannot be empty");
    if (trimmed.length > 120) throw new ConvexError("Title too long");

    const project = await ctx.db.get(projectId);
    if (!project) throw new ConvexError("Project not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new ConvexError("User not found");

    const isProjectOwner = project.userId === user._id;

    if (!isProjectOwner) {
      if (project.workspaceId) {
        const membership = await ctx.db
          .query("workspaceMembers")
          .withIndex("by_clerk_workspace", (q) =>
            q.eq("clerkId", identity.subject).eq("workspaceId", project.workspaceId!)
          )
          .unique();
        if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
          throw new ConvexError("Only workspace owners and admins can rename projects");
        }
      } else {
        throw new ConvexError("Not authorized to rename this project");
      }
    }

    await ctx.db.patch(projectId, { title: trimmed });
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

    // Server-side auth: must be project owner or workspace admin/owner
    const user = await ctx.runQuery(internal.users.getUserByClerkId, { clerkId: identity.subject });
    if (!user) throw new Error("User not found");

    const isProjectOwner = project.userId === user._id;
    if (!isProjectOwner) {
      if (project.workspaceId) {
        const membership = await ctx.runQuery(internal.workspaceMembers.getMembership, {
          workspaceId: project.workspaceId,
          clerkId: identity.subject,
        });
        if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
          throw new Error("Not authorized to delete this project");
        }
      } else {
        throw new Error("Not authorized to delete this project");
      }
    }

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

    // Remove project from aggregate before deleting
    const projectDoc = await ctx.db.get(projectId);
    if (projectDoc) await projectsAggregate.delete(ctx, projectDoc);
    await ctx.db.delete(projectId);
  },
});

/**
 * Delete all projects in a workspace. Owner-only.
 * Re-uses the deleteProject action per project to clean up R2 files too.
 */
export const deleteAllWorkspaceProjects = action({
  args: { workspaceId: v.string() },
  handler: async (ctx, { workspaceId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Verify caller is workspace owner
    const membership = await ctx.runQuery(internal.workspaceMembers.getMembership, {
      workspaceId,
      clerkId: identity.subject,
    });
    if (!membership || membership.role !== "owner") throw new Error("Not authorized");

    const projects = await ctx.runQuery(api.projects.listWorkspaceProjects, { workspaceId });
    for (const project of projects) {
      await ctx.runAction(api.projects.deleteProject, { projectId: project._id });
    }
  },
});

/** Used internally by the workflow to update project status & step label. */
export const updateProjectStatus = internalMutation({
  args: {
    projectId: v.id("projects"),
    status: v.union(
      v.literal("uploading"),
      v.literal("processing"),
      v.literal("awaiting_review"),
      v.literal("complete"),
      v.literal("failed"),
    ),
    processingStep: v.optional(v.string()),
    clipsCount: v.optional(v.number()),
    workflowId: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    thumbnailKey: v.optional(v.string()),
  },
  handler: async (
    ctx,
    { projectId, status, processingStep, clipsCount, workflowId, thumbnailUrl, thumbnailKey },
  ) => {
    // Only fetch old doc when sumValue (clipsCount) is changing — avoids unnecessary reads
    const oldDoc = clipsCount !== undefined ? await ctx.db.get(projectId) : null;
    const patch: Record<string, unknown> = { status };
    if (processingStep !== undefined) patch.processingStep = processingStep;
    if (clipsCount !== undefined) patch.clipsCount = clipsCount;
    if (workflowId !== undefined) patch.workflowId = workflowId;
    if (thumbnailUrl !== undefined) patch.thumbnailUrl = thumbnailUrl;
    if (thumbnailKey !== undefined) patch.thumbnailKey = thumbnailKey;
    await ctx.db.patch(projectId, patch);
    if (oldDoc) {
      const newDoc = await ctx.db.get(projectId);
      // replaceOrInsert handles the edge case where the aggregate entry is missing
      await projectsAggregate.replaceOrInsert(ctx, oldDoc, newDoc!);
    }
  },
});

/** Returns the R2 key for the project thumbnail — from the project record, or first output fallback. */
export const resolveProjectThumbnailKey = internalQuery({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }): Promise<string | null> => {
    const project = await ctx.db.get(projectId);
    if (!project) return null;
    // New projects store key directly
    if (project.thumbnailKey) return project.thumbnailKey;
    // Old projects: find first output with a thumbnailKey
    const output = await ctx.db
      .query("outputs")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .filter((q) => q.neq(q.field("thumbnailKey"), undefined))
      .first();
    return output?.thumbnailKey ?? null;
  },
});

/** Patches the project's thumbnail URL (and key) after a refresh. */
export const patchThumbnailUrl = internalMutation({
  args: { projectId: v.id("projects"), thumbnailUrl: v.string(), thumbnailKey: v.string() },
  handler: async (ctx, { projectId, thumbnailUrl, thumbnailKey }) => {
    await ctx.db.patch(projectId, { thumbnailUrl, thumbnailKey });
  },
});

const pendingClipSchema = v.object({
  title: v.string(),
  startTime: v.number(),
  endTime: v.number(),
  viralScore: v.number(),
  platform: v.string(),
  reason: v.optional(v.string()),
  captions: v.record(v.string(), v.string()),
});

/** Called by the workflow when reviewMode=true — saves AI clip suggestions and pauses pipeline. */
export const savePendingClips = internalMutation({
  args: {
    projectId: v.id("projects"),
    clips: v.array(pendingClipSchema),
  },
  handler: async (ctx, { projectId, clips }) => {
    await ctx.db.patch(projectId, {
      status: "awaiting_review",
      pendingClips: clips,
      processingStep: "Waiting for your review…",
    });
  },
});

/** Called by the user from the review UI — submits approved (possibly edited) clips for Modal processing. */
export const approveClipsAndProcess = mutation({
  args: {
    projectId: v.id("projects"),
    clips: v.array(pendingClipSchema),
  },
  handler: async (ctx, { projectId, clips }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const project = await ctx.db.get(projectId);
    if (!project) throw new Error("Project not found");
    if (project.status !== "awaiting_review") throw new Error("Project is not awaiting review");

    // Verify ownership
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user || project.userId !== user._id) throw new Error("Unauthorized");

    await ctx.db.patch(projectId, {
      status: "processing",
      pendingClips: undefined,
      processingStep: "Starting clip processing…",
    });

    await ctx.scheduler.runAfter(0, internal.videoProcessingActions.runApprovedClips, {
      projectId,
      videoUrl: project.originalUrl,
      clips,
      cropMode: project.cropMode,
    });
  },
});
