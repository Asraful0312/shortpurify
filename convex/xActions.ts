"use node";

import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { ConvexError, v } from "convex/values";
import { Id } from "./_generated/dataModel";
import crypto from "crypto";

const X_AUTH_URL  = "https://twitter.com/i/oauth2/authorize";
const X_TOKEN_URL = "https://api.twitter.com/2/oauth2/token";
const X_API       = "https://api.twitter.com/2";
const X_UPLOAD    = "https://upload.twitter.com/1.1/media/upload.json";
const SCOPES      = "tweet.read tweet.write users.read offline.access media.write";
const CHUNK_SIZE  = 5 * 1024 * 1024; // 5 MB

function callbackUrl() {
  const siteUrl = process.env.CONVEX_SITE_URL;
  if (!siteUrl) throw new Error("CONVEX_SITE_URL not set");
  return `${siteUrl}/oauth/x/callback`;
}

function basicAuth() {
  return Buffer.from(
    `${process.env.X_CLIENT_ID}:${process.env.X_CLIENT_SECRET}`
  ).toString("base64");
}

async function requireUser(ctx: any): Promise<{ _id: Id<"users"> }> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  const user = await ctx.runQuery(internal.users.getUserByClerkId, { clerkId: identity.subject });
  if (!user) throw new Error("User not found");
  return user;
}

async function getValidAccessToken(
  ctx: any,
  userId: Id<"users">,
  accountId: string
): Promise<string> {
  const record = await ctx.runQuery(internal.socialTokens.getToken, {
    userId, platform: "x", accountId,
  });
  if (!record) throw new Error("X account not connected. Please reconnect.");

  // Refresh if expired or within 5 min of expiry
  if (record.tokenExpiry && record.tokenExpiry < Date.now() + 5 * 60 * 1000) {
    if (!record.refreshToken) throw new Error("X session expired. Please reconnect.");

    const res = await fetch(X_TOKEN_URL, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth()}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: record.refreshToken,
      }),
    });
    const data = await res.json() as {
      access_token?: string;
      refresh_token?: string;
      expires_in?: number;
      error?: string;
    };
    if (!data.access_token) throw new Error("Failed to refresh X token. Please reconnect.");

    await ctx.runMutation(internal.socialTokens.saveSocialToken, {
      userId,
      platform: "x",
      accountId,
      accountName: record.accountName,
      accountPicture: record.accountPicture,
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? record.refreshToken,
      tokenExpiry: Date.now() + (data.expires_in ?? 7200) * 1000,
      scope: SCOPES,
    });
    return data.access_token;
  }

  return record.accessToken;
}

// ─── Auth URL ─────────────────────────────────────────────────────────────────

export const getAuthUrl = action({
  args: {},
  handler: async (ctx): Promise<{ authUrl: string }> => {
    const user = await requireUser(ctx);
    const check = await ctx.runQuery(internal.usage.canConnectPlatform, { userId: user._id, platform: "x" });
    if (!check.allowed) throw new ConvexError(check.reason);

    // PKCE — required by X OAuth 2.0
    const codeVerifier  = crypto.randomBytes(32).toString("base64url");
    const codeChallenge = crypto.createHash("sha256").update(codeVerifier).digest("base64url");
    const stateToken    = crypto.randomBytes(16).toString("hex");

    await ctx.runMutation(internal.socialTokens.saveOAuthState, {
      token: stateToken,
      userId: user._id,
      platform: "x",
      codeVerifier,
    });

    const params = new URLSearchParams({
      response_type: "code",
      client_id: process.env.X_CLIENT_ID!,
      redirect_uri: callbackUrl(),
      scope: SCOPES,
      state: stateToken,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });

    return { authUrl: `${X_AUTH_URL}?${params}` };
  },
});

// ─── Callback ─────────────────────────────────────────────────────────────────

