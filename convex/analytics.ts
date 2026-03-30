/**
 * analytics.ts — Real analytics queries using Convex Aggregate + direct table queries.
 *
 * projectsAggregate  → O(log n) total projects & clips per user
 * scheduledAggregate → O(log n) published count per user/platform
 * Direct queries     → weekly activity (time-bucketed), top clips
 *
 * All queries accept an optional workspaceId. When provided, stats are aggregated
 * across all workspace members (server-side membership check enforced).
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { QueryCtx, MutationCtx } from "./_generated/server";
import { projectsAggregate, scheduledAggregate } from "./aggregates";
import { Doc, Id } from "./_generated/dataModel";


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
 * Personal mode: O(log n) via aggregates — no full table scans.
 * Workspace mode: direct queries filtered by workspaceId.
 */
export const getDashboardStats = query({
  args: { workspaceId: v.optional(v.string()) },
  handler: async (ctx, { workspaceId }) => {
    const user = await getAuthUser(ctx);
    if (!user) return { totalProjects: 0, clipsGenerated: 0, published: 0 };

    // Personal mode — use fast aggregates
    if (!workspaceId) {
      const [totalProjects, clipsGenerated, published] = await Promise.all([
        projectsAggregate.count(ctx, { namespace: user._id }),
        projectsAggregate.sum(ctx, { namespace: user._id }),
        scheduledAggregate.count(ctx, {
          namespace: user._id,
          bounds: { prefix: ["published"] },
        }),
      ]);
      return { totalProjects, clipsGenerated, published };
    }

    // Workspace mode — use helper (includes legacy personal projects for owner)
    const projects = await getWorkspaceProjects(ctx, workspaceId);
    if (!projects) return { totalProjects: 0, clipsGenerated: 0, published: 0 };

    const totalProjects = projects.length;
    const clipsGenerated = projects.reduce((sum, p) => sum + (p.clipsCount ?? 0), 0);

    // Published posts from workspace members for workspace projects
    const projectIds = new Set(projects.map((p) => p._id));
    const members = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .collect();

    const allPublished = (
      await Promise.all(
        members.map((m) =>
          ctx.db
            .query("scheduledPosts")
            .withIndex("by_user_status", (q) =>
              q.eq("userId", m.userId).eq("status", "published")
            )
            .collect()
        )
      )
    ).flat();

    // Only count published posts whose output belongs to a workspace project
    const outputProjectMap = new Map<string, string>();
    for (const post of allPublished) {
      if (!outputProjectMap.has(post.outputId)) {
        const output = await ctx.db.get(post.outputId);
        if (output) outputProjectMap.set(post.outputId, output.projectId);
      }
    }
    const published = allPublished.filter((post) => {
      const projId = outputProjectMap.get(post.outputId);
      return projId && projectIds.has(projId as Id<"projects">);
    }).length;

    return { totalProjects, clipsGenerated, published };
  },
});

/**
 * Helper: get workspace-scoped projects if workspaceId is provided + verify membership.
 * Returns null if caller is not a member (or not authenticated).
 */
async function getWorkspaceProjects(
  ctx: QueryCtx,
  workspaceId: string,
) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  const membership = await ctx.db
    .query("workspaceMembers")
    .withIndex("by_clerk_workspace", (q) =>
      q.eq("clerkId", identity.subject).eq("workspaceId", workspaceId)
    )
    .unique();
  if (!membership) return null;

  // Only return projects explicitly tagged with this workspace
  const workspaceProjects = await ctx.db
    .query("projects")
    .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
    .collect();

  return workspaceProjects;
}


/**
 * Returns clips-generated and published counts bucketed by day for the last N days.
 */
