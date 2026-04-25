"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Users, Plus, Crown, Shield, User, Mail, Trash2, RotateCw, CheckCircle2, AlertCircle, Settings, Lock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useWorkspace } from "@/components/workspace-context";
import { friendlyError } from "@/lib/utils";

type Role = "owner" | "admin" | "member";

const ROLE_CONFIG: Record<Role, { label: string; icon: React.ElementType }> = {
  owner: { label: "Owner",  icon: Crown  },
  admin: { label: "Admin",  icon: Shield },
  member: { label: "Member", icon: User  },
};

/** Permissions per role — used to show capability summary */
const ROLE_CAPABILITIES: Record<Role, string[]> = {
  owner:  ["Manage members", "Change roles", "Rename workspace", "Delete workspace", "All publishing"],
  admin:  ["Invite members", "Manage projects", "All publishing"],
  member: ["View projects", "Upload & generate clips", "Publish clips"],
};

export default function TeamPage() {
  const { activeOrg, activeOrgId, myRole: ctxRole, isOwner: ctxIsOwner, isAdmin: ctxIsAdmin, isLoading: workspaceLoading } = useWorkspace();
  const orgId = activeOrgId ?? undefined;

  const members      = useQuery(api.tenants.listMembers,    orgId ? { organizationId: orgId } : "skip");
  const invitations  = useQuery(api.tenants.listInvitations, orgId ? { organizationId: orgId } : "skip");
  const currentMember = useQuery(api.tenants.getCurrentMember, orgId ? { organizationId: orgId } : "skip");
  const usage        = useQuery(api.usage.getUsage, { workspaceId: orgId });

  const inviteMember     = useMutation(api.tenants.inviteMember);
  const removeMember     = useMutation(api.tenants.removeMember);
  const updateMemberRole = useMutation(api.tenants.updateMemberRole);
  const cancelInvitation = useMutation(api.tenants.cancelInvitation);
  const resendInvitation = useMutation(api.tenants.resendInvitation);
  const updateOrg        = useMutation(api.tenants.updateOrganization);

  const [inviteEmail, setInviteEmail]   = useState("");
  const [inviteRole, setInviteRole]     = useState<"admin" | "member">("member");
  const [inviteState, setInviteState]   = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [inviteError, setInviteError]   = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [savingName, setSavingName]     = useState(false);
  const initializedRef = useRef(false);

  const isOwner = ctxIsOwner;
  const isAdmin = ctxIsAdmin;

  // Populate workspace name input once when activeOrg first loads — never overwrite user edits
  useEffect(() => {
    if (activeOrg?.name && !initializedRef.current) {
      setWorkspaceName(activeOrg.name);
      initializedRef.current = true;
    }
  }, [activeOrg?.name]);

  async function handleInvite() {
    if (!orgId || !inviteEmail.trim()) return;
    setInviteState("sending");
    setInviteError("");
    try {
      await inviteMember({
        organizationId: orgId,
        inviteeIdentifier: inviteEmail.trim(),
        role: inviteRole,
      });
      setInviteState("sent");
      setInviteEmail("");
      setTimeout(() => setInviteState("idle"), 3000);
    } catch (err: any) {
      setInviteState("error");
      setInviteError(friendlyError(err, "Failed to send invite"));
      setTimeout(() => setInviteState("idle"), 4000);
    }
  }

  async function handleRoleChange(memberUserId: string, newRole: string) {
    if (!orgId) return;
    try {
      await updateMemberRole({ organizationId: orgId, memberUserId, role: newRole });
    } catch (err: any) {
      alert(friendlyError(err, "Failed to update role"));
    }
  }

  async function handleRemoveMember(memberUserId: string) {
    if (!orgId || !confirm("Remove this member from the workspace?")) return;
    try {
      await removeMember({ organizationId: orgId, memberUserId });
    } catch (err: any) {
      alert(friendlyError(err, "Failed to remove member"));
    }
  }

  async function handleSaveWorkspaceName() {
    if (!orgId || !workspaceName.trim()) return;
    setSavingName(true);
    try {
      await updateOrg({ organizationId: orgId, name: workspaceName.trim() });
    } catch (err: any) {
      alert(friendlyError(err, "Failed to update workspace name"));
    } finally {
      setSavingName(false);
    }
  }

  const isLoading = workspaceLoading;
  const memberCount = members?.length ?? 0;
  const pendingCount = invitations?.filter((i) => i.status === "pending").length ?? 0;

  // Plan-based team limits
  const memberLimit = usage?.limits.teamMembers ?? null; // null = unlimited
  const atMemberLimit = memberLimit !== null && memberCount >= memberLimit;
  const isPaidPlan = usage?.tier !== "starter" && usage?.tier !== undefined;

  if (isLoading) {
    return (
      <div className="p-6 md:p-10 max-w-4xl mx-auto w-full">
        <div className="h-10 w-48 bg-secondary animate-pulse rounded-xl mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-secondary animate-pulse rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (!activeOrg) {
    return (
      <div className="p-6 md:p-10 max-w-4xl mx-auto w-full flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Users size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2">Setting up your workspace…</h3>
          <p className="text-muted-foreground text-sm">This only takes a moment.</p>
        </div>
      </div>
    );
  }

  const pendingInvites = invitations?.filter((i) => i.status === "pending") ?? [];

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto w-full min-h-full flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">{activeOrg.name}</h1>
          <p className="text-muted-foreground mt-1">Manage members and workspace settings.</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-border px-4 py-2 rounded-xl shadow-sm">
          <Users size={16} className="text-muted-foreground" />
          <span className="text-sm font-bold">
            {memberCount}{memberLimit !== null ? `/${memberLimit}` : ""} member{memberCount !== 1 ? "s" : ""}
          </span>
          {pendingCount > 0 && (
            <Badge variant="secondary" className="text-[10px] font-extrabold">
              {pendingCount} pending
            </Badge>
          )}
          {atMemberLimit && (
            <Badge variant="secondary" className="text-[10px] font-extrabold bg-amber-100 text-amber-700 border-amber-200">
              Limit reached
            </Badge>
          )}
        </div>
      </div>

      {/* Role Legend */}
      <div className="grid sm:grid-cols-3 gap-3">
        {(["owner", "admin", "member"] as Role[]).map((role) => {
          const { label, icon: Icon } = ROLE_CONFIG[role];
          return (
            <div key={role} className="bg-white border border-border rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Icon size={14} className="text-primary" />
                <span className="text-sm font-extrabold">{label}</span>
              </div>
              <ul className="space-y-0.5">
                {ROLE_CAPABILITIES[role].map((cap) => (
                  <li key={cap} className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-primary/40 shrink-0" />
                    {cap}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Invite Section — admins & owners only */}
      {isAdmin && (
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-extrabold text-base flex items-center gap-2">
              <Mail size={16} /> Invite Team Member
            </h2>
            {memberLimit !== null && (
              <span className="text-xs font-semibold text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
                {memberCount} / {memberLimit} seats used
              </span>
            )}
          </div>

          {/* Locked — Starter plan has no team members */}
          {!isPaidPlan ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <Lock size={18} className="text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-extrabold">Team collaboration requires Pro</p>
                <p className="text-xs text-muted-foreground mt-0.5">Upgrade to invite teammates and collaborate on projects.</p>
              </div>
              <a
                href="/dashboard/billing"
                className="mt-1 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-extrabold shadow hover:bg-primary/90 transition-all"
              >
                Upgrade to Pro
              </a>
            </div>
          ) : atMemberLimit ? (
            /* At member limit */
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <Lock size={18} className="text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-extrabold">Team seat limit reached</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  You have {memberCount}/{memberLimit} seats filled. Upgrade to Agency for unlimited team members.
                </p>
              </div>
              <a
                href="/dashboard/billing"
                className="mt-1 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-extrabold shadow hover:bg-primary/90 transition-all"
              >
                Upgrade to Agency
              </a>
            </div>
          ) : (
            /* Normal invite form */
            <>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  type="email"
                  className="flex-1 rounded-xl py-5"
                  onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                  disabled={inviteState === "sending"}
                />
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as "admin" | "member")}
                  className="border border-border rounded-xl px-3 py-2 text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 sm:w-36"
                  disabled={inviteState === "sending"}
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
                <button
                  onClick={handleInvite}
                  disabled={!inviteEmail.trim() || inviteState === "sending"}
                  className="bg-primary text-primary-foreground font-extrabold px-5 py-2.5 rounded-xl shadow-md hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                >
                  {inviteState === "sending" ? (
                    <><RotateCw size={14} className="animate-spin" /> Sending…</>
                  ) : inviteState === "sent" ? (
                    <><CheckCircle2 size={14} /> Sent!</>
                  ) : (
                    <><Plus size={16} /> Send Invite</>
                  )}
                </button>
              </div>
              {inviteState === "error" && (
                <p className="text-xs text-red-600 font-bold mt-3 bg-red-50 border border-red-200 px-3 py-2 rounded-xl flex items-center gap-1.5">
                  <AlertCircle size={12} /> {inviteError}
                </p>
              )}
              {inviteState === "sent" && (
                <p className="text-xs text-green-700 font-bold mt-3 bg-green-50 border border-green-200 px-3 py-2 rounded-xl flex items-center gap-1.5">
                  <CheckCircle2 size={12} /> Invitation email sent to {inviteEmail || "the invitee"}.
                </p>
              )}
            </>
          )}
        </div>
      )}

      {/* Members List */}
      <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-secondary/30">
          <h2 className="font-extrabold text-base">
            Members ({memberCount}{memberLimit !== null ? `/${memberLimit}` : ""})
          </h2>
        </div>
        <div className="divide-y divide-border">
          {members === undefined ? (
            [1, 2].map((i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <div className="w-10 h-10 rounded-full bg-secondary animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-32 bg-secondary animate-pulse rounded" />
                  <div className="h-3 w-48 bg-secondary animate-pulse rounded" />
                </div>
              </div>
            ))
          ) : (
            members.map((member) => {
              const role = member.role as Role;
              const { label, icon: RoleIcon } = ROLE_CONFIG[role] ?? ROLE_CONFIG.member;
              const isMe = member.userId === currentMember?.userId;
              const displayName = (member as any).user?.name ?? "Team Member";
              const displayEmail = (member as any).user?.email ?? "";
              const avatarLetter = displayName[0]?.toUpperCase() ?? "?";

              return (
                <div key={member.userId} className="flex items-center gap-4 px-6 py-4 hover:bg-secondary/20 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-primary/20 text-primary font-extrabold flex items-center justify-center shrink-0 text-sm">
                    {avatarLetter}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm truncate">{displayName}{isMe ? " (you)" : ""}</p>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{displayEmail}</p>
                  </div>

                  {/* Role */}
                  <div className="shrink-0">
                    {role === "owner" || !isOwner ? (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary text-xs font-bold">
                        <RoleIcon size={11} /> {label}
                      </div>
                    ) : (
                      <select
                        value={role}
                        onChange={(e) => handleRoleChange(member.userId, e.target.value)}
                        className="border border-border rounded-lg px-2 py-1 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                    )}
                  </div>

                  {/* Remove — owners can remove non-owners */}
                  {isOwner && role !== "owner" && (
                    <button
                      onClick={() => handleRemoveMember(member.userId)}
                      className="p-2 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors"
                      title="Remove member"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Pending Invitations */}
      {pendingInvites.length > 0 && (
        <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-secondary/30">
            <h2 className="font-extrabold text-base">Pending Invitations ({pendingInvites.length})</h2>
          </div>
          <div className="divide-y divide-border">
            {pendingInvites.map((inv) => (
              <div key={inv._id} className="flex items-center gap-4 px-6 py-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 font-extrabold flex items-center justify-center shrink-0 text-sm">
                  <Mail size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{inv.inviteeIdentifier}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    Invited as {inv.role} · expires {new Date(inv.expiresAt).toLocaleDateString()}
                  </p>
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => resendInvitation({ invitationId: inv._id })}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg border border-border hover:bg-secondary transition-colors"
                    >
                      Resend
                    </button>
                    <button
                      onClick={() => cancelInvitation({ invitationId: inv._id })}
                      className="p-2 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors"
                      title="Cancel invitation"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Workspace Settings — owners only */}
      {isOwner && (
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <h2 className="font-extrabold text-base flex items-center gap-2">
            <Settings size={16} /> Workspace Settings
          </h2>
          <div>
            <label className="text-sm font-bold mb-1.5 block">Workspace Name</label>
            <div className="flex gap-3 max-w-sm">
              <Input
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                className="rounded-xl flex-1 py-5"
                onKeyDown={(e) => e.key === "Enter" && handleSaveWorkspaceName()}
              />
              <button
                onClick={handleSaveWorkspaceName}
                disabled={savingName || workspaceName.trim() === activeOrg.name}
                className="bg-primary text-primary-foreground font-extrabold px-4 py-2 rounded-xl shadow-sm hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {savingName ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
