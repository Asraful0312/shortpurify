/**
 * admin.ts — Internal admin mutations for managing granted plan overrides.
 *
 * Usage from Convex dashboard (Functions → admin:grantPlan → Run):
 *   { "email": "youtuber@example.com", "tier": "pro", "days": 30 }
 *
 * To revoke early:
 *   { "email": "youtuber@example.com", "tier": "starter", "days": 0 }
 */

import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

/**
 * Grant a free plan override to a user by email.
 * - tier: "pro" | "agency"
 * - days: number of days access lasts (0 = revoke immediately)
 * Set days to a large number (e.g. 365) for long-term access.
 */
export const grantPlan = internalMutation({
  args: {
    email: v.string(),
    tier: v.union(v.literal("pro"), v.literal("agency"), v.literal("revoke")),
    days: v.number(),
  },
  handler: async (ctx, { email, tier, days }) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), email))
      .unique();

    if (!user) throw new Error(`No user found with email: ${email}`);

    if (tier === "revoke") {
      await ctx.db.patch(user._id, {
        grantedTier: undefined,
        grantedTierExpiry: undefined,
      });
      return `Revoked plan override for ${email}`;
    }

    const expiry = days > 0 ? Date.now() + days * 24 * 60 * 60 * 1000 : undefined;

    await ctx.db.patch(user._id, {
      grantedTier: tier,
      grantedTierExpiry: expiry,
    });

    const expiryStr = expiry
      ? new Date(expiry).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
      : "never";

    return `Granted ${tier} plan to ${email} — expires: ${expiryStr}`;
  },
});
