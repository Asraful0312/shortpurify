"use node";
/**
 * zernioActions.ts — Social publishing via Zernio API (Pro/Agency users only).
 *
 * Zernio manages OAuth for 14 social platforms. We create one Zernio profile per
 * ShortPurify user and connect their social accounts through it.
 *
 * Required env var (set in Convex dashboard):
 *   ZERNIO_API_KEY — from zernio.com/dashboard/api-keys
 *
 * Account limits:
 *   Pro:    2 total Zernio accounts (fits Zernio's free tier — $0 cost)
 *   Agency: unlimited
 *
 * Connect flow:
 *   1. Client calls getConnectUrl({ platform }) → receives { authUrl }
 *   2. Client opens authUrl in a popup window
 *   3. User completes OAuth on the social platform via Zernio
 *   4. Client detects popup close, calls syncAccounts() to pull new accounts
 */

import { action, internalAction } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { r2 } from "./r2storage";

const ZERNIO_API = "https://zernio.com/api/v1";

// ─── Private helpers ──────────────────────────────────────────────────────────

function apiKey(): string {
  const k = process.env.ZERNIO_API_KEY;
  if (!k) throw new ConvexError("ZERNIO_API_KEY not configured. Add it in the Convex dashboard.");
  return k;
}

async function zernioFetch(path: string, opts?: RequestInit): Promise<unknown> {
  const res = await fetch(`${ZERNIO_API}${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/json",
      ...(opts?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => res.statusText);
    throw new ConvexError(`Zernio API error ${res.status}: ${txt}`);
  }
  return res.json();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function requireUser(ctx: any): Promise<{ _id: Id<"users"> }> {
  const identity = (await ctx.auth.getUserIdentity()) as { subject: string } | null;
  if (!identity) throw new ConvexError("Unauthorized");
  const user = (await ctx.runQuery(internal.users.getUserByClerkId, {
    clerkId: identity.subject,
  })) as { _id: Id<"users"> } | null;
  if (!user) throw new ConvexError("User not found");
  return user;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function ensureProfile(ctx: any, userId: Id<"users">): Promise<string> {
  const existing = (await ctx.runQuery(internal.zernio.getProfileByUser, {
    userId,
  })) as { profileId: string } | null;
  if (existing) return existing.profileId;

  const profileName = `SP-${String(userId).slice(-8)}`;
  let profileId: string | undefined;

  try {
    const data = (await zernioFetch("/profiles", {
      method: "POST",
      body: JSON.stringify({ name: profileName, description: "ShortPurify" }),
    })) as Record<string, unknown>;

    const nested = (data.profile ?? data.data ?? data) as Record<string, unknown>;
    profileId = (nested._id ?? nested.id ?? nested.profileId) as string | undefined;
  } catch (err) {
    // Profile already exists on Zernio — look it up by name
    const msg = err instanceof ConvexError ? String(err.data) : String(err);
    if (!msg.includes("already exists")) throw err;

    const list = (await zernioFetch("/profiles")) as unknown;
    const profiles = (
      Array.isArray(list)
        ? list
        : ((list as Record<string, unknown>).profiles ??
           (list as Record<string, unknown>).data ??
           [])
    ) as Array<Record<string, unknown>>;

    const match = profiles.find((p) => p.name === profileName);
    if (match) {
      profileId = (match._id ?? match.id ?? match.profileId) as string | undefined;
    }
  }

  if (!profileId) {
    throw new ConvexError("Could not create or find a Zernio profile for this account.");
  }

  await ctx.runMutation(internal.zernio.saveProfile, { userId, profileId });
  return profileId;
}

// ─── Public actions ───────────────────────────────────────────────────────────

/**
 * Returns the Zernio OAuth URL for connecting a social account.
 * Client should open this in a popup, then call syncAccounts() when it closes.
 */
export const getConnectUrl = action({
  args: { platform: v.string() },
  handler: async (ctx, { platform }): Promise<{ authUrl: string }> => {
    const user = await requireUser(ctx);

    const isPaid = await ctx.runQuery(internal.usage.isPaidPlan, {
      fallbackEntityId: user._id,
    });
    if (!isPaid) {
      throw new ConvexError(
        "Connecting social accounts via Zernio requires a Pro or Agency plan. Upgrade to continue."
      );
    }

    const limit = (await ctx.runQuery(internal.usage.getZernioAccountLimit, {
      fallbackEntityId: user._id,
    })) as number | null;
    const accounts = (await ctx.runQuery(internal.zernio.getAccountsByUser, {
      userId: user._id,
    })) as unknown[];
    if (limit !== null && accounts.length >= limit) {
      throw new ConvexError(
        `You've reached the limit of ${limit} connected Zernio accounts on your plan. Upgrade to Agency for unlimited accounts.`
      );
    }

    const profileId = await ensureProfile(ctx, user._id);
    const data = (await zernioFetch(
      `/connect/${platform}?profileId=${profileId}`
    )) as { authUrl?: string; url?: string };

    const authUrl = data.authUrl ?? data.url;
    if (!authUrl) throw new ConvexError("Failed to get connect URL from Zernio.");

    return { authUrl };
  },
});

/**
 * Fetches all accounts from Zernio and upserts them locally.
 * Call this after the OAuth popup closes.
 */
