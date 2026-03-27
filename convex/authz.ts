/**
 * authz.ts — Authorization config for ShortPurify workspaces.
 *
 * Roles:
 *   owner  — Full control: invite/remove/promote members, rename/delete workspace
 *   admin  — Invite members, manage projects & publishing
 *   member — View and work with projects; cannot invite or manage members
 *
 * We use TENANTS_PERMISSIONS and TENANTS_ROLES as defaults, extended with
 * ShortPurify-specific resources (projects, publishing).
 */

import { Authz, definePermissions, defineRoles } from "@djpanda/convex-authz";
import { TENANTS_PERMISSIONS, TENANTS_ROLES } from "@djpanda/convex-tenants";
import { components } from "./_generated/api";

const permissions = definePermissions(TENANTS_PERMISSIONS, {
  projects: { create: true, read: true, update: true, delete: true },
  publishing: { manage: true },
});

const roles = defineRoles(permissions, TENANTS_ROLES, {
  // owner already gets all permissions from TENANTS_ROLES; extend with app resources
  owner: { projects: ["create", "read", "update", "delete"], publishing: ["manage"] },
  admin: { projects: ["create", "read", "update", "delete"], publishing: ["manage"] },
  member: { projects: ["create", "read", "update"], publishing: ["manage"] },
});

export const authz = new Authz(components.authz, { permissions, roles });
