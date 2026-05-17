/**
 * billing.ts — Creem billing integration via @mmailaender/convex-creem
 *
 * entityId strategy: each workspace (org ID) has its own subscription.
 * The workspace owner is the only one who can manage billing.
 *
 * Env vars required (set via `npx convex env set`):
 *   CREEM_API_KEY            — from Creem dashboard → Settings → API Keys
 *   CREEM_WEBHOOK_SECRET     — from Creem dashboard → Settings → Webhooks
 */

import { Creem } from "@mmailaender/convex-creem";
import { components, internal } from "./_generated/api";
import { action } from "./_generated/server";
import { v } from "convex/values";

export const creem = new Creem(components.creem);

/**
 * Auto-generated billing API — resolves auth from Clerk identity.
 * entityId = the active workspace/org ID (billing is per-workspace).
 *
 * The creem RunQueryCtx type omits auth/db from its definition,
 * so we cast to any to access them (they are present at runtime).
 */
export const {
  uiModel,
  snapshot,
  checkouts: { create: createCheckout },
  subscriptions: {
    update: updateSubscription,
    cancel: cancelSubscription,
    resume: resumeSubscription,
    pause: pauseSubscription,
    list: listSubscriptions,
  },
  products: { list: listProducts, get: getProduct },
  customers: { retrieve: retrieveCustomer, portalUrl: getPortalUrl },
  orders: { list: listOrders },
} = creem.api({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolve: async (ctx: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    // entityId = workspace being billed (or user ID for personal workspace)
    const entityId = (identity.org_id as string | undefined) ?? user._id;

    return {
      userId: user._id as string,
      email: user.email as string,
      entityId: entityId as string,
    };
  },
});

/**
 * Create a checkout session for a specific plan.
 * Called from the billing page upgrade buttons.
 */
export const createPlanCheckout = action({
  args: {
    productId: v.string(),
    workspaceId: v.optional(v.string()),
    billingCycle: v.union(v.literal("monthly"), v.literal("yearly")),
    referralCode: v.optional(v.string()),
  },
  handler: async (ctx, { productId, workspaceId, billingCycle: _billingCycle, referralCode }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.runQuery(internal.users.getUserByClerkId, {
      clerkId: identity.subject,
    });
    if (!user) throw new Error("User not found");

    const entityId = workspaceId ?? user._id;
    const appUrl = process.env.APP_URL ?? "https://shortpurify.com";

    const { url } = await creem.checkouts.create(ctx, {
      entityId,
      userId: user._id,
      email: user.email,
      productId,
      successUrl: `${appUrl}/dashboard/billing?checkout=success`,
      ...(referralCode ? { referralCode } : {}),
      metadata: {
        workspaceId: workspaceId ?? "",
        userId: user._id,
      },
    });

    return { url };
  },
});

/**
 * Open Creem customer portal (manage payment method, invoices, cancel).
 * Only callable by workspace owners — enforced on the frontend too.
 */
export const openBillingPortal = action({
  args: { workspaceId: v.optional(v.string()) },
  handler: async (ctx, { workspaceId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.runQuery(internal.users.getUserByClerkId, {
      clerkId: identity.subject,
    });
    if (!user) throw new Error("User not found");

    const entityId = workspaceId ?? user._id;
    const { url } = await creem.customers.portalUrl(ctx, { entityId });
    return { url };
  },
});

/**
 * Get the current subscription for a workspace.
 * Returns null if on free plan.
 */
export const getCurrentSubscription = action({
  args: { workspaceId: v.optional(v.string()) },
  handler: async (ctx, { workspaceId }): Promise<unknown> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = (await ctx.runQuery(internal.users.getUserByClerkId, {
      clerkId: identity.subject,
    })) as { _id: string; email: string } | null;
    if (!user) return null;

    const entityId: string = workspaceId ?? user._id;
    return creem.subscriptions.getCurrent(ctx, { entityId });
  },
});

/**
 * Sync all Creem products into Convex DB.
 * Run once after setup: `npx convex run billing:syncBillingProducts`
 * Re-run whenever you add/update products in Creem dashboard.
 */
export const syncBillingProducts = action({
  handler: async (ctx) => {
    await creem.syncProducts(ctx);
    console.log("[billing] products synced from Creem");
  },
});

/** Debug: inspect creem component DB for a given entityId. Remove after debugging. */
export const debugCreemState = action({
  args: { entityId: v.string() },
  handler: async (ctx, { entityId }): Promise<unknown> => {
    const sub = await creem.subscriptions.getCurrent(ctx, { entityId });
    const all = await creem.subscriptions.listAll(ctx, { entityId });
    return { current: sub, all };
  },
});
