"use node";
/**
 * youtubeActions.ts — YouTube Shorts publishing integration.
 *
 * OAuth flow:
 *   1. getAuthUrl()     → redirect user to Google OAuth
 *   2. /oauth/youtube/callback (Convex HTTP route) → exchanges code, saves channel token
 *   3. publishClip()    → uploads video to YouTube as a Short
 *   4. disconnectChannel() → removes channel from user's account
 *
 * Token lifecycle:
 *   - Access tokens expire in ~1 hour → automatically refreshed using refresh_token
 *   - Refresh tokens are long-lived (revoked only if user disconnects the app)
 *
 * Required env vars (set in Convex dashboard):
 *   GOOGLE_CLIENT_ID
 *   GOOGLE_CLIENT_SECRET
 *   CONVEX_SITE_URL   (auto-set by Convex)
 *   APP_URL           (your frontend URL)
 */

import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v, ConvexError } from "convex/values";
import { Id } from "./_generated/dataModel";
import { r2 } from "./r2storage";
import crypto from "crypto";

const GOOGLE_AUTH_URL  = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const YOUTUBE_API      = "https://www.googleapis.com/youtube/v3";
const YOUTUBE_UPLOAD   = "https://www.googleapis.com/upload/youtube/v3/videos";

const SCOPES = [
  "https://www.googleapis.com/auth/youtube.upload",
  "https://www.googleapis.com/auth/youtube.readonly",
].join(" ");

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
  return `${siteUrl}/oauth/youtube/callback`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getValidAccessToken(ctx: any, userId: Id<"users">, accountId: string): Promise<string> {
  const token = await ctx.runQuery(internal.socialTokens.getToken, {
    userId, platform: "youtube", accountId,
  }) as { accessToken: string; refreshToken?: string; tokenExpiry?: number } | null;

  if (!token) throw new ConvexError("YouTube account not connected. Please reconnect.");

  // Refresh if within 5 minutes of expiry
  if (token.tokenExpiry && token.tokenExpiry < Date.now() + 5 * 60 * 1000) {
    if (!token.refreshToken) throw new ConvexError("No refresh token. Please reconnect your YouTube account.");

    const res = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: token.refreshToken,
        grant_type: "refresh_token",
      }),
    });
    const data = await res.json() as { access_token?: string; expires_in?: number; error?: string };
    if (!data.access_token) throw new ConvexError(`Failed to refresh token: ${data.error}`);

    await ctx.runMutation(internal.socialTokens.updateToken, {
      userId, platform: "youtube", accountId,
      accessToken: data.access_token,
      tokenExpiry: Date.now() + (data.expires_in ?? 3600) * 1000,
    });
    return data.access_token;
  }

  return token.accessToken;
}


export const getAuthUrl = action({
  args: {},
  handler: async (ctx): Promise<{ authUrl: string }> => {
    const user = await requireUser(ctx);
    const check = await ctx.runQuery(internal.usage.canConnectPlatform, { userId: user._id, platform: "youtube" });
    if (!check.allowed) throw new ConvexError(check.reason);
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) throw new ConvexError("GOOGLE_CLIENT_ID not configured");

    const stateToken = crypto.randomBytes(32).toString("hex");
    await ctx.runMutation(internal.socialTokens.saveOAuthState, {
      token: stateToken, userId: user._id, platform: "youtube",
    });

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: callbackUrl(),
      response_type: "code",
      scope: SCOPES,
      state: stateToken,
      access_type: "offline",
      prompt: "consent", // always get refresh_token
    });

    return { authUrl: `${GOOGLE_AUTH_URL}?${params}` };
  },
});

