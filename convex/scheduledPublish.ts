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
import { Id } from "./_generated/dataModel";


export const schedulePost = mutation({
  args: {
    outputId: v.id("outputs"),
    platform: v.string(),
    accountId: v.string(),
    caption: v.string(),
    scheduledAt: v.number(), // ms timestamp
    clipTitle: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new ConvexError("User not found");

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
      } else if (post.platform === "x") {
        const r = await ctx.runAction(internal.xActions.publishClipInternal, {
          userId: post.userId as Id<"users">,
          outputId: post.outputId as Id<"outputs">,
          accountId: post.accountId,
          caption: post.caption,
          title: post.clipTitle,
        });
        postId = r.tweetId;
      } else if (post.platform === "bluesky") {
        const r = await ctx.runAction(internal.blueskyActions.publishClipInternal, {
          userId: post.userId as Id<"users">,
          outputId: post.outputId as Id<"outputs">,
          accountId: post.accountId,
          caption: post.caption,
          title: post.clipTitle,
        });
        postId = r.postId;
      } else if (post.platform === "tiktok") {
        const r = await ctx.runAction(internal.tiktokActions.publishClipInternal, {
          userId: post.userId as Id<"users">,
          outputId: post.outputId as Id<"outputs">,
          accountId: post.accountId,
          caption: post.caption,
          title: post.clipTitle,
        });
        postId = r.publishId;
      } else {
        throw new ConvexError(`Platform "${post.platform}" scheduled publishing not supported`);
      }

      await ctx.runMutation(internal.scheduledPublish.updatePost, {
        scheduledPostId,
        status: "published",
        postId,
      });
    } catch (err) {
      await ctx.runMutation(internal.scheduledPublish.updatePost, {
        scheduledPostId,
        status: "failed",
        error: err instanceof Error ? err.message : "Unknown error",
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

    await ctx.db.patch(scheduledPostId, { status: "cancelled" });
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

export const updatePost = internalMutation({
  args: {
    scheduledPostId: v.id("scheduledPosts"),
    status: v.union(v.literal("published"), v.literal("failed")),
    postId: v.optional(v.string()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, { scheduledPostId, status, postId, error }) => {
    await ctx.db.patch(scheduledPostId, { status, postId, error });
  },
});