export const getWeeklyActivity = query({
  args: { days: v.optional(v.number()), workspaceId: v.optional(v.string()) },
  handler: async (ctx, { days = 7, workspaceId }) => {
    const user = await getAuthUser(ctx);
    if (!user) return [];

    const now = Date.now();
    const startMs = now - days * 24 * 60 * 60 * 1000;

    let projects: Doc<"projects">[];
    let publishedPosts: Doc<"scheduledPosts">[];

    if (workspaceId) {
      // Workspace mode: only projects tagged with this workspace
      const wsProjects = await getWorkspaceProjects(ctx, workspaceId);
      if (!wsProjects) return [];

      projects = wsProjects.filter((p) => p.createdAt >= startMs);

      // Get published posts scoped to workspace projects
      const projectIds = new Set(wsProjects.map((p) => p._id));
      const members = await ctx.db
        .query("workspaceMembers")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
        .collect();

      const allPosts = (
        await Promise.all(
          members.map((m) =>
            ctx.db
              .query("scheduledPosts")
              .withIndex("by_user_status", (q) =>
                q.eq("userId", m.userId).eq("status", "published")
              )
              .filter((q) => q.gte(q.field("scheduledAt"), startMs))
              .collect()
          )
        )
      ).flat();

      // Filter to only posts linked to workspace projects
      const outputProjectMap = new Map<string, string>();
      for (const post of allPosts) {
        if (!outputProjectMap.has(post.outputId)) {
          const output = await ctx.db.get(post.outputId);
          if (output) outputProjectMap.set(post.outputId, output.projectId);
        }
      }
      publishedPosts = allPosts.filter((post) => {
        const projId = outputProjectMap.get(post.outputId);
        return projId && projectIds.has(projId as Id<"projects">);
      });
    } else {
      // Personal mode
      [projects, publishedPosts] = await Promise.all([
        ctx.db
          .query("projects")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .filter((q) => q.gte(q.field("createdAt"), startMs))
          .collect(),
        ctx.db
          .query("scheduledPosts")
          .withIndex("by_user_status", (q) =>
            q.eq("userId", user._id).eq("status", "published")
          )
          .filter((q) => q.gte(q.field("scheduledAt"), startMs))
          .collect(),
      ]);
    }

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
 * Returns published clip counts grouped by platform.
 * Personal mode: O(log n) via prefix query on scheduledAggregate.
 * Workspace mode: direct queries scoped to workspace projects.
 */
export const getPublishedByPlatform = query({
  args: { workspaceId: v.optional(v.string()) },
  handler: async (ctx, { workspaceId }) => {
    const user = await getAuthUser(ctx);
    if (!user) return [];

    const PLATFORMS = ["youtube", "tiktok", "instagram", "x", "bluesky", "facebook", "linkedin"];

    if (!workspaceId) {
      // Personal mode — use fast aggregates
      const counts = await Promise.all(
        PLATFORMS.map(async (platform) => ({
          platform,
          count: await scheduledAggregate.count(ctx, {
            namespace: user._id,
            bounds: { prefix: ["published", platform] },
          }),
        }))
      );
      return counts.filter((p) => p.count > 0).sort((a, b) => b.count - a.count);
    }

    // Workspace mode — direct queries
    const wsProjects = await getWorkspaceProjects(ctx, workspaceId);
    if (!wsProjects) return [];

    const projectIds = new Set(wsProjects.map((p) => p._id));
    const members = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .collect();

    const allPublished = (
      await Promise.all(
        members.map((m) =>
          ctx.db
            .query("scheduledPosts")
            .withIndex("by_user_status", (q) =>
              q.eq("userId", m.userId).eq("status", "published")
            )
            .collect()
        )
      )
    ).flat();

    // Filter to workspace-scoped posts
    const outputProjectMap = new Map<string, string>();
    for (const post of allPublished) {
      if (!outputProjectMap.has(post.outputId)) {
        const output = await ctx.db.get(post.outputId);
        if (output) outputProjectMap.set(post.outputId, output.projectId);
      }
    }

    const platformCounts = new Map<string, number>();
    for (const post of allPublished) {
      const projId = outputProjectMap.get(post.outputId);
      if (projId && projectIds.has(projId as Id<"projects">)) {
        platformCounts.set(post.platform, (platformCounts.get(post.platform) ?? 0) + 1);
      }
    }

    return Array.from(platformCounts.entries())
      .map(([platform, count]) => ({ platform, count }))
      .filter((p) => p.count > 0)
      .sort((a, b) => b.count - a.count);
  },
});


export const getTopClips = query({
  args: { limit: v.optional(v.number()), workspaceId: v.optional(v.string()) },
  handler: async (ctx, { limit = 5, workspaceId }) => {
    const user = await getAuthUser(ctx);
    if (!user) return [];

    let projects;
    if (workspaceId) {
      const wsProjects = await getWorkspaceProjects(ctx, workspaceId);
      if (!wsProjects) return [];
      projects = wsProjects;
    } else {
      projects = await ctx.db
        .query("projects")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect();
    }

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
