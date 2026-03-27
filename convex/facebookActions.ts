"use node";
/**
 * facebookActions.ts — Facebook Page publishing integration.
 *
 * OAuth flow:
 *   1. getAuthUrl()        → redirect user to Facebook OAuth
 *   2. /oauth/facebook/callback (Convex HTTP route) → exchanges code, saves page tokens
 *   3. getConnectedPages() → returns the user's connected pages
 *   4. publishClip()       → posts video to a specific Page
 *   5. disconnectPage()    → removes a page from the user's account
 *
 * Token lifecycle:
 *   - Page access tokens generated from a long-lived user token are PERMANENT.
 *   - Only need to reconnect if the user revokes the app (error code 190).
 *
 * Required env vars (set in Convex dashboard):
 *   FACEBOOK_APP_ID
 *   FACEBOOK_APP_SECRET
 *   CONVEX_SITE_URL   (auto-set by Convex — your .convex.site URL)
 *   APP_URL           (your frontend URL, e.g. https://shortpurify.com)
 */

import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { ConvexError, v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { r2 } from "./r2storage";
import crypto from "crypto";

const FB_VERSION = "v21.0";
const FB_GRAPH = `https://graph.facebook.com/${FB_VERSION}`;

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
  if (!siteUrl) throw new Error("CONVEX_SITE_URL env var not set");
  return `${siteUrl}/oauth/facebook/callback`;
}


/**
 * Generate a Facebook OAuth URL.
 * The user visits it, authorizes, and gets redirected to the Convex HTTP callback.
 */
export const getAuthUrl = action({
  args: {},
  handler: async (ctx): Promise<{ authUrl: string }> => {
    const user = await requireUser(ctx);

    const appId = process.env.FACEBOOK_APP_ID;
    if (!appId) throw new ConvexError("FACEBOOK_APP_ID not configured");

    // Random state token for CSRF protection
    const stateToken = crypto.randomBytes(32).toString("hex");
    await ctx.runMutation(internal.socialTokens.saveOAuthState, {
      token: stateToken,
      userId: user._id,
      platform: "facebook",
    });

    const params = new URLSearchParams({
      client_id: appId,
      redirect_uri: callbackUrl(),
      scope: "pages_manage_posts,pages_read_engagement,pages_show_list,pages_manage_metadata",
      state: stateToken,
      response_type: "code",
    });

    return { authUrl: `https://www.facebook.com/${FB_VERSION}/dialog/oauth?${params}` };
  },
});

/**
 * Internal: handles the OAuth callback.
 * Called by the Convex HTTP route after Facebook redirects back with ?code=...
 */
export const handleCallback = internalAction({
  args: { code: v.string(), state: v.string() },
  handler: async (ctx, { code, state }) => {
    const appId = process.env.FACEBOOK_APP_ID!;
    const appSecret = process.env.FACEBOOK_APP_SECRET!;

    // 1. Verify & consume state (CSRF check)
    const oauthState = await ctx.runMutation(internal.socialTokens.consumeOAuthState, { token: state });
    if (!oauthState) throw new Error("Invalid or expired OAuth state");
    const userId = oauthState.userId;

    // 2. Exchange code → short-lived user access token (~2 hours)
    const tokenRes = await fetch(`${FB_GRAPH}/oauth/access_token?` + new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      code,
      redirect_uri: callbackUrl(),
    }));
    const tokenData = await tokenRes.json() as { access_token?: string; error?: { message: string } };
    if (!tokenData.access_token) {
      throw new Error(`Failed to get access token: ${tokenData.error?.message ?? "unknown"}`);
    }

    // 3. Exchange short-lived → long-lived user token (~60 days)
    const llRes = await fetch(`${FB_GRAPH}/oauth/access_token?` + new URLSearchParams({
      grant_type: "fb_exchange_token",
      client_id: appId,
      client_secret: appSecret,
      fb_exchange_token: tokenData.access_token,
    }));
    const llData = await llRes.json() as { access_token?: string; expires_in?: number };
    if (!llData.access_token) throw new Error("Failed to get long-lived user token");

    // 4a. Debug: check granted permissions
    const permRes = await fetch(`${FB_GRAPH}/me/permissions?access_token=${llData.access_token}`);
    const permData = await permRes.json();
    console.log("[facebook] granted permissions:", JSON.stringify(permData));

    // 4b. Debug: get user ID
    const meRes = await fetch(`${FB_GRAPH}/me?access_token=${llData.access_token}&fields=id,name`);
    const meData = await meRes.json();
    console.log("[facebook] /me:", JSON.stringify(meData));

    // 4. Fetch the user's Pages (each page gets its own permanent token)
    const pagesRes = await fetch(`${FB_GRAPH}/me/accounts?` + new URLSearchParams({
      access_token: llData.access_token,
      fields: "id,name,picture{url},access_token",
      limit: "100",
    }));
    const pagesData = await pagesRes.json() as {
      data?: Array<{
        id: string;
        name: string;
        access_token: string;
        picture?: { data?: { url?: string } };
      }>;
      error?: { message: string };
    };

    console.log("[facebook] /me/accounts response:", JSON.stringify(pagesData));
    if (pagesData.error) throw new Error(pagesData.error.message);
    if (!pagesData.data?.length) {
      throw new Error(`No Facebook Pages found. /me/accounts returned: ${JSON.stringify(pagesData)}`);
    }

    // 5. Save each page token (permanent — no expiry needed)
    for (const page of pagesData.data) {
      await ctx.runMutation(internal.socialTokens.saveSocialToken, {
        userId,
        platform: "facebook",
        accountId: page.id,
        accountName: page.name,
        accountPicture: page.picture?.data?.url,
        accessToken: page.access_token,
        tokenExpiry: undefined, // page tokens from long-lived user tokens don't expire
        scope: "pages_manage_posts,pages_read_engagement",
      });
    }

    console.log(`[facebook] Connected ${pagesData.data.length} page(s) for user ${userId}`);
  },
});

