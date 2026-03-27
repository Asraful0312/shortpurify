/**
 * analytics.ts — Real analytics queries using Convex Aggregate + direct table queries.
 *
 * projectsAggregate  → O(log n) total projects & clips per user
 * scheduledAggregate → O(log n) published count per user/platform
 * Direct queries     → weekly activity (time-bucketed), top clips
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { QueryCtx, MutationCtx } from "./_generated/server";
import { projectsAggregate, scheduledAggregate } from "./aggregates";


async function getAuthUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  return ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();
}



/**
 * Fast aggregate-based stats for the dashboard stats cards.
 * O(log n) for all three counts — no full table scans.
 */
export const getDashboardStats = query({
  handler: async (ctx) => {
    const user = await getAuthUser(ctx);
    if (!user) return { totalProjects: 0, clipsGenerated: 0, published: 0 };

    const [totalProjects, clipsGenerated, published] = await Promise.all([
      projectsAggregate.count(ctx, { namespace: user._id }),
      projectsAggregate.sum(ctx, { namespace: user._id }),
      scheduledAggregate.count(ctx, {
        namespace: user._id,
        bounds: { prefix: ["published"] },
      }),
    ]);

    return { totalProjects, clipsGenerated, published };
  },
});


/**
 * Returns clips-generated and published counts bucketed by day for the last N days.
 */
export const getWeeklyActivity = query({
  args: { days: v.optional(v.number()) },
  handler: async (ctx, { days = 7 }) => {
    const user = await getAuthUser(ctx);
    if (!user) return [];

    const now = Date.now();
    const startMs = now - days * 24 * 60 * 60 * 1000;

    const [projects, publishedPosts] = await Promise.all([
      ctx.db
        .query("projects")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .filter((q) => q.gte(q.field("createdAt"), startMs))
        .collect(),
      ctx.db
        .query("scheduledPosts")
        .withIndex("by_user_status", (q) =>
          q.eq("userId", user._id).eq("status", "published"),
        )
        .filter((q) => q.gte(q.field("scheduledAt"), startMs))
        .collect(),
    ]);

    // Build day buckets oldest-first
    const buckets: { day: string; date: number; clipsGenerated: number; published: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now - i * 24 * 60 * 60 * 1000);
      d.setHours(0, 0, 0, 0);
      buckets.push({ day: d.toLocaleDateString("en-US", { weekday: "short" }), date: d.getTime(), clipsGenerated: 0, published: 0 });
    }

    for (const p of projects) {
      if (p.status !== "complete") continue;
      const d = new Date(p.createdAt); d.setHours(0, 0, 0, 0);
      const b = buckets.find((x) => x.date === d.getTime());
      if (b) b.clipsGenerated += p.clipsCount ?? 0;
    }
    for (const p of publishedPosts) {
      const d = new Date(p.scheduledAt); d.setHours(0, 0, 0, 0);
      const b = buckets.find((x) => x.date === d.getTime());
      if (b) b.published += 1;
    }

    return buckets.map(({ day, clipsGenerated, published }) => ({ day, clipsGenerated, published }));
  },
});


/**
 * Returns published clip counts grouped by platform using the aggregate.
 * Each platform: O(log n) via prefix query on scheduledAggregate.
 */
export const getPublishedByPlatform = query({
  handler: async (ctx) => {
    const user = await getAuthUser(ctx);
    if (!user) return [];

    const PLATFORMS = ["youtube", "tiktok", "instagram", "x", "bluesky", "facebook", "linkedin"];

    const counts = await Promise.all(
      PLATFORMS.map(async (platform) => ({
        platform,
        count: await scheduledAggregate.count(ctx, {
          namespace: user._id,
          bounds: { prefix: ["published", platform] },
        }),
      })),
    );

    return counts.filter((p) => p.count > 0).sort((a, b) => b.count - a.count);
  },
});


export const getTopClips = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 5 }) => {
    const user = await getAuthUser(ctx);
    if (!user) return [];

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const allOutputs: { id: string; title: string; platform: string; viralScore: number; projectTitle: string }[] = [];

    for (const project of projects) {
      const outputs = await ctx.db
        .query("outputs")
        .withIndex("by_project", (q) => q.eq("projectId", project._id))
        .collect();
      for (const o of outputs) {
        allOutputs.push({
          id: o._id,
          title: o.title,
          platform: o.platform,
          viralScore: o.viralScore ?? 0,
          projectTitle: project.title,
        });
      }
    }

    return allOutputs.sort((a, b) => b.viralScore - a.viralScore).slice(0, limit);
  },
});


// Run once from the Convex dashboard after deploying to populate aggregates
// for existing data: npx convex run analytics:backfillAggregates

export const backfillAggregates = mutation({
  handler: async (ctx) => {
    // No auth check — this is a one-time admin migration run via `npx convex run`.
    // Convex deployment credentials provide sufficient protection.

    // Backfill projectsAggregate
    const projects = await ctx.db.query("projects").collect();
    for (const doc of projects) {
      try { await projectsAggregate.insertIfDoesNotExist(ctx, doc); } catch { /* already exists */ }
    }

    // Backfill scheduledAggregate
    const posts = await ctx.db.query("scheduledPosts").collect();
    for (const doc of posts) {
      try { await scheduledAggregate.insertIfDoesNotExist(ctx, doc); } catch { /* already exists */ }
    }

    return { projectsBackfilled: projects.length, postsBackfilled: posts.length };
  },
});
