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
import { v } from "convex/values";
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
  if (!identity) throw new Error("Unauthorized");
  const user = await ctx.runQuery(internal.users.getUserByClerkId, { clerkId: identity.subject }) as { _id: Id<"users"> } | null;
  if (!user) throw new Error("User not found");
  return user;
}

function callbackUrl() {
  const siteUrl = process.env.CONVEX_SITE_URL;
  if (!siteUrl) throw new Error("CONVEX_SITE_URL env var not set");
  return `${siteUrl}/oauth/tiktok/callback`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getValidAccessToken(ctx: any, userId: Id<"users">, accountId: string): Promise<string> {
  const token = await ctx.runQuery(internal.socialTokens.getToken, {
    userId, platform: "tiktok", accountId,
  }) as { accessToken: string; refreshToken?: string; tokenExpiry?: number } | null;

  if (!token) throw new Error("TikTok account not connected. Please reconnect.");

  // Refresh if within 5 minutes of expiry
  if (token.tokenExpiry && token.tokenExpiry < Date.now() + 5 * 60 * 1000) {
    if (!token.refreshToken) throw new Error("No refresh token. Please reconnect your TikTok account.");

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
    if (!data.access_token) throw new Error(`Failed to refresh token: ${data.error_description ?? data.error}`);

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

// ─── Connect ──────────────────────────────────────────────────────────────────

export const getAuthUrl = action({
  args: {},
  handler: async (ctx): Promise<{ authUrl: string }> => {
    const user = await requireUser(ctx);
    const clientKey = process.env.TIKTOK_CLIENT_KEY;
    if (!clientKey) throw new Error("TIKTOK_CLIENT_KEY not configured");

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
    if (!oauthState) throw new Error("Invalid or expired OAuth state");
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
      throw new Error(`Failed to get access token: ${tokenData.error_description ?? tokenData.error}`);
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
      throw new Error(userData.error.message);
    }

    const tiktokUser = userData.data?.user;
    const accountId  = tiktokUser?.open_id ?? tokenData.open_id;
    if (!accountId) throw new Error("Could not get TikTok user ID");

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

// ─── Manage ───────────────────────────────────────────────────────────────────

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

// ─── Publish ──────────────────────────────────────────────────────────────────

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

    // Get fresh R2 URL if we have a key
    let videoUrl = clipUrl;
    if (clipKey) {
      videoUrl = await r2.getUrl(clipKey, { expiresIn: 60 * 60 * 2 });
    }

    // Fetch video bytes
    const videoRes = await fetch(videoUrl);
    if (!videoRes.ok) throw new Error(`Failed to fetch video: ${videoRes.status}`);
    const videoBuffer = await videoRes.arrayBuffer();
    const videoSize = videoBuffer.byteLength;

    // Query creator info to get allowed privacy levels
    const creatorRes = await fetch(`${TIKTOK_API}/post/publish/creator_info/query/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({}), // Essential: TikTok requires an empty JSON object body
    });
    
    const creatorData = await creatorRes.json() as {
      data?: { privacy_level_options?: string[] };
      error?: { code: string; message: string; log_id?: string };
    };

    if (creatorData.error?.code && creatorData.error.code !== "ok") {
      console.warn(`[tiktok] Creator info query failed: ${creatorData.error.message} (log_id: ${creatorData.error.log_id})`);
    }

    const allowedOptions = creatorData.data?.privacy_level_options ?? [];
    console.log(`[tiktok] Allowed privacy options: ${allowedOptions.join(", ")}`);

    // Priority: PUBLIC_TO_EVERYONE -> first allowed -> SELF_ONLY fallback
    const privacyLevel = allowedOptions.includes("PUBLIC_TO_EVERYONE")
      ? "PUBLIC_TO_EVERYONE"
      : allowedOptions.length > 0 
        ? allowedOptions[0] 
        : "SELF_ONLY";

    // TikTok blocks captions containing URLs and enforces a limit (usually 150 for Direct Post)
    const sanitizeCaption = (text: string) =>
      text
        .replace(/https?:\/\/\S+/gi, "") // strip URLs
        .replace(/\s{2,}/g, " ")          // collapse extra spaces
        .trim()
        .slice(0, 150); // Direct Post often limits title to 150 chars

    const postCaption = sanitizeCaption(caption || title);

    // Step 1: Initialize upload
    const initUpload = async (opts: { pLevel?: string, minimal?: boolean, omitPrivacy?: boolean, simpleTitle?: boolean }) => {
      const { pLevel, minimal = false, omitPrivacy = false, simpleTitle = false } = opts;
      
      const postInfo: any = {
        title: simpleTitle ? "ShortPurify AI Video" : postCaption,
      };

      if (!omitPrivacy && pLevel) {
        postInfo.privacy_level = pLevel;
      }

      if (!minimal) {
        postInfo.disable_duet = false;
        postInfo.disable_comment = false;
        postInfo.disable_stitch = false;
        postInfo.video_cover_timestamp_ms = 1000;
      }

      console.log(`[tiktok] Initializing upload: ${JSON.stringify(postInfo)}`);
      
      const res = await fetch(`${TIKTOK_API}/post/publish/video/init/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({
          post_info: postInfo,
          source_info: {
            source: "FILE_UPLOAD",
            video_size: videoSize,
            chunk_size: videoSize,
            total_chunk_count: 1,
          },
        }),
      });
      return await res.json() as {
        data?: { publish_id?: string; upload_url?: string };
        error?: { code: string; message: string };
      };
    };

    let initData = await initUpload({ pLevel: privacyLevel });

    // Fallback chain for unaudited/staging apps
    if (initData.error?.code === "unaudited_client_can_only_post_to_private_accounts") {
      console.warn("[tiktok] Initial attempt failed. Starting unaudited fallback chain...");
      
      // Retry 1: SELF_ONLY (Standard)
      if (privacyLevel !== "SELF_ONLY") {
        initData = await initUpload({ pLevel: "SELF_ONLY" });
      }

      // Retry 2: self_only (Lowercase fallback)
      if (initData.error?.code === "unaudited_client_can_only_post_to_private_accounts") {
        initData = await initUpload({ pLevel: "self_only" });
      }

      // Retry 3: Minimal + SELF_ONLY
      if (initData.error?.code === "unaudited_client_can_only_post_to_private_accounts") {
        initData = await initUpload({ pLevel: "SELF_ONLY", minimal: true });
      }

      // Retry 4: Minimal + No Privacy (Zero-config)
      if (initData.error?.code === "unaudited_client_can_only_post_to_private_accounts") {
        initData = await initUpload({ minimal: true, omitPrivacy: true });
      }

      // Retry 5: Minimal + No Privacy + Simple Title (Cleanest possible)
      if (initData.error?.code === "unaudited_client_can_only_post_to_private_accounts") {
        initData = await initUpload({ minimal: true, omitPrivacy: true, simpleTitle: true });
      }
    }

    if (initData.error?.code && initData.error.code !== "ok") {
      console.error("[tiktok] Init failed details:", JSON.stringify(initData.error, null, 2));
      const isUnaudited = initData.error.code === "unaudited_client_can_only_post_to_private_accounts";
      const extraMsg = isUnaudited ? ". Note: Unaudited apps can only post to private accounts (SELF_ONLY) and the account must be added as a Tester in the TikTok Developer Portal." : "";
      throw new Error(`TikTok init failed (${initData.error.code}): ${initData.error.message}${extraMsg}`);
    }

    const publishId = initData.data?.publish_id;
    const uploadUrl = initData.data?.upload_url;
    if (!publishId || !uploadUrl) throw new Error("TikTok did not return upload URL");

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
      throw new Error(`TikTok upload failed: ${errText}`);
    }

    await ctx.runMutation(internal.outputs.savePublishInfo, {
      outputId,
      publishStatus: "pending", // TikTok processes asynchronously
      publishRequestId: publishId,
    });

    return { publishId };
  },
});
