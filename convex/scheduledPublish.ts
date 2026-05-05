/**
 * scheduledPublish.ts — Schedule social posts for future publishing.
 *
 * Flow:
 *   1. Client calls `schedulePost` for each account it wants to schedule.
 *   2. `schedulePost` inserts a scheduledPosts row and queues an
 *      `executeScheduledPost` internalAction via ctx.scheduler.runAt().
 *   3. At the scheduled time Convex calls `executeScheduledPost` which
 *      calls the appropriate platform's `publishClipInternal` action.
 *   4. The row is updated to "published" or "failed".
 */

import { internalAction, internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { ConvexError, v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { Id } from "./_generated/dataModel";
import { scheduledAggregate } from "./aggregates";


export const schedulePost = mutation({
  args: {
    outputId: v.id("outputs"),
    platform: v.string(),
    accountId: v.string(),
    caption: v.string(),
    scheduledAt: v.number(), // ms timestamp
    clipTitle: v.optional(v.string()),
    workspaceId: v.optional(v.string()), // active org from client — required for correct tier resolution
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new ConvexError("User not found");

    // Plan check — use the workspace the client is currently viewing so grantedTier
    // and workspace subscriptions are resolved correctly (per CLAUDE.md).
    const check = await ctx.runQuery(internal.usage.canSchedulePost, {
      userId: user._id,
      workspaceId: args.workspaceId,
    });
    if (!check.allowed) throw new ConvexError(check.reason);

    // Denormalize account display info
    const token = await ctx.db
      .query("socialTokens")
      .withIndex("by_user_platform_account", (q) =>
        q.eq("userId", user._id).eq("platform", args.platform).eq("accountId", args.accountId)
      )
      .unique();

    // Insert the scheduled post row first (so we have an ID to pass to the job)
    const scheduledPostId = await ctx.db.insert("scheduledPosts", {
      userId: user._id,
      outputId: args.outputId,
      platform: args.platform,
      accountId: args.accountId,
      accountName: token?.accountName ?? args.accountId,
      accountPicture: token?.accountPicture,
      clipTitle: args.clipTitle ?? "Short Clip",
      caption: args.caption,
      scheduledAt: args.scheduledAt,
      status: "pending",
      createdAt: Date.now(),
    });

    // Schedule the Convex job
    const jobId = await ctx.scheduler.runAt(
      args.scheduledAt,
      internal.scheduledPublish.executeScheduledPost,
      { scheduledPostId }
    );

    // Save the job ID for cancellation
    await ctx.db.patch(scheduledPostId, { convexJobId: jobId as unknown as string });

    // Maintain aggregate
    const doc = await ctx.db.get(scheduledPostId);
    await scheduledAggregate.insert(ctx, doc!);

    return { scheduledPostId };
  },
});



export const executeScheduledPost = internalAction({
  args: { scheduledPostId: v.id("scheduledPosts") },
  handler: async (ctx, { scheduledPostId }) => {
    const post = await ctx.runQuery(internal.scheduledPublish.getPostById, { scheduledPostId });
    if (!post || post.status !== "pending") return;

    try {
      let postId: string | undefined;

      if (post.platform === "youtube") {
        const r = await ctx.runAction(internal.youtubeActions.publishClipInternal, {
          userId: post.userId as Id<"users">,
          outputId: post.outputId as Id<"outputs">,
          accountId: post.accountId,
          caption: post.caption,
          title: post.clipTitle,
        });
        postId = r.videoId;
      } else if (post.platform === "bluesky") {
        const r = await ctx.runAction(internal.blueskyActions.publishClipInternal, {
          userId: post.userId as Id<"users">,
          outputId: post.outputId as Id<"outputs">,
          accountId: post.accountId,
          caption: post.caption,
          title: post.clipTitle,
        });
        postId = r.postId;
      } else if (["tiktok", "instagram", "linkedin", "facebook", "threads", "twitter"].includes(post.platform)) {
        // Zernio handles TikTok and all Pro platforms — Convex provides the timing,
        // Zernio posts immediately (publishNow: true) when the job fires.
        const r = await ctx.runAction(internal.zernioActions.publishClipInternal, {
          userId: post.userId as Id<"users">,
          outputId: post.outputId as Id<"outputs">,
          accountId: post.accountId,
          platform: post.platform,
          caption: post.caption,
          title: post.clipTitle,
        });
        postId = r.postId;
      } else {
        throw new ConvexError(`Platform "${post.platform}" scheduled publishing not supported`);
      }

      await ctx.runMutation(internal.scheduledPublish.updatePost, {
        scheduledPostId,
        status: "published",
        postId,
      });

      // Send success email if user has notifications enabled
      await ctx.runAction(internal.scheduledPublish.sendPostNotification, {
        scheduledPostId,
        status: "published",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      await ctx.runMutation(internal.scheduledPublish.updatePost, {
        scheduledPostId,
        status: "failed",
        error: errorMessage,
      });

      // Send failure email if user has notifications enabled
      await ctx.runAction(internal.scheduledPublish.sendPostNotification, {
        scheduledPostId,
        status: "failed",
        errorMessage,
      });
    }
  },
});


export const cancelScheduledPost = mutation({
  args: { scheduledPostId: v.id("scheduledPosts") },
  handler: async (ctx, { scheduledPostId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new ConvexError("User not found");

    const post = await ctx.db.get(scheduledPostId);
    if (!post || post.userId !== user._id) throw new ConvexError("Not found");
    if (post.status !== "pending") throw new ConvexError("Can only cancel pending posts");

    // Cancel the Convex scheduled job
    if (post.convexJobId) {
      await ctx.scheduler.cancel(post.convexJobId as unknown as Id<"_scheduled_functions">);
    }

    const oldDoc = await ctx.db.get(scheduledPostId);
    await ctx.db.patch(scheduledPostId, { status: "cancelled" });
    if (oldDoc) {
      const newDoc = await ctx.db.get(scheduledPostId);
      await scheduledAggregate.replace(ctx, oldDoc, newDoc!);
    }
  },
});



export const getScheduledPosts = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return [];

    const posts = await ctx.db
      .query("scheduledPosts")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    // Strip internal fields — return safe subset
    return posts.map((p) => ({
      id: p._id,
      outputId: p.outputId,
      platform: p.platform,
      accountId: p.accountId,
      accountName: p.accountName,
      accountPicture: p.accountPicture,
      clipTitle: p.clipTitle,
      caption: p.caption,
      scheduledAt: p.scheduledAt,
      status: p.status,
      postId: p.postId,
      error: p.error,
      createdAt: p.createdAt,
    }));
  },
});



export const getPostById = internalQuery({
  args: { scheduledPostId: v.id("scheduledPosts") },
  handler: async (ctx, { scheduledPostId }) => ctx.db.get(scheduledPostId),
});

/** Paginated list of the current user's scheduled posts, newest first. */
export const getScheduledPostsPaginated = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { page: [], isDone: true, continueCursor: "" };

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return { page: [], isDone: true, continueCursor: "" };

    const result = await ctx.db
      .query("scheduledPosts")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .paginate(args.paginationOpts);

    return {
      ...result,
      page: result.page.map((p) => ({
        id: p._id,
        outputId: p.outputId,
        platform: p.platform,
        accountId: p.accountId,
        accountName: p.accountName,
        accountPicture: p.accountPicture,
        clipTitle: p.clipTitle,
        caption: p.caption,
        scheduledAt: p.scheduledAt,
        status: p.status,
        postId: p.postId,
        error: p.error,
        createdAt: p.createdAt,
      })),
    };
  },
});