export const syncAccounts = action({
  args: {},
  handler: async (ctx): Promise<{ synced: number }> => {
    const user = await requireUser(ctx);

    const profile = (await ctx.runQuery(internal.zernio.getProfileByUser, {
      userId: user._id,
    })) as { profileId: string } | null;
    if (!profile) return { synced: 0 };

    const data = (await zernioFetch(
      `/accounts?profileId=${profile.profileId}`
    )) as unknown;

    console.log("[zernio] syncAccounts raw response:", JSON.stringify(data).slice(0, 1000));

    const list = (
      Array.isArray(data)
        ? data
        : ((data as Record<string, unknown>).accounts ??
           (data as Record<string, unknown>).data ??
           [])
    ) as Array<Record<string, unknown>>;

    console.log(`[zernio] syncAccounts found ${list.length} account(s):`, list.map(a => JSON.stringify(a)).join(", ").slice(0, 500));

    for (const acc of list) {
      const accountId = (acc._id ?? acc.id) as string | undefined;
      // Normalise platform to lowercase (Zernio may return "Instagram" or "instagram")
      const platform = ((acc.platform ?? acc.type ?? "") as string).toLowerCase();
      // Zernio uses `displayName` as the primary account name field
      const accountName = (
        acc.displayName ?? acc.accountName ?? acc.name ?? acc.username ?? platform
      ) as string;
      // Coerce any non-string picture to undefined to pass Convex's v.optional(v.string())
      const rawPicture = acc.accountPicture ?? acc.picture ?? acc.profilePicture ?? acc.avatar ?? acc.imageUrl;
      const accountPicture = typeof rawPicture === "string" ? rawPicture : undefined;

      if (!accountId || !platform) {
        console.log("[zernio] skipping account — missing id or platform:", JSON.stringify(acc));
        continue;
      }

      try {
        await ctx.runMutation(internal.zernio.upsertAccount, {
          userId: user._id,
          profileId: profile.profileId,
          accountId,
          platform,
          accountName,
          accountPicture,
        });
        console.log(`[zernio] upserted: ${platform} / ${accountName} (${accountId})`);
      } catch (err) {
        console.error(`[zernio] upsert failed for ${accountId}:`, String(err));
      }
    }

    return { synced: list.length };
  },
});

/** Removes a Zernio account (from our DB and optionally from Zernio). */
export const disconnectAccount = action({
  args: { accountId: v.string() },
  handler: async (ctx, { accountId }): Promise<{ ok: boolean }> => {
    const user = await requireUser(ctx);

    try {
      await zernioFetch(`/accounts/${accountId}`, { method: "DELETE" });
    } catch {
      // Silently ignore — local removal is what matters for the UI
    }

    await ctx.runMutation(internal.zernio.deleteAccount, {
      userId: user._id,
      accountId,
    });
    return { ok: true };
  },
});

/**
 * Internal version — called by the Convex scheduler at the scheduled time.
 * No auth check needed (trusted internal call). Posts immediately via Zernio.
 */
export const publishClipInternal = internalAction({
  args: {
    userId: v.id("users"),
    outputId: v.id("outputs"),
    accountId: v.string(),
    platform: v.string(),
    caption: v.string(),
    title: v.optional(v.string()),
  },
  handler: async (ctx, { outputId, accountId, platform, caption }) => {
    const autoExportKey = await ctx.runAction(internal.exportActions.ensureExported, { outputId });
    const output = await ctx.runQuery(internal.outputs.getOutput, { outputId });
    const bestKey = autoExportKey ?? output?.exportKey;
    if (!bestKey) throw new ConvexError("No exported video available for this clip.");

    const videoUrl = await r2.getUrl(bestKey, { expiresIn: 60 * 60 * 2 });

    const data = (await zernioFetch("/posts", {
      method: "POST",
      body: JSON.stringify({
        content: caption,
        mediaItems: [{ type: "video", url: videoUrl }],
        platforms: [{ platform, accountId }],
        publishNow: true,
      }),
    })) as { _id?: string; id?: string; postId?: string };

    const postId = data._id ?? data.id ?? data.postId ?? "unknown";

    await ctx.runMutation(internal.outputs.savePublishInfo, {
      outputId,
      publishStatus: "success",
      publishRequestId: postId,
    });

    return { postId };
  },
});

/** Publishes a clip immediately via a connected Zernio account. */
export const publishClip = action({
  args: {
    outputId: v.id("outputs"),
    accountId: v.string(),
    platform: v.string(),
    caption: v.string(),
    clipUrl: v.string(),
    clipKey: v.optional(v.string()),
  },
  handler: async (ctx, { outputId, accountId, platform, caption, clipUrl, clipKey }) => {
    const user = await requireUser(ctx);

    const isPaid = await ctx.runQuery(internal.usage.isPaidPlan, {
      fallbackEntityId: user._id,
    });
    if (!isPaid) throw new ConvexError("Publishing via Zernio requires a Pro or Agency plan.");

    const accounts = (await ctx.runQuery(internal.zernio.getAccountsByUser, {
      userId: user._id,
    })) as Array<{ accountId: string }>;
    if (!accounts.some((a) => a.accountId === accountId)) {
      throw new ConvexError("Account not connected to your profile.");
    }

    const autoExportKey = await ctx.runAction(internal.exportActions.ensureExported, { outputId });
    const output = await ctx.runQuery(internal.outputs.getOutput, { outputId });
    const bestKey = autoExportKey ?? output?.exportKey ?? clipKey;
    let videoUrl = clipUrl;
    if (bestKey) videoUrl = await r2.getUrl(bestKey, { expiresIn: 60 * 60 * 2 });

    const data = (await zernioFetch("/posts", {
      method: "POST",
      body: JSON.stringify({
        content: caption,
        mediaItems: [{ type: "video", url: videoUrl }],
        platforms: [{ platform, accountId }],
        publishNow: true,
      }),
    })) as { _id?: string; id?: string; postId?: string };

    const postId = data._id ?? data.id ?? data.postId ?? "unknown";

    await ctx.runMutation(internal.outputs.savePublishInfo, {
      outputId,
      publishStatus: "success",
      publishRequestId: postId,
    });

    return { postId };
  },
});
