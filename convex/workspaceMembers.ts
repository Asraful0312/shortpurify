/**
 * workspaceMembers.ts — Denormalized workspace membership table.
 *
 * Because convex-tenants stores org data in its own internal component tables
 * (not accessible from app-level queries), we maintain a shadow copy here so
 * that queries like listWorkspaceProjects and deleteProject can do server-side
 * membership checks without an extra round-trip.
 *
 * Data is kept in sync via:
 *   1. Hooks in tenants.ts (onMemberAdded, onMemberRemoved, etc.)
 *   2. syncMembership mutation called from SyncUser on every login
 *      (handles existing orgs that pre-date the hooks).
 */

import { v } from "convex/values";
import { internalMutation, internalQuery, mutation } from "./_generated/server";

// ─── Public: called from the client on every login ────────────────────────────

/**
 * Upserts the current user's membership for a given workspace.
 * Safe to call multiple times — idempotent.
 */
export const syncMembership = mutation({
  args: { workspaceId: v.string(), role: v.string() },
  handler: async (ctx, { workspaceId, role }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return;

    const existing = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_clerk_workspace", (q) =>
        q.eq("clerkId", identity.subject).eq("workspaceId", workspaceId)
      )
      .unique();

    if (existing) {
      if (existing.role !== role || existing.userId !== user._id) {
        await ctx.db.patch(existing._id, { role, userId: user._id });
      }
    } else {
      await ctx.db.insert("workspaceMembers", {
        workspaceId,
        clerkId: identity.subject,
        userId: user._id,
        role,
      });
    }
  },
});

// ─── Internal: called from tenants.ts hooks ───────────────────────────────────

/** Upsert a member (used by onMemberAdded, onInvitationAccepted, onMemberRoleChanged). */
export const upsertMember = internalMutation({
  args: { workspaceId: v.string(), clerkId: v.string(), role: v.string() },
  handler: async (ctx, { workspaceId, clerkId, role }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();
    // User may not exist yet (invited by email before they've signed up).
    // They'll be added when they accept the invitation and log in via syncMembership.
    if (!user) return;

    const existing = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_clerk_workspace", (q) =>
        q.eq("clerkId", clerkId).eq("workspaceId", workspaceId)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { role, userId: user._id });
    } else {
      await ctx.db.insert("workspaceMembers", {
        workspaceId,
        clerkId,
        userId: user._id,
        role,
      });
    }
  },
});

/** Remove a single member from a workspace. */
export const removeMember = internalMutation({
  args: { workspaceId: v.string(), clerkId: v.string() },
  handler: async (ctx, { workspaceId, clerkId }) => {
    const existing = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_clerk_workspace", (q) =>
        q.eq("clerkId", clerkId).eq("workspaceId", workspaceId)
      )
      .unique();
    if (existing) await ctx.db.delete(existing._id);
  },
});

/** Remove all members when a workspace is deleted. */
export const removeAllMembers = internalMutation({
  args: { workspaceId: v.string() },
  handler: async (ctx, { workspaceId }) => {
    const members = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .collect();
    await Promise.all(members.map((m) => ctx.db.delete(m._id)));
  },
});

// ─── Internal queries: used for server-side auth checks ───────────────────────

/** Get a single membership row — used to check if caller belongs to a workspace. */
export const getMembership = internalQuery({
  args: { workspaceId: v.string(), clerkId: v.string() },
  handler: async (ctx, { workspaceId, clerkId }) => {
    return ctx.db
      .query("workspaceMembers")
      .withIndex("by_clerk_workspace", (q) =>
        q.eq("clerkId", clerkId).eq("workspaceId", workspaceId)
      )
      .unique();
  },
});

/** Get all members of a workspace — used by listWorkspaceProjects. */
export const listMembers = internalQuery({
  args: { workspaceId: v.string() },
  handler: async (ctx, { workspaceId }) => {
    return ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .collect();
  },
});