export const handleCallback = internalAction({
  args: { code: v.string(), state: v.string() },
  handler: async (ctx, { code, state }) => {
    const clientId     = process.env.GOOGLE_CLIENT_ID!;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;

    // Verify state (CSRF)
    const oauthState = await ctx.runMutation(internal.socialTokens.consumeOAuthState, { token: state });
    if (!oauthState) throw new ConvexError("Invalid or expired OAuth state");
    const userId = oauthState.userId;

    // Exchange code → tokens
    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: callbackUrl(),
        grant_type: "authorization_code",
      }),
    });
    const tokenData = await tokenRes.json() as {
      access_token?: string;
      refresh_token?: string;
      expires_in?: number;
      error?: string;
    };
    if (!tokenData.access_token) throw new ConvexError(`Failed to get access token: ${tokenData.error}`);

    // Fetch channel info
    const channelRes = await fetch(`${YOUTUBE_API}/channels?part=snippet&mine=true`, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const channelData = await channelRes.json() as {
      items?: Array<{
        id: string;
        snippet: { title: string; thumbnails?: { default?: { url?: string } } };
      }>;
      error?: { message: string };
    };

    if (channelData.error) throw new ConvexError(channelData.error.message);
    if (!channelData.items?.length) throw new ConvexError("No YouTube channel found for this Google account.");

    const channel = channelData.items[0];

    await ctx.runMutation(internal.socialTokens.saveSocialToken, {
      userId,
      platform: "youtube",
      accountId: channel.id,
      accountName: channel.snippet.title,
      accountPicture: channel.snippet.thumbnails?.default?.url,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      tokenExpiry: Date.now() + (tokenData.expires_in ?? 3600) * 1000,
      scope: SCOPES,
    });

    console.log(`[youtube] Connected channel "${channel.snippet.title}" for user ${userId}`);
  },
});

// ─── Manage ───────────────────────────────────────────────────────────────────

export const disconnectChannel = action({
  args: { accountId: v.string() },
  handler: async (ctx, { accountId }): Promise<{ ok: boolean }> => {
    const user = await requireUser(ctx);
    await ctx.runMutation(internal.socialTokens.deleteToken, {
      userId: user._id, platform: "youtube", accountId,
    });
    return { ok: true };
  },
});

// ─── YouTube Import (for upload page) ─────────────────────────────────────────

