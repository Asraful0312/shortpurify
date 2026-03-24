import { v } from "convex/values";
import { internalMutation, internalQuery, query } from "./_generated/server";

const OAUTH_STATE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// ─── OAuth state (CSRF protection) ───────────────────────────────────────────

/** Store a random state token before redirecting to OAuth provider. */
export const saveOAuthState = internalMutation({
  args: {
    token: v.string(),
    userId: v.id("users"),
    platform: v.string(),
  },
  handler: async (ctx, { token, userId, platform }) => {
    // Clean up expired states while we're here
    const expired = await ctx.db
      .query("oauthStates")
      .filter((q) => q.lt(q.field("createdAt"), Date.now() - OAUTH_STATE_TTL_MS))
      .collect();
    await Promise.all(expired.map((s) => ctx.db.delete(s._id)));

    await ctx.db.insert("oauthStates", { token, userId, platform, createdAt: Date.now() });
  },
});

/**
 * Verify and consume a state token.
 * Returns the state record if valid, null if expired or not found.
 * Deletes the record so it can only be used once.
 */
export const consumeOAuthState = internalMutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const state = await ctx.db
      .query("oauthStates")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();

    if (!state) return null;
    await ctx.db.delete(state._id);

    // Reject if expired
    if (Date.now() - state.createdAt > OAUTH_STATE_TTL_MS) return null;

    return { userId: state.userId, platform: state.platform };
  },
});

// ─── Social tokens (connected accounts) ──────────────────────────────────────

/** Upsert a connected social account token. */
export const saveSocialToken = internalMutation({
  args: {
    userId: v.id("users"),
    platform: v.string(),
    accountId: v.string(),
    accountName: v.string(),
    accountPicture: v.optional(v.string()),
    accessToken: v.string(),
    refreshToken: v.optional(v.string()),
    tokenExpiry: v.optional(v.number()),
    scope: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("socialTokens")
      .withIndex("by_user_platform_account", (q) =>
        q.eq("userId", args.userId).eq("platform", args.platform).eq("accountId", args.accountId)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        accountName: args.accountName,
        accountPicture: args.accountPicture,
        accessToken: args.accessToken,
        refreshToken: args.refreshToken ?? existing.refreshToken,
        tokenExpiry: args.tokenExpiry,
        scope: args.scope,
      });
    } else {
      await ctx.db.insert("socialTokens", args);
    }
  },
});

/** Update only the access token + expiry after a token refresh. */
export const updateToken = internalMutation({
  args: {
    userId: v.id("users"),
    platform: v.string(),
    accountId: v.string(),
    accessToken: v.string(),
    tokenExpiry: v.number(),
  },
  handler: async (ctx, { userId, platform, accountId, accessToken, tokenExpiry }) => {
    const token = await ctx.db
      .query("socialTokens")
      .withIndex("by_user_platform_account", (q) =>
        q.eq("userId", userId).eq("platform", platform).eq("accountId", accountId)
      )
      .unique();
    if (token) await ctx.db.patch(token._id, { accessToken, tokenExpiry });
  },
});

/** Get a specific account's token (used when publishing). */
export const getToken = internalQuery({
  args: {
    userId: v.id("users"),
    platform: v.string(),
    accountId: v.string(),
  },
  handler: async (ctx, { userId, platform, accountId }) => {
    return await ctx.db
      .query("socialTokens")
      .withIndex("by_user_platform_account", (q) =>
        q.eq("userId", userId).eq("platform", platform).eq("accountId", accountId)
      )
      .unique();
  },
});

/** Get all connected accounts for a user on a specific platform. */
export const getTokensByPlatform = internalQuery({
  args: { userId: v.id("users"), platform: v.string() },
  handler: async (ctx, { userId, platform }) => {
    return await ctx.db
      .query("socialTokens")
      .withIndex("by_user_platform", (q) =>
        q.eq("userId", userId).eq("platform", platform)
      )
      .collect();
  },
});

/** Get all connected accounts for a user across all platforms (for UI). */
export const getAllTokens = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return [];

    const tokens = await ctx.db
      .query("socialTokens")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Return safe fields only (never expose accessToken to client)
    return tokens.map((t) => ({
      id: t._id,
      platform: t.platform,
      accountId: t.accountId,
      accountName: t.accountName,
      accountPicture: t.accountPicture,
      tokenExpiry: t.tokenExpiry,
      isExpired: t.tokenExpiry ? t.tokenExpiry < Date.now() : false,
    }));
  },
});

/** Delete a connected account (disconnect). */
export const deleteToken = internalMutation({
  args: {
    userId: v.id("users"),
    platform: v.string(),
    accountId: v.string(),
  },
  handler: async (ctx, { userId, platform, accountId }) => {
    const token = await ctx.db
      .query("socialTokens")
      .withIndex("by_user_platform_account", (q) =>
        q.eq("userId", userId).eq("platform", platform).eq("accountId", accountId)
      )
      .unique();
    if (token) await ctx.db.delete(token._id);
  },
});
