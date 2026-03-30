"use node";
/**
 * threadsActions.ts — Threads publishing integration.
 *
 * OAuth flow:
 *   1. getAuthUrl()               → redirect user to Threads OAuth
 *   2. /oauth/threads/callback    → exchange code, save long-lived token
 *   3. publishClip()              → create video container → publish
 *   4. disconnectAccount()        → remove account
 *
 * Token lifecycle:
 *   - Short-lived tokens expire in 1 hour → exchanged for long-lived (60 days)
 *   - Long-lived tokens can be refreshed every 24 hours
 *
 * Required env vars (Convex dashboard):
 *   THREADS_APP_ID
 *   THREADS_APP_SECRET
 *   CONVEX_SITE_URL
 *   APP_URL
 */

import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { ConvexError, v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { r2 } from "./r2storage";
import crypto from "crypto";

const THREADS_AUTH_URL  = "https://threads.net/oauth/authorize";
const THREADS_TOKEN_URL = "https://graph.threads.net/oauth/access_token";
const THREADS_REFRESH_URL = "https://graph.threads.net/refresh_access_token";
const THREADS_EXCHANGE_URL = "https://graph.threads.net/access_token";
const THREADS_API       = "https://graph.threads.net/v1.0";

const SCOPES = "threads_basic,threads_content_publish";

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
  return `${siteUrl}/oauth/threads/callback`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getValidAccessToken(ctx: any, userId: Id<"users">, accountId: string): Promise<string> {
  const token = await ctx.runQuery(internal.socialTokens.getToken, {
    userId, platform: "threads", accountId,
  }) as { accessToken: string; refreshToken?: string; tokenExpiry?: number; accountName: string; accountPicture?: string } | null;

  if (!token) throw new Error("Threads account not connected. Please reconnect.");

  // Long-lived tokens last 60 days; refresh if within 1 day of expiry
  if (token.tokenExpiry && token.tokenExpiry < Date.now() + 24 * 60 * 60 * 1000) {
    const res = await fetch(
      `${THREADS_REFRESH_URL}?grant_type=th_refresh_token&access_token=${token.accessToken}`
    );
    const data = await res.json() as {
      access_token?: string;
      expires_in?: number;
      error?: { message: string };
    };

    if (data.access_token) {
      await ctx.runMutation(internal.socialTokens.saveSocialToken, {
        userId,
        platform: "threads",
        accountId,
        accountName: token.accountName,
        accountPicture: token.accountPicture,
        accessToken: data.access_token,
        tokenExpiry: Date.now() + (data.expires_in ?? 5184000) * 1000,
        scope: SCOPES,
      });
      return data.access_token;
    }
  }

  return token.accessToken;
}

// ─── Connect ──────────────────────────────────────────────────────────────────

export const getAuthUrl = action({
  args: {},
  handler: async (ctx): Promise<{ authUrl: string }> => {
    const user = await requireUser(ctx);
    const check = await ctx.runQuery(internal.usage.canConnectPlatform, { userId: user._id, platform: "threads" });
    if (!check.allowed) throw new ConvexError(check.reason);
    const appId = process.env.THREADS_APP_ID;
    if (!appId) throw new Error("THREADS_APP_ID not configured");

    const stateToken = crypto.randomBytes(32).toString("hex");
    await ctx.runMutation(internal.socialTokens.saveOAuthState, {
      token: stateToken, userId: user._id, platform: "threads",
    });

    const params = new URLSearchParams({
      client_id: appId,
      redirect_uri: callbackUrl(),
      scope: SCOPES,
      response_type: "code",
      state: stateToken,
    });

    return { authUrl: `${THREADS_AUTH_URL}?${params}` };
  },
});

export const handleCallback = internalAction({
  args: { code: v.string(), state: v.string() },
  handler: async (ctx, { code, state }) => {
    const appId     = process.env.THREADS_APP_ID!;
    const appSecret = process.env.THREADS_APP_SECRET!;

    // Verify state (CSRF)
    const oauthState = await ctx.runMutation(internal.socialTokens.consumeOAuthState, { token: state });
    if (!oauthState) throw new Error("Invalid or expired OAuth state");
    const userId = oauthState.userId;

    // Exchange code for short-lived token
    const tokenRes = await fetch(THREADS_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: appId,
        client_secret: appSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: callbackUrl(),
      }),
    });
    const tokenData = await tokenRes.json() as {
      access_token?: string;
      user_id?: number;
      error_type?: string;
      error_message?: string;
    };
    if (!tokenData.access_token) {
      throw new Error(`Threads token exchange failed: ${tokenData.error_message ?? JSON.stringify(tokenData)}`);
    }

    // Exchange for long-lived token (60 days)
    const longLivedRes = await fetch(
      `${THREADS_EXCHANGE_URL}?grant_type=th_exchange_token&client_secret=${appSecret}&access_token=${tokenData.access_token}`
    );
    const longLivedData = await longLivedRes.json() as {
      access_token?: string;
      expires_in?: number;
      error?: { message: string };
    };

    const finalToken  = longLivedData.access_token ?? tokenData.access_token;
    const expiresIn   = longLivedData.expires_in ?? 3600;

    // Fetch user info
    const userRes = await fetch(
      `${THREADS_API}/me?fields=id,username,name,threads_profile_picture_url&access_token=${finalToken}`
    );
    const userData = await userRes.json() as {
      id?: string;
      username?: string;
      name?: string;
      threads_profile_picture_url?: string;
      error?: { message: string };
    };

    if (!userData.id) {
      throw new Error(`Failed to get Threads user info: ${userData.error?.message ?? JSON.stringify(userData)}`);
    }

    await ctx.runMutation(internal.socialTokens.saveSocialToken, {
      userId,
      platform: "threads",
      accountId: userData.id,
      accountName: `@${userData.username ?? userData.name ?? "Threads Account"}`,
      accountPicture: userData.threads_profile_picture_url,
      accessToken: finalToken,
      tokenExpiry: Date.now() + expiresIn * 1000,
      scope: SCOPES,
    });

    console.log(`[threads] Connected account "@${userData.username}" for user ${userId}`);
  },
});