export const handleCallback = internalAction({
  args: { code: v.string(), state: v.string() },
  handler: async (ctx, { code, state }) => {
    const stateRecord = await ctx.runMutation(internal.socialTokens.consumeOAuthState, { token: state });
    if (!stateRecord) throw new Error("Invalid or expired OAuth state");
    if (stateRecord.platform !== "x") throw new Error("Platform mismatch");

    const { userId, codeVerifier } = stateRecord;
    if (!codeVerifier) throw new Error("Missing PKCE code verifier");

    // Exchange code for tokens
    const tokenRes = await fetch(X_TOKEN_URL, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth()}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: callbackUrl(),
        code_verifier: codeVerifier,
      }),
    });
    const tokenData = await tokenRes.json() as {
      access_token?: string;
      refresh_token?: string;
      expires_in?: number;
      error?: string;
      error_description?: string;
    };

    if (!tokenData.access_token) {
      throw new Error(`X token exchange failed: ${tokenData.error_description ?? tokenData.error ?? JSON.stringify(tokenData)}`);
    }

    // Get user info
    const userRes = await fetch(
      `${X_API}/users/me?user.fields=profile_image_url,name,username`,
      { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
    );
    const userData = await userRes.json() as {
      data?: { id: string; name: string; username: string; profile_image_url?: string };
      errors?: Array<{ message: string }>;
      status?: number;
    };

    if (!userData.data?.id) {
      throw new Error(`Failed to get X user info (status ${userData.status ?? "?"}): ${JSON.stringify(userData.errors ?? userData)}`);
    }

    await ctx.runMutation(internal.socialTokens.saveSocialToken, {
      userId,
      platform: "x",
      accountId: userData.data.id,
      accountName: `@${userData.data.username}`,
      accountPicture: userData.data.profile_image_url,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      tokenExpiry: Date.now() + (tokenData.expires_in ?? 7200) * 1000,
      scope: SCOPES,
    });
  },
});

// ─── Manage ───────────────────────────────────────────────────────────────────

export const disconnectAccount = action({
  args: { accountId: v.string() },
  handler: async (ctx, { accountId }): Promise<{ ok: boolean }> => {
    const user = await requireUser(ctx);
    await ctx.runMutation(internal.socialTokens.deleteToken, {
      userId: user._id, platform: "x", accountId,
    });
    return { ok: true };
  },
});

// ─── Publish ──────────────────────────────────────────────────────────────────

/** Internal version — accepts userId directly (used by scheduled publishing). */
export const publishClipInternal = internalAction({
  args: {
    userId: v.id("users"),
    outputId: v.id("outputs"),
    accountId: v.string(),
    caption: v.string(),
    title: v.string(),
  },
  handler: async (ctx, { userId, outputId, accountId, caption, title }) => {
    const accessToken = await getValidAccessToken(ctx, userId, accountId);
    await ctx.runAction(internal.exportActions.ensureExported, { outputId });
    const appUrl = process.env.APP_URL || "https://shortpurify.com";
    const text = `${(caption || title).slice(0, 240)}\n\n${appUrl}/clip/${outputId}`;
    const tweetRes = await fetch(`${X_API}/tweets`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const tweetData = await tweetRes.json() as { data?: { id: string }; errors?: Array<{ message: string }> };
    if (!tweetData.data?.id) throw new Error(`X tweet failed: ${JSON.stringify(tweetData.errors ?? tweetData)}`);
    return { tweetId: tweetData.data.id };
  },
});

export const publishClip = action({
  args: {
    outputId: v.id("outputs"),
    accountId: v.string(),
    clipUrl: v.string(),
    clipKey: v.optional(v.string()),
    caption: v.string(),
    title: v.string(),
  },
  handler: async (ctx, { outputId, accountId, caption, title }) => {
    const user = await requireUser(ctx);
    const accessToken = await getValidAccessToken(ctx, user._id, accountId);

    // Auto-export with subtitles so the clip page serves the subtitle-burned version
    await ctx.runAction(internal.exportActions.ensureExported, { outputId });

    const appUrl = process.env.APP_URL || "https://shortpurify.com";
    const publicClipLink = `${appUrl}/clip/${outputId}`;

    // Safely combine the text and append the clean website URL
    const message = (caption || title).slice(0, 240); // Leave room for the URL length
    const text = `${message}\n\n${publicClipLink}`;

    // Post the tweet with the embedded video link instead of uploading the raw file 
    // to bypass the strict X API Free/Basic Tier App OAuth 2.0 restrictions.
    const tweetRes = await fetch(`${X_API}/tweets`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });
    const tweetData = await tweetRes.json() as {
      data?: { id: string };
      errors?: Array<{ message: string }>;
    };

    if (!tweetData.data?.id) {
      throw new Error(`X tweet failed: ${JSON.stringify(tweetData.errors ?? tweetData)}`);
    }

    return { tweetId: tweetData.data.id };
  },
});
