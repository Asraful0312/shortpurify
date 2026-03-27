import { v } from "convex/values";
import { internalQuery, mutation, query } from "./_generated/server";

/**
 * Called from the client (SyncUser component) right after Clerk login.
 * Creates the user row on first login; updates name/image on subsequent logins.
 * Returns { userId, isNew } — the client uses isNew to trigger workspace auto-creation.
 */
export const upsertUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        email: args.email,
        name: args.name,
        imageUrl: args.imageUrl,
      });
      return { userId: existing._id, isNew: false };
    }

    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      imageUrl: args.imageUrl,
      createdAt: Date.now(),
    });

    return { userId, isNew: true };
  },
});

/** Internal: look up a user by their Clerk ID. Used by server-side actions. */
export const getUserByClerkId = internalQuery({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();
  },
});

/**
 * Returns the currently signed-in user's Convex row, or null if unauthenticated.
 * Uses the Clerk JWT passed automatically by ConvexProviderWithClerk.
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
  },
});
