"use node";
/**
 * blueskyActions.ts — Bluesky publishing integration.
 *
 * Authentication:
 *   Bluesky uses app passwords — no OAuth redirect.
 *   1. connectAccount(handle, appPassword) → creates a session, saves token
 *   2. publishClip()  → upload video → poll until ready → create post
 *   3. disconnectAccount() → removes account
 *
 * Token lifecycle:
 *   - accessJwt expires in ~2 hours
 *   - App password is stored as refreshToken and used to create fresh sessions
 *
 * No required env vars — credentials are provided by the user at connect time.
 */

import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { ConvexError, v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { r2 } from "./r2storage";

const BSKY_API   = "https://bsky.social/xrpc";
const VIDEO_API  = "https://video.bsky.app/xrpc";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function requireUser(ctx: any): Promise<{ _id: Id<"users"> }> {
  const identity = await ctx.auth.getUserIdentity() as { subject: string } | null;
  if (!identity) throw new Error("Unauthorized");
  const user = await ctx.runQuery(internal.users.getUserByClerkId, { clerkId: identity.subject }) as { _id: Id<"users"> } | null;
  if (!user) throw new Error("User not found");
  return user;
}

async function createSession(identifier: string, appPassword: string) {
  const res = await fetch(`${BSKY_API}/com.atproto.server.createSession`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, password: appPassword }),
  });
  const data = await res.json() as {
    did?: string;
    handle?: string;
    accessJwt?: string;
    refreshJwt?: string;
    error?: string;
    message?: string;
  };
  if (!data.accessJwt || !data.did) {
    throw new ConvexError(`Bluesky login failed: ${data.message ?? data.error ?? "Invalid handle or app password"}`);
  }
  return data as { did: string; handle: string; accessJwt: string; refreshJwt: string };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getValidAccessToken(ctx: any, userId: Id<"users">, accountId: string): Promise<string> {
  const token = await ctx.runQuery(internal.socialTokens.getToken, {
    userId, platform: "bluesky", accountId,
  }) as {
    accessToken: string;
    refreshToken?: string; // stored app password
    tokenExpiry?: number;
    accountName: string;
    accountPicture?: string;
  } | null;

  if (!token) throw new ConvexError("Bluesky account not connected. Please reconnect.");

  // Refresh using stored app password if within 10 min of expiry or already expired
  if (token.tokenExpiry && token.tokenExpiry < Date.now() + 10 * 60 * 1000) {
    if (!token.refreshToken) throw new ConvexError("No app password stored. Please reconnect your Bluesky account.");

    // The refreshToken field stores the handle as "handle::apppassword"
    const [handle, ...rest] = token.refreshToken.split("::");
    const appPassword = rest.join("::");
    if (!handle || !appPassword) throw new ConvexError("Stored credentials invalid. Please reconnect your Bluesky account.");

    const session = await createSession(handle, appPassword);
    await ctx.runMutation(internal.socialTokens.saveSocialToken, {
      userId,
      platform: "bluesky",
      accountId,
      accountName: token.accountName,
      accountPicture: token.accountPicture,
      accessToken: session.accessJwt,
      refreshToken: token.refreshToken, // keep handle::appPassword
      tokenExpiry: Date.now() + 90 * 60 * 1000,
    });
    return session.accessJwt;
  }

  return token.accessToken;
}


export const connectAccount = action({
  args: { handle: v.string(), appPassword: v.string() },
  handler: async (ctx, { handle, appPassword }): Promise<{ handle: string }> => {
    const user = await requireUser(ctx);
    const check = await ctx.runQuery(internal.usage.canConnectPlatform, { userId: user._id, platform: "bluesky" });
    if (!check.allowed) throw new ConvexError(check.reason);

    // Normalise handle — strip leading @ if user included it
    const cleanHandle = handle.replace(/^@/, "").trim();

    const session = await createSession(cleanHandle, appPassword);

    // Fetch profile picture
    let avatarUrl: string | undefined;
    try {
      const profileRes = await fetch(
        `${BSKY_API}/app.bsky.actor.getProfile?actor=${session.did}`,
        { headers: { Authorization: `Bearer ${session.accessJwt}` } }
      );
      const profile = await profileRes.json() as { avatar?: string };
      avatarUrl = profile.avatar;
    } catch {
      // profile picture is optional
    }

    await ctx.runMutation(internal.socialTokens.saveSocialToken, {
      userId: user._id,
      platform: "bluesky",
      accountId: session.did,
      accountName: `@${session.handle}`,
      accountPicture: avatarUrl,
      accessToken: session.accessJwt,
      // Store handle::appPassword so we can refresh sessions later
      refreshToken: `${session.handle}::${appPassword}`,
      tokenExpiry: Date.now() + 90 * 60 * 1000,
      scope: "bluesky",
    });

    return { handle: session.handle };
  },
});