// ─── Manage ───────────────────────────────────────────────────────────────────

export const disconnectAccount = action({
  args: { accountId: v.string() },
  handler: async (ctx, { accountId }): Promise<{ ok: boolean }> => {
    const user = await requireUser(ctx);
    await ctx.runMutation(internal.socialTokens.deleteToken, {
      userId: user._id, platform: "threads", accountId,
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

    // Auto-export with subtitles if not already exported
    const autoExportKey = await ctx.runAction(internal.exportActions.ensureExported, { outputId });
    const output = await ctx.runQuery(internal.outputs.getOutput, { outputId });
    const bestKey = autoExportKey ?? output?.exportKey ?? clipKey;
    let videoUrl = clipUrl;
    if (bestKey) {
      // Threads needs a publicly accessible URL valid long enough to process the video
      videoUrl = await r2.getUrl(bestKey, { expiresIn: 60 * 60 * 2 });
    }

    // Sanitize caption — Threads supports up to 500 chars
    const postCaption = (caption || title).slice(0, 500);

    // Step 1: Create media container
    const containerRes = await fetch(`${THREADS_API}/${accountId}/threads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        media_type: "VIDEO",
        video_url: videoUrl,
        text: postCaption,
        access_token: accessToken,
      }),
    });
    const containerData = await containerRes.json() as {
      id?: string;
      error?: { message: string; code: number };
    };

    if (!containerData.id) {
      throw new Error(`Threads container creation failed: ${containerData.error?.message ?? JSON.stringify(containerData)}`);
    }

    const creationId = containerData.id;

    // Step 2: Wait for video to finish processing (poll up to 60s)
    let status = "IN_PROGRESS";
    for (let i = 0; i < 12 && status === "IN_PROGRESS"; i++) {
      await new Promise((r) => setTimeout(r, 5000));
      const statusRes = await fetch(
        `${THREADS_API}/${creationId}?fields=status,error_message&access_token=${accessToken}`
      );
      const statusData = await statusRes.json() as {
        status?: string;
        error_message?: string;
      };
      status = statusData.status ?? "FINISHED";
      if (statusData.error_message) {
        throw new Error(`Threads video processing failed: ${statusData.error_message}`);
      }
    }

    if (status === "IN_PROGRESS") {
      throw new Error("Threads video processing timed out. Please try again.");
    }

    // Step 3: Publish container
    const publishRes = await fetch(`${THREADS_API}/${accountId}/threads_publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: creationId,
        access_token: accessToken,
      }),
    });
    const publishData = await publishRes.json() as {
      id?: string;
      error?: { message: string; code: number };
    };

    if (!publishData.id) {
      throw new Error(`Threads publish failed: ${publishData.error?.message ?? JSON.stringify(publishData)}`);
    }

    return { postId: publishData.id };
  },
});
