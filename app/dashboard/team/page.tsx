"use client";

import { useState } from "react";
import { Users, Plus, Crown, Shield, User, Mail, Trash2, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

type Role = "owner" | "admin" | "member";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  joined: string;
  avatar: string;
  status: "active" | "pending";
}

const ROLE_CONFIG: Record<Role, { label: string; icon: React.ElementType; badge: "default" | "warning" | "secondary" }> = {
  owner: { label: "Owner", icon: Crown, badge: "default" },
  admin: { label: "Admin", icon: Shield, badge: "warning" },
  member: { label: "Member", icon: User, badge: "secondary" },
};

const MOCK_MEMBERS: TeamMember[] = [
  { id: "m1", name: "You", email: "you@example.com", role: "owner", joined: "Jan 2026", avatar: "Y", status: "active" },
  { id: "m2", name: "Rayhan Islam", email: "rayhan@example.com", role: "admin", joined: "Feb 2026", avatar: "R", status: "active" },
  { id: "m3", name: "Invited Member", email: "invite@example.com", role: "member", joined: "Pending", avatar: "I", status: "pending" },
];

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>(MOCK_MEMBERS);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("member");
  const [inviteSent, setInviteSent] = useState(false);

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;
    setInviteSent(true);
    setTimeout(() => {
      setInviteSent(false);
      setInviteEmail("");
    }, 2000);
  };

  const removeMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const seatLimit = 5;
  const usedSeats = members.length;

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto w-full min-h-full flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-extrabold tracking-tight">Team</h1>
            <Badge variant="secondary" className="text-[10px] font-extrabold uppercase tracking-widest">Phase 3</Badge>
          </div>
          <p className="text-muted-foreground">
            Collaborate with your team on projects and publishing.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-border px-4 py-2 rounded-xl shadow-sm">
          <Users size={16} className="text-muted-foreground" />
          <span className="text-sm font-bold">{usedSeats}/{seatLimit} seats used</span>
          {usedSeats >= seatLimit && (
            <a href="/dashboard/billing" className="text-xs text-primary font-bold hover:underline ml-1">
              Upgrade
            </a>
          )}
        </div>
      </div>

      {/* Invite */}
      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
        <h2 className="font-extrabold text-base mb-4 flex items-center gap-2">
          <Mail size={16} /> Invite Team Member
        </h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="colleague@example.com"
            type="email"
            className="flex-1 rounded-xl"
            onKeyDown={(e) => e.key === "Enter" && handleInvite()}
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as Role)}
            className="border border-border rounded-xl px-3 py-2 text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 sm:w-36"
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
          <button
            onClick={handleInvite}
            disabled={!inviteEmail.trim() || usedSeats >= seatLimit}
            className="bg-primary text-primary-foreground font-extrabold px-5 py-2.5 rounded-xl shadow-md hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
          >
            <Plus size={16} />
            {inviteSent ? "Invite Sent!" : "Send Invite"}
          </button>
        </div>
        {usedSeats >= seatLimit && (
          <p className="text-xs text-amber-600 font-bold mt-3 bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl">
            You've reached the seat limit for your plan.{" "}
            <a href="/dashboard/billing" className="underline">Upgrade to Agency</a> for more seats.
          </p>
        )}
      </div>

      {/* Members List */}
      <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-secondary/30">
          <h2 className="font-extrabold text-base">Members ({members.length})</h2>
        </div>
        <div className="divide-y divide-border">
          {members.map((member) => {
            const roleConfig = ROLE_CONFIG[member.role];
            const RoleIcon = roleConfig.icon;
            return (
              <div key={member.id} className="flex items-center gap-4 px-6 py-4 hover:bg-secondary/20 transition-colors">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-primary/20 text-primary font-extrabold flex items-center justify-center shrink-0 text-sm">
                  {member.avatar}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm truncate">{member.name}</p>
                    {member.status === "pending" && (
                      <Badge variant="secondary" className="text-[9px] font-extrabold uppercase">Pending</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                </div>

                {/* Joined */}
                <p className="text-xs text-muted-foreground font-medium hidden sm:block w-20 text-right">
                  {member.joined}
                </p>

                {/* Role */}
                <div className="shrink-0">
                  {member.role === "owner" ? (
                    <Badge variant={roleConfig.badge} className="flex items-center gap-1 text-[10px] font-extrabold">
                      <RoleIcon size={10} /> {roleConfig.label}
                    </Badge>
                  ) : (
                    <select
                      defaultValue={member.role}
                      className="border border-border rounded-lg px-2 py-1 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                  )}
                </div>

                {/* Actions */}
                {member.role !== "owner" && (
                  <button
                    onClick={() => removeMember(member.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors"
                    title="Remove member"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Workspace Settings */}
      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
        <h2 className="font-extrabold text-base">Workspace Settings</h2>
        <div>
          <label className="text-sm font-bold mb-1.5 block">Workspace Name</label>
          <Input defaultValue="My ShortPurify Workspace" className="rounded-xl max-w-sm" />
        </div>
        <div className="flex items-center justify-between p-4 border border-border rounded-xl">
          <div>
            <p className="text-sm font-bold">Members can invite others</p>
            <p className="text-xs text-muted-foreground mt-0.5">Allow admins and members to invite new people</p>
          </div>
          <div className="w-11 h-6 bg-secondary rounded-full relative cursor-not-allowed opacity-50 border border-border">
            <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 shadow-sm" />
          </div>
        </div>
        <button className="bg-primary text-primary-foreground font-extrabold px-6 py-2.5 rounded-xl shadow-md hover:bg-primary/90 transition-all active:scale-95 flex items-center gap-2 self-start">
          Save Workspace
        </button>
      </div>
    </div>
  );
}
