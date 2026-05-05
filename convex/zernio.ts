/**
 * zernio.ts — Internal Convex queries and mutations for Zernio integration.
 * (No "use node" — queries/mutations cannot run in Node.js environment.)
 */
import { internalMutation, internalQuery, query } from "./_generated/server";
import { v } from "convex/values";

// ─── Internal queries ─────────────────────────────────────────────────────────

export const getProfileByUser = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return ctx.db
      .query("zernioProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
  },
});

/** Webhook variant — look up which user owns a given Zernio profileId. */
export const getProfileOwner = internalQuery({
  args: { profileId: v.string() },
  handler: async (ctx, { profileId }) => {
    return ctx.db
      .query("zernioProfiles")
      .filter((q) => q.eq(q.field("profileId"), profileId))
      .unique();
  },
});

export const getAccountsByUser = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return ctx.db
      .query("zernioAccounts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

// ─── Internal mutations ───────────────────────────────────────────────────────

export const saveProfile = internalMutation({
  args: { userId: v.id("users"), profileId: v.string() },
  handler: async (ctx, { userId, profileId }) => {
    await ctx.db.insert("zernioProfiles", { userId, profileId, createdAt: Date.now() });
  },
});

export const upsertAccount = internalMutation({
  args: {
    userId: v.id("users"),
    profileId: v.string(),
    accountId: v.string(),
    platform: v.string(),
    accountName: v.string(),
    accountPicture: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("zernioAccounts")
      .withIndex("by_user_account", (q) =>
        q.eq("userId", args.userId).eq("accountId", args.accountId)
      )
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, {
        accountName: args.accountName,
        accountPicture: args.accountPicture,
      });
    } else {
      await ctx.db.insert("zernioAccounts", args);
    }
  },
});

export const deleteAccount = internalMutation({
  args: { userId: v.id("users"), accountId: v.string() },
  handler: async (ctx, { userId, accountId }) => {
    const acc = await ctx.db
      .query("zernioAccounts")
      .withIndex("by_user_account", (q) =>
        q.eq("userId", userId).eq("accountId", accountId)
      )
      .unique();
    if (acc) await ctx.db.delete(acc._id);
  },
});

/** Webhook variant — deletes by accountId alone (no userId required). */
export const deleteAccountByAccountId = internalMutation({
  args: { accountId: v.string() },
  handler: async (ctx, { accountId }) => {
    const acc = await ctx.db
      .query("zernioAccounts")
      .withIndex("by_account_id", (q) => q.eq("accountId", accountId))
      .unique();
    if (acc) await ctx.db.delete(acc._id);
  },
});

// ─── Public query ─────────────────────────────────────────────────────────────

/** Returns Zernio-connected accounts for the current user (safe fields only). */
export const getMyAccounts = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return [];

    const accounts = await ctx.db
      .query("zernioAccounts")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return accounts.map((a) => ({
      id: a._id,
      accountId: a.accountId,
      platform: a.platform,
      accountName: a.accountName,
      accountPicture: a.accountPicture,
    }));
  },
});
