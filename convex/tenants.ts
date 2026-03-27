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
});
