import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/** Submit or update the current user's review. */
export const submitReview = mutation({
  args: {
    rating: v.number(),
    reviewText: v.string(),
    authorName: v.string(),
    authorRole: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    if (args.rating < 1 || args.rating > 5) throw new Error("Rating must be 1-5");
    if (!args.reviewText.trim()) throw new Error("Review text is required");

    // One review per user — update if already exists
    const existing = await ctx.db
      .query("reviews")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        rating: args.rating,
        reviewText: args.reviewText.trim(),
        authorName: args.authorName.trim(),
        authorRole: args.authorRole?.trim(),
      });
      return existing._id;
    }

    // Auto-approve 4-5 star reviews; hold 1-3 star for manual review in Convex dashboard
    const approved = args.rating >= 4;
    return await ctx.db.insert("reviews", {
      userId: user._id,
      rating: args.rating,
      reviewText: args.reviewText.trim(),
      authorName: args.authorName.trim(),
      authorRole: args.authorRole?.trim(),
      approved,
      createdAt: Date.now(),
    });
  },
});

/** Returns the current user's review, or null if they haven't reviewed yet. */
export const getMyReview = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return null;
    return ctx.db.query("reviews").withIndex("by_user", (q) => q.eq("userId", user._id)).unique();
  },
});

/** Public query — returns all approved reviews (shown on landing page). */
export const getApprovedReviews = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db
      .query("reviews")
      .withIndex("by_approved", (q) => q.eq("approved", true))
      .order("desc")
      .collect();
  },
});
