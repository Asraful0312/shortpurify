/**
 * admin.ts — Internal admin utilities.
 *
 * grantPlan — grant/revoke free plan overrides
 *   Convex dashboard → Functions → admin:grantPlan → Run
 *   { "email": "user@example.com", "tier": "pro", "days": 30 }
 *
 * sendSurveyToActiveUsers — one-shot survey email blast to users who generated clips
 *   Convex dashboard → Functions → admin:sendSurveyToActiveUsers → Run
 *   { "surveyUrl": "https://tally.so/r/yourform", "dryRun": true }   ← test first
 *   { "surveyUrl": "https://tally.so/r/yourform", "dryRun": false }  ← real send
 */

import { v } from "convex/values";
import { internalMutation, internalQuery, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

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

/** Returns every user who has at least one completed project (i.e. generated clips). */
export const getActiveUsers = internalQuery({
  args: {},
  handler: async (ctx) => {
    // Collect all completed projects, dedupe by userId
    const projects = await ctx.db
      .query("projects")
      .filter((q) => q.eq(q.field("status"), "complete"))
      .collect();

    const seenUserIds = new Set<string>();
    const users: { email: string; name: string | undefined }[] = [];

    for (const project of projects) {
      const id = project.userId as string;
      if (seenUserIds.has(id)) continue;
      seenUserIds.add(id);

      const user = await ctx.db.get(project.userId);
      if (user?.email) {
        users.push({ email: user.email, name: user.name });
      }
    }

    return users;
  },
});

/**
 * One-shot survey email blast to every user who has generated clips.
 *
 * Run from Convex dashboard → Functions → admin:sendSurveyToActiveUsers → Run
 *
 * Always do a dry run first:
 *   { "surveyUrl": "https://tally.so/r/yourform", "dryRun": true }
 * Then send for real:
 *   { "surveyUrl": "https://tally.so/r/yourform", "dryRun": false }
 */
export const sendSurveyToActiveUsers = internalAction({
  args: {
    surveyUrl: v.string(),
    dryRun: v.optional(v.boolean()),
  },
  handler: async (ctx, { surveyUrl, dryRun = true }) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error("RESEND_API_KEY is not set");

    const users = await ctx.runQuery(internal.admin.getActiveUsers, {});
    console.log(`[survey] ${users.length} active users found. dryRun=${dryRun}`);

    let sent = 0;
    let failed = 0;

    for (const user of users) {
      const firstName = user.name?.split(" ")[0] ?? "there";

      const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="font-family:system-ui,sans-serif;background:#f6f6f6;margin:0;padding:40px 0;">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,.08);">
    <div style="background:#1e3a2b;padding:32px 40px;">
      <h1 style="color:#fff;margin:0;font-size:22px;font-weight:800;letter-spacing:-.5px;">ShortPurify</h1>
    </div>
    <div style="padding:40px;">
      <h2 style="margin:0 0 16px;font-size:20px;font-weight:800;color:#111;">Quick question for you</h2>
      <p style="margin:0 0 16px;color:#555;line-height:1.7;">Hi ${firstName},</p>
      <p style="margin:0 0 16px;color:#555;line-height:1.7;">
        I'm the founder of ShortPurify. You've already used the app to generate clips, thank you!
      </p>
      <p style="margin:0 0 16px;color:#555;line-height:1.7;">
        I'm trying to make it better and I'd love to hear directly from you: what's working, what's missing,
        and what would make it worth paying for. It's <strong>4 questions, takes under 2 minutes.</strong>
      </p>
      <a href="${surveyUrl}"
        style="display:inline-block;background:#1e3a2b;color:#fff;text-decoration:none;font-weight:800;font-size:15px;padding:14px 32px;border-radius:12px;margin-bottom:24px;">
        Share Your Feedback →
      </a>
      <p style="margin:0;color:#555;line-height:1.7;">
        Thanks for your time, it genuinely helps
      </p>
      <hr style="margin:28px 0;border:none;border-top:1px solid #eee;"/>
      <p style="margin:0;color:#aaa;font-size:12px;">
        You received this because you have an account on ShortPurify.
      </p>
    </div>
  </div>
</body>
</html>`;

      if (dryRun) {
        console.log(`[survey] DRY RUN — would email: ${user.email} (${user.name ?? "no name"})`);
        sent++;
        continue;
      }

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "ShortPurify <hello@shortpurify.com>",
          to: [user.email],
          subject: "Quick question about ShortPurify (2 min)",
          html,
        }),
      });

      if (res.ok) {
        console.log(`[survey] Sent to ${user.email}`);
        sent++;
      } else {
        console.error(`[survey] Failed for ${user.email}:`, res.status, await res.text());
        failed++;
      }

      // Small delay to stay within Resend rate limits (2 req/s on free tier)
      await new Promise((r) => setTimeout(r, 600));
    }

    return `Done. sent=${sent} failed=${failed} dryRun=${dryRun}`;
  },
});