/** Delete a single scheduled post. Cancels the scheduler job if still pending. */
export const deleteScheduledPost = mutation({
  args: { scheduledPostId: v.id("scheduledPosts") },
  handler: async (ctx, { scheduledPostId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new ConvexError("User not found");

    const post = await ctx.db.get(scheduledPostId);
    if (!post || post.userId !== user._id) throw new ConvexError("Not found");

    if (post.status === "pending" && post.convexJobId) {
      try {
        await ctx.scheduler.cancel(post.convexJobId as unknown as Id<"_scheduled_functions">);
      } catch {}
    }

    await scheduledAggregate.delete(ctx, post);
    await ctx.db.delete(scheduledPostId);
  },
});

/** Kick off deletion of all scheduled posts for the current user. */
export const deleteAllScheduledPosts = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new ConvexError("User not found");

    await ctx.scheduler.runAfter(0, internal.scheduledPublish._deletePostsBatch, { userId: user._id });
  },
});

/** Internal: send post notification email if user has it enabled. */
export const sendPostNotification = internalAction({
  args: {
    scheduledPostId: v.id("scheduledPosts"),
    status: v.union(v.literal("published"), v.literal("failed")),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, { scheduledPostId, status, errorMessage }) => {
    const post = await ctx.runQuery(internal.scheduledPublish.getPostById, { scheduledPostId });
    if (!post) return;

    const resolvedUser = await ctx.runQuery(internal.users.getUserById, {
      userId: post.userId as Id<"users">,
    });
    if (!resolvedUser) return;

    // Respect the user's notification preference (default: enabled)
    if (resolvedUser.emailNotifications === false) return;

    await ctx.runAction(internal.emails.sendScheduledPostNotification, {
      toEmail: resolvedUser.email,
      toName: resolvedUser.name,
      clipTitle: post.clipTitle ?? "Short Clip",
      platform: post.platform,
      status,
      scheduledAt: post.scheduledAt,
      errorMessage,
    });
  },
});

/** Internal: delete posts in batches, scheduling itself to continue if needed. */
export const _deletePostsBatch = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const batch = await ctx.db
      .query("scheduledPosts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .take(50);

    for (const post of batch) {
      if (post.status === "pending" && post.convexJobId) {
        try {
          await ctx.scheduler.cancel(post.convexJobId as unknown as Id<"_scheduled_functions">);
        } catch {}
      }
      await scheduledAggregate.delete(ctx, post);
      await ctx.db.delete(post._id);
    }

    if (batch.length === 50) {
      await ctx.scheduler.runAfter(0, internal.scheduledPublish._deletePostsBatch, { userId });
    }
  },
});

export const updatePost = internalMutation({
  args: {
    scheduledPostId: v.id("scheduledPosts"),
    status: v.union(v.literal("published"), v.literal("failed")),
    postId: v.optional(v.string()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, { scheduledPostId, status, postId, error }) => {
    const oldDoc = await ctx.db.get(scheduledPostId);
    await ctx.db.patch(scheduledPostId, { status, postId, error });
    if (oldDoc) {
      const newDoc = await ctx.db.get(scheduledPostId);
      await scheduledAggregate.replace(ctx, oldDoc, newDoc!);
    }
  },
});