// ─── Manage ───────────────────────────────────────────────────────────────────

/** Return connected Facebook Pages for the current user. */
export const getConnectedPages = action({
  args: {},
  handler: async (ctx): Promise<Array<{
    _id: string; userId: string; platform: string; accountId: string;
    accountName: string; accountPicture?: string; accessToken: string;
    tokenExpiry?: number; scope?: string;
  }>> => {
    const user = await requireUser(ctx);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await ctx.runQuery(internal.socialTokens.getTokensByPlatform, {
      userId: user._id,
      platform: "facebook",
    }) as any;
  },
});

/** Disconnect a Facebook Page. */
export const disconnectPage = action({
  args: { accountId: v.string() },
  handler: async (ctx, { accountId }): Promise<{ ok: boolean }> => {
    const user = await requireUser(ctx);
    await ctx.runMutation(internal.socialTokens.deleteToken, {
      userId: user._id,
      platform: "facebook",
      accountId,
    });
    return { ok: true };
  },
});

// ─── Publish ──────────────────────────────────────────────────────────────────

/** Publish a video clip to a Facebook Page. */
export const publishClip = action({
  args: {
    outputId: v.id("outputs"),
    accountId: v.string(),          // Facebook Page ID
    clipUrl: v.string(),
    clipKey: v.optional(v.string()), // R2 key for fresh URL generation
    caption: v.string(),
    scheduledDate: v.optional(v.string()), // ISO-8601
  },
  handler: async (ctx, { outputId, accountId, clipUrl, clipKey, caption, scheduledDate }) => {
    const user = await requireUser(ctx);

    // Get stored page token
    const token = await ctx.runQuery(internal.socialTokens.getToken, {
      userId: user._id,
      platform: "facebook",
      accountId,
    });
    if (!token) throw new Error("Facebook page not connected. Please reconnect.");

    // Generate fresh R2 URL (public for 24 hours so Facebook can fetch it)
    let videoUrl = clipUrl;
    if (clipKey) {
      videoUrl = await r2.getUrl(clipKey, { expiresIn: 60 * 60 * 24 });
    }

    const body: Record<string, string | boolean> = {
      file_url: videoUrl,
      description: caption,
      access_token: token.accessToken,
    };

    if (scheduledDate) {
      // Facebook requires Unix timestamp for scheduling
      body.scheduled_publish_time = String(Math.floor(new Date(scheduledDate).getTime() / 1000));
      body.published = false;
    }

    const res = await fetch(`${FB_GRAPH}/${accountId}/videos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json() as {
      id?: string;
      error?: { message: string; code: number; error_subcode?: number };
    };

    // Error code 190 = token revoked by user — remove it and prompt reconnect
    if (data.error?.code === 190) {
      await ctx.runMutation(internal.socialTokens.deleteToken, {
        userId: user._id,
        platform: "facebook",
        accountId,
      });
      throw new Error("Facebook session expired. Please reconnect your page in the Publish Hub.");
    }

    if (data.error) throw new Error(`Facebook error: ${data.error.message}`);
    if (!data.id) throw new Error("Facebook did not return a post ID");

    await ctx.runMutation(internal.outputs.savePublishInfo, {
      outputId,
      publishStatus: "pending",
      publishRequestId: data.id,
    });

    return { postId: data.id, scheduled: !!scheduledDate };
  },
});
