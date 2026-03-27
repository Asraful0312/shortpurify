"use node";
/**
 * tiktokActions.ts — TikTok publishing integration.
 *
 * OAuth flow:
 *   1. getAuthUrl()     → redirect user to TikTok OAuth
 *   2. /oauth/tiktok/callback → exchanges code, saves account token
 *   3. publishClip()    → uploads video via TikTok Content Posting API
 *   4. disconnectAccount() → removes account
 *
 * Token lifecycle:
 *   - Access tokens expire in 24 hours → refreshed using refresh_token
 *   - Refresh tokens expire in 365 days
 *
 * Required env vars (Convex dashboard):
 *   TIKTOK_CLIENT_KEY
 *   TIKTOK_CLIENT_SECRET
 *   CONVEX_SITE_URL
 *   APP_URL
 */

import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { ConvexError, v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { r2 } from "./r2storage";
import crypto from "crypto";

const TIKTOK_AUTH_URL  = "https://www.tiktok.com/v2/auth/authorize/";
const TIKTOK_TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/";
const TIKTOK_API       = "https://open.tiktokapis.com/v2";

const SCOPES = "user.info.basic,video.upload,video.publish";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function requireUser(ctx: any): Promise<{ _id: Id<"users"> }> {
  const identity = await ctx.auth.getUserIdentity() as { subject: string } | null;
  if (!identity) throw new ConvexError("Unauthorized");
  const user = await ctx.runQuery(internal.users.getUserByClerkId, { clerkId: identity.subject }) as { _id: Id<"users"> } | null;
  if (!user) throw new ConvexError("User not found");
  return user;
}

function callbackUrl() {
  const siteUrl = process.env.CONVEX_SITE_URL;
  if (!siteUrl) throw new ConvexError("CONVEX_SITE_URL env var not set");
  return `${siteUrl}/oauth/tiktok/callback`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getValidAccessToken(ctx: any, userId: Id<"users">, accountId: string): Promise<string> {
  const token = await ctx.runQuery(internal.socialTokens.getToken, {
    userId, platform: "tiktok", accountId,
  }) as { accessToken: string; refreshToken?: string; tokenExpiry?: number } | null;

  if (!token) throw new ConvexError("TikTok account not connected. Please reconnect.");

  // Refresh if within 5 minutes of expiry
  if (token.tokenExpiry && token.tokenExpiry < Date.now() + 5 * 60 * 1000) {
    if (!token.refreshToken) throw new ConvexError("No refresh token. Please reconnect your TikTok account.");

    const res = await fetch(TIKTOK_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_key: process.env.TIKTOK_CLIENT_KEY!,
        client_secret: process.env.TIKTOK_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
    });
    const data = await res.json() as {
      access_token?: string;
      refresh_token?: string;
      expires_in?: number;
      error?: string;
      error_description?: string;
    };
    if (!data.access_token) throw new ConvexError(`Failed to refresh token: ${data.error_description ?? data.error}`);

    await ctx.runMutation(internal.socialTokens.updateToken, {
      userId, platform: "tiktok", accountId,
      accessToken: data.access_token,
      tokenExpiry: Date.now() + (data.expires_in ?? 86400) * 1000,
    });
    // Also update refresh token if a new one was issued
    if (data.refresh_token) {
      await ctx.runMutation(internal.socialTokens.saveSocialToken, {
        userId, platform: "tiktok", accountId,
        accountName: "", // won't overwrite since we patch
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        tokenExpiry: Date.now() + (data.expires_in ?? 86400) * 1000,
      });
    }
    return data.access_token;
  }

  return token.accessToken;
}



export const getAuthUrl = action({
  args: {},
  handler: async (ctx): Promise<{ authUrl: string }> => {
    const user = await requireUser(ctx);
    const clientKey = process.env.TIKTOK_CLIENT_KEY;
    if (!clientKey) throw new   ConvexError("TIKTOK_CLIENT_KEY not configured");

    const stateToken = crypto.randomBytes(32).toString("hex");
    await ctx.runMutation(internal.socialTokens.saveOAuthState, {
      token: stateToken, userId: user._id, platform: "tiktok",
    });

    const params = new URLSearchParams({
      client_key: clientKey,
      redirect_uri: callbackUrl(),
      response_type: "code",
      scope: SCOPES,
      state: stateToken,
      force_reload: "true", // always show consent screen, prevents cached auth
    });

    return { authUrl: `${TIKTOK_AUTH_URL}?${params}` };
  },
});

export const handleCallback = internalAction({
  args: { code: v.string(), state: v.string() },
  handler: async (ctx, { code, state }) => {
    const clientKey    = process.env.TIKTOK_CLIENT_KEY!;
    const clientSecret = process.env.TIKTOK_CLIENT_SECRET!;

    // Verify state (CSRF)
    const oauthState = await ctx.runMutation(internal.socialTokens.consumeOAuthState, { token: state });
    if (!oauthState) throw new ConvexError("Invalid or expired OAuth state");
    const userId = oauthState.userId;

    // Exchange code → tokens
    const tokenRes = await fetch(TIKTOK_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: callbackUrl(),
      }),
    });
    const tokenData = await tokenRes.json() as {
      access_token?: string;
      refresh_token?: string;
      expires_in?: number;
      open_id?: string;
      error?: string;
      error_description?: string;
    };
    if (!tokenData.access_token) {
      throw new ConvexError(`Failed to get access token: ${tokenData.error_description ?? tokenData.error}`);
    }

    // Fetch user info
    const userRes = await fetch(`${TIKTOK_API}/user/info/?fields=open_id,display_name,avatar_url`, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userData = await userRes.json() as {
      data?: { user?: { open_id?: string; display_name?: string; avatar_url?: string } };
      error?: { code: string; message: string };
    };

    if (userData.error?.code !== "ok" && userData.error?.code !== undefined) {
      throw new ConvexError(userData.error.message);
    }

    const tiktokUser = userData.data?.user;
    const accountId  = tiktokUser?.open_id ?? tokenData.open_id;
    if (!accountId) throw new ConvexError("Could not get TikTok user ID");

    await ctx.runMutation(internal.socialTokens.saveSocialToken, {
      userId,
      platform: "tiktok",
      accountId,
      accountName: tiktokUser?.display_name ?? "TikTok Account",
      accountPicture: tiktokUser?.avatar_url,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      tokenExpiry: Date.now() + (tokenData.expires_in ?? 86400) * 1000,
      scope: SCOPES,
    });

    console.log(`[tiktok] Connected account "${tiktokUser?.display_name}" for user ${userId}`);
  },
});


