"use node";
/**
 * outstandActions.ts — Outstand social publishing integration.
 * https://www.outstand.so/docs
 *
 * Uses Outstand's tenantId system so each ShortPurify user connects their
 * OWN social accounts independently. No profile pre-registration needed —
 * just pass tenantId = Convex userId on every API call.
 *
 * Required env var:
 *   OUTSTAND_API_KEY  — API key from outstand.so dashboard
 *
 * Optional:
 *   APP_URL           — Public URL used as redirect_uri after OAuth connect
 *                       (defaults to "https://shortpurify.com")
 *
 * Per-user flow:
 *   1. getConnectUrl(network) — generates an OAuth URL for a specific platform
 *   2. User visits the URL, connects their account, gets redirected back
 *   3. getConnectedAccounts() — lists all accounts connected by this user
 *   4. publishClip(accountIds, ...) — publishes under the user's own accounts
 *   5. disconnectAccount(accountId) — removes a connected account
 */

import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { r2 } from "./r2storage";

const BASE = "https://api.outstand.so";

function authHeaders(apiKey: string) {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
}

/** Map our internal platform IDs to Outstand network IDs. */
const NETWORK_MAP: Record<string, string> = {
  tiktok: "tiktok",
  instagram: "instagram",
  youtube: "youtube",
  x: "x",
  twitter: "x",
  linkedin: "linkedin",
  threads: "threads",
  facebook: "facebook",
  bluesky: "bluesky",
  pinterest: "pinterest",
};

export const SUPPORTED_NETWORKS = [
  "tiktok", "instagram", "youtube", "x", "linkedin", "threads", "facebook", "bluesky",
] as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function requireUser(ctx: any): Promise<{ _id: Id<"users"> }> {
  const identity = await ctx.auth.getUserIdentity() as { subject: string } | null;
  if (!identity) throw new Error("Unauthorized");
  const user = await ctx.runQuery(internal.users.getUserByClerkId, { clerkId: identity.subject }) as { _id: Id<"users"> } | null;
  if (!user) throw new Error("User not found");
  return user;
}

export type ConnectedAccount = {
  id: string;
  network: string;
  username: string;
  nickname: string;
  profile_picture_url?: string;
};

// ─── Account management ───────────────────────────────────────────────────────

/** List all social accounts connected by the current user. */
export const getConnectedAccounts = action({
  args: {},
  handler: async (ctx): Promise<ConnectedAccount[]> => {
    const user = await requireUser(ctx);

    const apiKey = process.env.OUTSTAND_API_KEY;
    if (!apiKey) return [];

    const res = await fetch(
      `${BASE}/v1/social-accounts?tenantId=${encodeURIComponent(user._id)}`,
      { headers: { Authorization: `Bearer ${apiKey}` } },
    );
    if (!res.ok) return [];

    const data = await res.json() as { success: boolean; data?: ConnectedAccount[] };
    return data.success && Array.isArray(data.data) ? data.data : [];
  },
});

/**
 * Generate an OAuth URL for connecting a specific social platform.
 * The user visits this URL, authenticates with the platform,
 * and gets redirected back to APP_URL/dashboard/publish?connected=1.
 */
export const getConnectUrl = action({
  args: { network: v.string() },
  handler: async (ctx, { network }): Promise<{ authUrl: string }> => {
    const user = await requireUser(ctx);

    const apiKey = process.env.OUTSTAND_API_KEY;
    if (!apiKey) throw new Error("OUTSTAND_API_KEY is not configured");

    const appUrl = process.env.APP_URL ?? "https://shortpurify.com";
    const redirectUri = `${appUrl}/dashboard/publish?connected=1&network=${network}`;

    const networkId = NETWORK_MAP[network.toLowerCase()] ?? network.toLowerCase();

    const res = await fetch(`${BASE}/v1/social-networks/${networkId}/auth-url`, {
      method: "POST",
      headers: authHeaders(apiKey),
      body: JSON.stringify({
        tenant_id: user._id,
        redirect_uri: redirectUri,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Failed to get connect URL for ${network}: ${res.status} — ${body}`);
    }

    const data = await res.json() as { success: boolean; data?: { auth_url?: string } };
    if (!data.success || !data.data?.auth_url) {
      throw new Error(`Outstand did not return an auth_url for ${network}`);
    }

    return { authUrl: data.data.auth_url };
  },
});

/** Disconnect (delete) a specific social account by its Outstand account ID. */
export const disconnectAccount = action({
  args: { accountId: v.string() },
  handler: async (ctx, { accountId }): Promise<{ ok: boolean }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const apiKey = process.env.OUTSTAND_API_KEY;
    if (!apiKey) throw new Error("OUTSTAND_API_KEY is not configured");

    const res = await fetch(`${BASE}/v1/social-accounts/${accountId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!res.ok && res.status !== 404) {
      throw new Error(`Disconnect failed: ${res.status}`);
    }
    return { ok: true };
  },
});

// ─── Publishing ───────────────────────────────────────────────────────────────

/** Publish a clip to one or more connected social accounts. */
export const publishClip = action({
  args: {
    outputId: v.id("outputs"),
    clipUrl: v.string(),
    clipKey: v.optional(v.string()),       // R2 key for generating a fresh URL
    caption: v.string(),
    accountIds: v.array(v.string()),        // Outstand social account IDs
    scheduledDate: v.optional(v.string()), // ISO-8601 UTC
  },
  handler: async (ctx, { outputId, clipUrl, clipKey, caption, accountIds, scheduledDate }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const apiKey = process.env.OUTSTAND_API_KEY;
    if (!apiKey) throw new Error("OUTSTAND_API_KEY is not configured");

    if (accountIds.length === 0) throw new Error("Select at least one account");

    // Generate a fresh 24-hour signed URL so Outstand can fetch the video
    let videoUrl = clipUrl;
    if (clipKey) {
      videoUrl = await r2.getUrl(clipKey, { expiresIn: 60 * 60 * 24 });
    }

    const body: Record<string, unknown> = {
      accounts: accountIds,
      containers: [
        {
          content: caption,
          media: [{ url: videoUrl, filename: "clip.mp4" }],
        },
      ],
    };

    if (scheduledDate) body.scheduledAt = scheduledDate;

    const res = await fetch(`${BASE}/v1/posts/`, {
      method: "POST",
      headers: authHeaders(apiKey),
      body: JSON.stringify(body),
    });

    const data = await res.json() as {
      success?: boolean;
      post?: { id: string };
      message?: string;
    };

    if (!res.ok || !data.success) {
      throw new Error(data.message ?? `Outstand returned ${res.status}: ${JSON.stringify(data)}`);
    }

    await ctx.runMutation(internal.outputs.savePublishInfo, {
      outputId,
      publishStatus: "pending",
      publishRequestId: data.post?.id,
    });

    return { postId: data.post?.id, scheduled: !!scheduledDate };
  },
});
