/**
 * tenants.ts — Workspace / team management via @djpanda/convex-tenants.
 *
 * Each "organization" in convex-tenants = a ShortPurify workspace.
 * Auto-created (personal workspace) by upsertUser on first login.
 *
 * Roles:
 *   owner  — full control (invite, remove, promote, rename, delete)
 *   admin  — invite members, manage projects/publishing
 *   member — work with projects; cannot manage members
 */

import { makeTenantsAPI } from "@djpanda/convex-tenants";
import { components, internal } from "./_generated/api";
import { authz } from "./authz";
import { ConvexError } from "convex/values";

export const {
  // Organizations (= workspaces)
  listOrganizations,
  getOrganization,
  getOrganizationBySlug,
  createOrganization,
  updateOrganization,
  transferOwnership,
  deleteOrganization,

  // Members
  listMembers,
  countMembers,
  getMember,
  getCurrentMember,
  getCurrentUserEmail,
  checkMemberPermission,
  addMember,
  removeMember,
  updateMemberRole,
  suspendMember,
  unsuspendMember,
  leaveOrganization,

  // Invitations
  listInvitations,
  countInvitations,
  getInvitation,
  getPendingInvitations,
  inviteMember,
  acceptInvitation,
  resendInvitation,
  cancelInvitation,

  // Authorization
  checkPermission,
  getUserPermissions,
  getUserRoles,
} = makeTenantsAPI(components.tenants, {
  authz,
  creatorRole: "owner",

  /**
   * Returns the Clerk subject (identity.subject) as the userId for convex-tenants.
   * The auth callback only receives { auth } — no db access available here.
   * We use the Clerk ID as the stable per-user identifier within the tenants system.
   */
  auth: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    return identity?.subject ?? null;
  },

  /**
   * Enrich member listings with name + email.
   * userId here is the Clerk ID (identity.subject) — look up via clerkId index.
   * getUser receives { db } so we can query directly.
   */
  getUser: async (ctx, userId) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", userId))
      .unique();
    if (!user) return null;
    return { name: user.name ?? undefined, email: user.email };
  },

  /** Invitation expires after 7 days (ms) */
  defaultInvitationExpiration: 7 * 24 * 60 * 60 * 1000,

  /**
   * Send invitation email via Resend when a member is invited.
   */
  onInvitationCreated: async (ctx, invitation) => {
    // Enforce plan-based team member limits before sending the invite
    const check = await ctx.runQuery(internal.usage.canInviteMember, {
      workspaceId: invitation.organizationId,
    });
    if (!check.allowed) throw new ConvexError(check.reason);

    await ctx.scheduler.runAfter(0, internal.emails.sendInvitation, {
      email: invitation.inviteeIdentifier,
      organizationName: invitation.organizationName,
      inviterName: invitation.inviterName ?? undefined,
      role: invitation.role,
      invitationId: invitation.invitationId,
      expiresAt: invitation.expiresAt,
    });
  },

  /**
   * Resend invitation — same email, refreshed expiry.
   */
  onInvitationResent: async (ctx, invitation) => {
    await ctx.scheduler.runAfter(0, internal.emails.sendInvitation, {
      email: invitation.inviteeIdentifier,
      organizationName: invitation.organizationName,
      inviterName: invitation.inviterName ?? undefined,
      role: invitation.role,
      invitationId: invitation.invitationId,
      expiresAt: invitation.expiresAt,
    });
  },

  // ── workspaceMembers sync hooks ──────────────────────────────────────────

  /** Creator becomes owner when a workspace is created. */
  onOrganizationCreated: async (ctx, { organizationId, ownerId }) => {
    // Enforce per-plan workspace creation limits (check BEFORE inserting the new membership)
    const check = await ctx.runQuery(internal.usage.canCreateWorkspaceForUser, { clerkId: ownerId });
    if (!check.allowed) throw new ConvexError(check.reason);

    await ctx.runMutation(internal.workspaceMembers.upsertMember, {
      workspaceId: organizationId,
      clerkId: ownerId,
      role: "owner",
    });
  },

  /** Owner was transferred — update roles for both users. */
  onMemberRoleChanged: async (ctx, { organizationId, userId, newRole }) => {
    await ctx.runMutation(internal.workspaceMembers.upsertMember, {
      workspaceId: organizationId,
      clerkId: userId,
      role: newRole,
    });
  },

  /** Admin directly added a member via addMember mutation. */
  onMemberAdded: async (ctx, { organizationId, userId, role }) => {
    await ctx.runMutation(internal.workspaceMembers.upsertMember, {
      workspaceId: organizationId,
      clerkId: userId,
      role,
    });
  },

  /** Invited user accepted — add them to workspaceMembers. */
  onInvitationAccepted: async (ctx, { organizationId, userId, role }) => {
    await ctx.runMutation(internal.workspaceMembers.upsertMember, {
      workspaceId: organizationId,
      clerkId: userId,
      role,
    });
  },

  /** Member was removed by an admin/owner. */
  onMemberRemoved: async (ctx, { organizationId, userId }) => {
    await ctx.runMutation(internal.workspaceMembers.removeMember, {
      workspaceId: organizationId,
      clerkId: userId,
    });
  },

  /** Member left voluntarily. */
  onMemberLeft: async (ctx, { organizationId, userId }) => {
    await ctx.runMutation(internal.workspaceMembers.removeMember, {
      workspaceId: organizationId,
      clerkId: userId,
    });
  },

  /** Workspace deleted — clean up all membership rows. */
  onOrganizationDeleted: async (ctx, { organizationId }) => {
    await ctx.runMutation(internal.workspaceMembers.removeAllMembers, {
      workspaceId: organizationId,
    });
  },
});