const YT_REGEX = /(?:youtube\.com\/(?:watch\?.*v=|shorts\/|embed\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;

export function extractVideoId(url: string): string | null {
  const m = url.match(YT_REGEX);
  return m ? m[1] : null;
}

export const createProjectFromYouTube = action({
  args: {
    youtubeUrl: v.string(),
    title: v.optional(v.string()),
    enabledPlatforms: v.optional(v.array(v.string())),
    cropMode: v.optional(v.string()),
    workspaceId: v.optional(v.string()),
  },
  handler: async (ctx, { youtubeUrl, title, enabledPlatforms, cropMode, workspaceId }): Promise<{ projectId: string }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) throw new ConvexError("Not a valid YouTube URL");

    const workerUrl = process.env.VIDEO_WORKER_URL;
    const workerSecret = process.env.VIDEO_WORKER_SECRET;
    if (!workerUrl || !workerSecret) {
      throw new ConvexError("Missing VIDEO_WORKER_URL or VIDEO_WORKER_SECRET environment variables.");
    }

    // Generate a presigned R2 upload URL so the worker can store the downloaded video
    const ytKey = `yt-imports/${videoId}-${Date.now()}.mp4`;
    const { url: uploadUrl } = await r2.generateUploadUrl(ytKey);

    const extractUrl = workerUrl.replace("process-video", "extract-youtube-info");
    const res = await fetch(extractUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ youtubeUrl, workerSecret, uploadUrl }),
    });

    if (!res.ok) throw new ConvexError(`Worker returned HTTP ${res.status}`);

    const data = await res.json() as {
      ok?: boolean;
      uploaded?: boolean;
      playbackUrl?: string;
      title?: string;
      durationSeconds?: number;
      error?: string;
    };
    if (!data.ok) {
      throw new ConvexError(data.error ?? "Failed to extract video playback URL.");
    }

    // Prefer the R2-stored high-quality version; fall back to direct playback URL
    let videoUrl: string;
    if (data.uploaded) {
      videoUrl = await r2.getUrl(ytKey, { expiresIn: 60 * 60 * 24 });
    } else if (data.playbackUrl) {
      videoUrl = data.playbackUrl;
    } else {
      throw new ConvexError("No video URL returned from worker.");
    }

    const videoTitle = title?.trim() || data.title || "YouTube Import";
    const estimatedDurationMinutes = data.durationSeconds
      ? Math.ceil(data.durationSeconds / 60)
      : undefined;

    // Pre-flight plan limit check (actions can runQuery)
    const user = await ctx.runQuery(internal.users.getUserByClerkId, {
      clerkId: identity.subject,
    });
    if (!user) throw new ConvexError("User not found");

    const limitCheck = await ctx.runQuery(internal.usage.canCreateProject, {
      userId: user._id,
      workspaceId,
      estimatedDurationMinutes,
    });
    if (!limitCheck.allowed) {
      throw new ConvexError(limitCheck.reason);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const projectId = await ctx.runMutation((internal as any).projects.createProjectAndStart, {
      title: videoTitle,
      originalUrl: videoUrl,
      // Store ytKey as originalKey so deleteOriginalVideo auto-cleans it after clip generation
      originalKey: data.uploaded ? ytKey : undefined,
      enabledPlatforms: enabledPlatforms ?? [],
      cropMode: cropMode ?? "smart_crop",
      workspaceId,
      estimatedDurationMinutes,
    });

    return { projectId };
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
    const contentType = "video/mp4";
    const videoTitle = title.length > 100 ? title.slice(0, 97) + "..." : title;
    const description = caption ? `${caption}\n\n#Shorts` : "#Shorts";
    const metadata = {
      snippet: { title: videoTitle, description, categoryId: "22" },
      status:  { privacyStatus: "public", selfDeclaredMadeForKids: false },
    };

    const initRes = await fetch(`${YOUTUBE_UPLOAD}?uploadType=resumable&part=snippet,status`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Upload-Content-Type": contentType,
        "X-Upload-Content-Length": String(videoBuffer.byteLength),
      },
      body: JSON.stringify(metadata),
    });
    if (!initRes.ok) {
      const err = await initRes.json().catch(() => ({})) as { error?: { message: string } };
      throw new ConvexError(`YouTube upload init failed: ${err.error?.message ?? initRes.status}`);
    }
    const uploadUrl = initRes.headers.get("location");
    if (!uploadUrl) throw new ConvexError("YouTube did not return an upload URL");

    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": contentType, "Content-Length": String(videoBuffer.byteLength) },
      body: videoBuffer,
    });
    const uploadData = await uploadRes.json() as { id?: string; error?: { message: string } };
    if (uploadData.error) throw new ConvexError(`YouTube upload failed: ${uploadData.error.message}`);
    if (!uploadData.id) throw new ConvexError("YouTube did not return a video ID");

    await ctx.runMutation(internal.outputs.savePublishInfo, { outputId, publishStatus: "success", publishRequestId: uploadData.id });
    return { videoId: uploadData.id };
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

    // Fetch the video bytes
    const videoRes = await fetch(videoUrl);
    if (!videoRes.ok) throw new ConvexError(`Failed to fetch video: ${videoRes.status}`);
    const videoBuffer = await videoRes.arrayBuffer();
    const contentType = "video/mp4";

    // Build metadata — add #Shorts so YouTube categorises it correctly
    const videoTitle = title.length > 100 ? title.slice(0, 97) + "..." : title;
    const description = caption ? `${caption}\n\n#Shorts` : "#Shorts";

    const metadata = {
      snippet: { title: videoTitle, description, categoryId: "22" },
      status:  { privacyStatus: "public", selfDeclaredMadeForKids: false },
    };

    // Step 1: initiate resumable upload
    const initRes = await fetch(
      `${YOUTUBE_UPLOAD}?uploadType=resumable&part=snippet,status`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-Upload-Content-Type": contentType,
          "X-Upload-Content-Length": String(videoBuffer.byteLength),
        },
        body: JSON.stringify(metadata),
      },
    );

    if (!initRes.ok) {
      const err = await initRes.json().catch(() => ({})) as { error?: { message: string } };
      throw new ConvexError(`YouTube upload init failed: ${err.error?.message ?? initRes.status}`);
    }

    const uploadUrl = initRes.headers.get("location");
    if (!uploadUrl) throw new ConvexError("YouTube did not return an upload URL");

    // Step 2: upload video bytes
    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(videoBuffer.byteLength),
      },
      body: videoBuffer,
    });

    const uploadData = await uploadRes.json() as {
      id?: string;
      error?: { message: string };
    };

    if (uploadData.error) throw new ConvexError(`YouTube upload failed: ${uploadData.error.message}`);
    if (!uploadData.id)   throw new ConvexError("YouTube did not return a video ID");

    await ctx.runMutation(internal.outputs.savePublishInfo, {
      outputId,
      publishStatus: "success",
      publishRequestId: uploadData.id,
    });

    return { videoId: uploadData.id };
  },
});