export const disconnectAccount = action({
  args: { accountId: v.string() },
  handler: async (ctx, { accountId }): Promise<{ ok: boolean }> => {
    const user = await requireUser(ctx);
    await ctx.runMutation(internal.socialTokens.deleteToken, {
      userId: user._id, platform: "bluesky", accountId,
    });
    return { ok: true };
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
    return await _publishBlueskyCoreAction(ctx, { userId: user._id, outputId, accountId, clipUrl, clipKey, caption, title });
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
    return await _publishBlueskyCoreAction(ctx, { userId, outputId, accountId, clipUrl: "", clipKey: undefined, caption, title });
  },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function _publishBlueskyCoreAction(ctx: any, { userId, outputId, accountId, clipUrl, clipKey, caption, title }: {
  userId: Id<"users">; outputId: Id<"outputs">; accountId: string; clipUrl: string; clipKey?: string; caption: string; title: string;
}) {
    const accessToken = await getValidAccessToken(ctx, userId, accountId);

    // Auto-export with subtitles if not already exported
    const autoExportKey = await ctx.runAction(internal.exportActions.ensureExported, { outputId });
    const output = await ctx.runQuery(internal.outputs.getOutput, { outputId });
    const bestKey = autoExportKey ?? output?.exportKey ?? clipKey;
    let videoUrl = clipUrl;
    if (bestKey) {
      videoUrl = await r2.getUrl(bestKey, { expiresIn: 60 * 60 * 2 });
    }

    // Fetch video bytes (max 50 MB for Bluesky)
    const videoRes = await fetch(videoUrl);
    if (!videoRes.ok) throw new ConvexError(`Failed to fetch video: ${videoRes.status}`);
    const videoBuffer = await videoRes.arrayBuffer();

    // Resolve the user's PDS DID from their DID document — required as `aud` for service auth
    const didDocRes = await fetch(`https://plc.directory/${accountId}`);
    const didDoc = await didDocRes.json() as {
      service?: Array<{ id: string; type: string; serviceEndpoint: string }>;
    };
    const pdsEndpoint = didDoc.service?.find((s) => s.id === "#atproto_pds")?.serviceEndpoint;
    if (!pdsEndpoint) throw new ConvexError("Could not resolve Bluesky PDS endpoint from DID document.");
    const pdsDid = `did:web:${new URL(pdsEndpoint).hostname}`;

    // Get a service auth token scoped to the video upload endpoint
    const serviceAuthRes = await fetch(
      `${BSKY_API}/com.atproto.server.getServiceAuth?aud=${encodeURIComponent(pdsDid)}&lxm=com.atproto.repo.uploadBlob`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const serviceAuthData = await serviceAuthRes.json() as { token?: string; error?: string; message?: string };
    if (!serviceAuthData.token) {
      throw new ConvexError(`Failed to get Bluesky service auth token: ${serviceAuthData.message ?? serviceAuthData.error ?? JSON.stringify(serviceAuthData)}`);
    }
    const videoUploadToken = serviceAuthData.token;

    // Step 1: Upload video to Bluesky video service
    const fileName = clipKey ?? `video-${outputId}.mp4`;
    const uploadRes = await fetch(`${VIDEO_API}/app.bsky.video.uploadVideo?did=${encodeURIComponent(accountId)}&name=${encodeURIComponent(fileName)}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${videoUploadToken}`,
        "Content-Type": "video/mp4",
        "Content-Length": String(videoBuffer.byteLength),
      },
      body: videoBuffer,
    });
    const uploadData = await uploadRes.json() as {
      jobId?: string;
      error?: string;
      message?: string;
    };
    if (!uploadData.jobId) {
      throw new ConvexError(`Bluesky video upload failed: ${uploadData.message ?? uploadData.error ?? JSON.stringify(uploadData)}`);
    }

    // Step 2: Poll for video processing completion (up to 90 seconds)
    let blobRef: unknown = null;
    for (let i = 0; i < 18; i++) {
      await new Promise((r) => setTimeout(r, 5000));
      const statusRes = await fetch(
        `${VIDEO_API}/app.bsky.video.getJobStatus?jobId=${uploadData.jobId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const statusData = await statusRes.json() as {
        jobStatus?: { state?: string; blob?: unknown; error?: string };
      };
      const job = statusData.jobStatus;
      if (job?.error) throw new ConvexError(`Bluesky video processing failed: ${job.error}`);
      if (job?.state === "JOB_STATE_COMPLETED" && job.blob) {
        blobRef = job.blob;
        break;
      }
    }

    if (!blobRef) throw new ConvexError("Bluesky video processing timed out. Please try again.");

    // Step 3: Create post with video embed
    const postText = (caption || title).slice(0, 300);
    const postRes = await fetch(`${BSKY_API}/com.atproto.repo.createRecord`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        repo: accountId, // DID
        collection: "app.bsky.feed.post",
        record: {
          $type: "app.bsky.feed.post",
          text: postText,
          createdAt: new Date().toISOString(),
          embed: {
            $type: "app.bsky.embed.video",
            video: blobRef,
            aspectRatio: { width: 9, height: 16 },
          },
        },
      }),
    });
    const postData = await postRes.json() as {
      uri?: string;
      cid?: string;
      error?: string;
      message?: string;
    };

    if (!postData.uri) {
      throw new ConvexError(`Bluesky post failed: ${postData.message ?? postData.error ?? JSON.stringify(postData)}`);
    }

  return { postId: postData.cid ?? postData.uri };
}