export const disconnectAccount = action({
  args: { accountId: v.string() },
  handler: async (ctx, { accountId }): Promise<{ ok: boolean }> => {
    const user = await requireUser(ctx);
    await ctx.runMutation(internal.socialTokens.deleteToken, {
      userId: user._id, platform: "tiktok", accountId,
    });
    return { ok: true };
  },
});


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
    const autoExportKey = await ctx.runAction(internal.exportActions.ensureExported, { outputId });
    const output = await ctx.runQuery(internal.outputs.getOutput, { outputId });
    const bestKey = autoExportKey ?? output?.exportKey ?? output?.clipKey;
    let videoUrl = output?.clipUrl ?? "";
    if (bestKey) videoUrl = await r2.getUrl(bestKey, { expiresIn: 60 * 60 * 2 });

    const videoRes = await fetch(videoUrl);
    if (!videoRes.ok) throw new ConvexError(`Failed to fetch video: ${videoRes.status}`);
    const videoBuffer = await videoRes.arrayBuffer();
    const videoSize = videoBuffer.byteLength;

    const creatorRes = await fetch(`${TIKTOK_API}/post/publish/creator_info/query/`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json; charset=UTF-8" },
    });
    const creatorData = await creatorRes.json() as { data?: { privacy_level_options?: string[] } };
    const allowedPrivacy = creatorData.data?.privacy_level_options ?? [];
    // Unaudited TikTok apps can only post as SELF_ONLY (private).
    // After receiving TikTok Direct Post audit approval, change preference to PUBLIC_TO_EVERYONE.
    const PRIVACY_PREFERENCE = ["SELF_ONLY", "MUTUAL_FOLLOW_FRIENDS", "FOLLOWER_OF_CREATOR", "PUBLIC_TO_EVERYONE"];
    const privacyLevel = PRIVACY_PREFERENCE.find(p => allowedPrivacy.includes(p)) ?? allowedPrivacy[0] ?? "SELF_ONLY";

    const sanitizeCaption = (text: string) => text.replace(/https?:\/\/\S+/gi, "").replace(/\s{2,}/g, " ").trim().slice(0, 2200);
    const postCaption = sanitizeCaption(caption || title);

    const initRes = await fetch(`${TIKTOK_API}/post/publish/video/init/`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify({
        post_info: { title: postCaption, post_mode: "DIRECT_POST", privacy_level: privacyLevel, disable_duet: false, disable_comment: false, disable_stitch: false, video_cover_timestamp_ms: 1000 },
        source_info: { source: "FILE_UPLOAD", video_size: videoSize, chunk_size: videoSize, total_chunk_count: 1 },
      }),
    });
    const initData = await initRes.json() as { data?: { publish_id?: string; upload_url?: string }; error?: { code: string; message: string } };
    if (initData.error?.code && initData.error.code !== "ok") throw new ConvexError(`TikTok init failed (${initData.error.code}): ${initData.error.message}`);

    const publishId = initData.data?.publish_id;
    const uploadUrl = initData.data?.upload_url;
    if (!publishId || !uploadUrl) throw new ConvexError("TikTok did not return upload URL");

    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Range": `bytes 0-${videoSize - 1}/${videoSize}`, "Content-Type": "video/mp4", "Content-Length": String(videoSize) },
      body: videoBuffer,
    });
    if (!uploadRes.ok) throw new ConvexError(`TikTok upload failed: ${await uploadRes.text().catch(() => uploadRes.status.toString())}`);

    await ctx.runMutation(internal.outputs.savePublishInfo, { outputId, publishStatus: "pending", publishRequestId: publishId });
    return { publishId };
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
  handler: async (ctx, { outputId, accountId, clipUrl, clipKey, caption, title }) => {
    const user = await requireUser(ctx);
    const accessToken = await getValidAccessToken(ctx, user._id, accountId);

    // Auto-export with subtitles if not already exported
    const autoExportKey = await ctx.runAction(internal.exportActions.ensureExported, { outputId });
    const output = await ctx.runQuery(internal.outputs.getOutput, { outputId });
    const bestKey = autoExportKey ?? output?.exportKey ?? clipKey;
    let videoUrl = clipUrl;
    if (bestKey) {
      videoUrl = await r2.getUrl(bestKey, { expiresIn: 60 * 60 * 2 });
    }

    // Fetch video bytes
    const videoRes = await fetch(videoUrl);
    if (!videoRes.ok) throw new ConvexError(`Failed to fetch video: ${videoRes.status}`);
    const videoBuffer = await videoRes.arrayBuffer();
    const videoSize = videoBuffer.byteLength;

    // Query creator info to get allowed privacy levels
    const creatorRes = await fetch(`${TIKTOK_API}/post/publish/creator_info/query/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
      },
    });
    const creatorData = await creatorRes.json() as {
      data?: { privacy_level_options?: string[] };
      error?: { code: string; message: string };
    };
    const allowedPrivacy = creatorData.data?.privacy_level_options ?? [];
    // Unaudited TikTok apps can only post as SELF_ONLY (private).
    // After receiving TikTok Direct Post audit approval, change preference to PUBLIC_TO_EVERYONE.
    const PRIVACY_PREFERENCE = ["SELF_ONLY", "MUTUAL_FOLLOW_FRIENDS", "FOLLOWER_OF_CREATOR", "PUBLIC_TO_EVERYONE"];
    const privacyLevel = PRIVACY_PREFERENCE.find(p => allowedPrivacy.includes(p)) ?? allowedPrivacy[0] ?? "SELF_ONLY";

    // TikTok blocks captions with URLs; Direct Post title max 2200 chars
    const sanitizeCaption = (text: string) =>
      text
        .replace(/https?:\/\/\S+/gi, "")
        .replace(/\s{2,}/g, " ")
        .trim()
        .slice(0, 2200);

    const postCaption = sanitizeCaption(caption || title);

    // Step 1: Initialize upload (DIRECT_POST — app is approved)
    const initRes = await fetch(`${TIKTOK_API}/post/publish/video/init/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({
        post_info: {
          title: postCaption,
          post_mode: "DIRECT_POST",
          privacy_level: privacyLevel,
          disable_duet: false,
          disable_comment: false,
          disable_stitch: false,
          video_cover_timestamp_ms: 1000,
        },
        source_info: {
          source: "FILE_UPLOAD",
          video_size: videoSize,
          chunk_size: videoSize,
          total_chunk_count: 1,
        },
      }),
    });
    const initData = await initRes.json() as {
      data?: { publish_id?: string; upload_url?: string };
      error?: { code: string; message: string };
    };

    if (initData.error?.code && initData.error.code !== "ok") {
      throw new ConvexError(`TikTok init failed (${initData.error.code}): ${initData.error.message}`);
    }

    const publishId = initData.data?.publish_id;
    const uploadUrl = initData.data?.upload_url;
    if (!publishId || !uploadUrl) throw new ConvexError("TikTok did not return upload URL");

    // Step 2: Upload video (single chunk)
    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Range": `bytes 0-${videoSize - 1}/${videoSize}`,
        "Content-Type": "video/mp4",
        "Content-Length": String(videoSize),
      },
      body: videoBuffer,
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text().catch(() => uploadRes.status.toString());
      throw new ConvexError(`TikTok upload failed: ${errText}`);
    }

    await ctx.runMutation(internal.outputs.savePublishInfo, {
      outputId,
      publishStatus: "pending", // TikTok processes asynchronously
      publishRequestId: publishId,
    });

    return { publishId };
  },
});
