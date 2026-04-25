"use client";

import { useState, useEffect, useRef } from "react";
import { Save, Trash2, AlertTriangle, Building2, UserCircle, ExternalLink, Loader2, Bell } from "lucide-react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useMutation, useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useWorkspace } from "@/components/workspace-context";
import { useRouter } from "next/navigation";
import { friendlyError } from "@/lib/utils";

function ConfirmDialog({
  title,
  description,
  confirmLabel,
  danger,
  onConfirm,
  onClose,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handle() {
    setLoading(true);
    setError("");
    try {
      await onConfirm();
      onClose();
    } catch (e) {
      setError(friendlyError(e, "Something went wrong"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-border p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${danger ? "bg-red-100" : "bg-amber-100"}`}>
            <AlertTriangle size={18} className={danger ? "text-red-600" : "text-amber-600"} />
          </div>
          <h2 className="text-base font-extrabold">{title}</h2>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
        {error && (
          <p className="text-xs text-red-600 font-semibold bg-red-50 border border-red-200 px-3 py-2 rounded-xl">{error}</p>
        )}
        <div className="flex gap-2 mt-1">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-secondary transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handle}
            disabled={loading}
            className={`flex-1 py-2.5 rounded-xl text-sm font-extrabold transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 ${
              danger
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useUser();
  const { openUserProfile } = useClerk();
  const { activeOrgId, activeOrg, isOwner } = useWorkspace();
  const router = useRouter();

  // Workspace rename
  const updateOrganization = useMutation(api.tenants.updateOrganization);
  const [workspaceName, setWorkspaceName] = useState("");
  const [renameSaving, setRenameSaving] = useState(false);
  const [renameError, setRenameError] = useState("");
  const [renameSaved, setRenameSaved] = useState(false);
  const nameInitialized = useRef(false);

  const currentName = activeOrg?.name ?? "";

  // Set the input value once when activeOrg first loads — never overwrite user edits
  useEffect(() => {
    if (activeOrg?.name && !nameInitialized.current) {
      setWorkspaceName(activeOrg.name);
      nameInitialized.current = true;
    }
  }, [activeOrg?.name]);

  // Email notifications
  const currentUser = useQuery(api.users.getCurrentUser);
  const setEmailNotifications = useMutation(api.users.setEmailNotifications);
  const [notifSaving, setNotifSaving] = useState(false);
  const emailNotifEnabled = currentUser?.emailNotifications !== false; // default true

  async function handleNotifToggle() {
    setNotifSaving(true);
    try {
      await setEmailNotifications({ enabled: !emailNotifEnabled });
    } finally {
      setNotifSaving(false);
    }
  }

  // Danger zone
  const deleteAllProjects = useAction(api.projects.deleteAllWorkspaceProjects);
  const deleteOrganization = useMutation(api.tenants.deleteOrganization);

  const [confirmDialog, setConfirmDialog] = useState<null | "deleteProjects" | "deleteWorkspace">(null);

  const isPersonal = !activeOrgId;

  async function handleRename() {
    if (!activeOrgId || !workspaceName.trim() || workspaceName.trim() === currentName) return;
    setRenameSaving(true);
    setRenameError("");
    try {
      await updateOrganization({ organizationId: activeOrgId, name: workspaceName.trim() });
      setRenameSaved(true);
      setTimeout(() => setRenameSaved(false), 2000);
    } catch (e) {
      setRenameError(friendlyError(e, "Failed to rename workspace"));
    } finally {
      setRenameSaving(false);
    }
  }

  async function handleDeleteAllProjects() {
    if (!activeOrgId) return;
    await deleteAllProjects({ workspaceId: activeOrgId });
  }

  async function handleDeleteWorkspace() {
    if (!activeOrgId) return;
    await deleteOrganization({ organizationId: activeOrgId });
    router.push("/dashboard");
  }

  if (!isOwner) {
    return (
      <div className="p-6 md:p-10 max-w-3xl mx-auto w-full">
        <h1 className="text-3xl font-extrabold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Only workspace owners can access settings.</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto w-full min-h-full flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your workspace and account preferences.</p>
      </div>

      {/* Profile */}
      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
        <h2 className="font-extrabold flex items-center gap-2">
          <UserCircle size={18} /> My Account
        </h2>
        <div className="flex items-center gap-4">
          {user?.imageUrl && (
            <img src={user.imageUrl} alt="avatar" className="w-14 h-14 rounded-full object-cover border border-border" />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate">{user?.fullName ?? "—"}</p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.primaryEmailAddress?.emailAddress ?? "—"}
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Your name, email, password, and profile picture are managed through your Clerk account.
        </p>
        <button
          onClick={() => openUserProfile()}
          className="self-start flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-secondary hover:bg-secondary/80 text-sm font-bold transition-colors"
        >
          <ExternalLink size={14} /> Manage Profile
        </button>
      </div>

      {/* Workspace name */}
      {!isPersonal && (
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <h2 className="font-extrabold flex items-center gap-2">
            <Building2 size={18} /> Workspace Settings
          </h2>
          <div>
            <label className="text-sm font-bold mb-1.5 block">Workspace Name</label>
            <input
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRename()}
              placeholder={currentName}
              maxLength={60}
              className="w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {renameError && (
              <p className="text-xs text-red-600 font-semibold mt-1.5">{renameError}</p>
            )}
          </div>
          <button
            onClick={handleRename}
            disabled={renameSaving || !workspaceName.trim() || workspaceName.trim() === currentName}
            className="self-start flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-extrabold text-sm shadow hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {renameSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {renameSaved ? "Saved!" : "Save Name"}
          </button>
        </div>
      )}

      {/* Notifications */}
      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
        <h2 className="font-extrabold flex items-center gap-2">
          <Bell size={18} /> Notifications
        </h2>
        <div className="flex items-center justify-between p-4 border border-border rounded-xl">
          <div>
            <p className="text-sm font-bold">Scheduled post notifications</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Get an email when a scheduled post is published or fails.
            </p>
          </div>
          <button
            type="button"
            disabled={notifSaving || currentUser === undefined}
            onClick={handleNotifToggle}
            className={`relative w-11 h-6 rounded-full transition-colors shrink-0 disabled:opacity-50 ${emailNotifEnabled ? "bg-primary" : "bg-secondary border border-border"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${emailNotifEnabled ? "translate-x-5" : "translate-x-0"}`} />
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white border-2 border-red-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
        <h2 className="font-extrabold text-red-600 flex items-center gap-2">
          <Trash2 size={18} /> Danger Zone
        </h2>
        <p className="text-sm text-muted-foreground">These actions are irreversible. Please proceed with caution.</p>

        {/* Delete all projects */}
        {!isPersonal && (
          <div className="flex items-center justify-between p-4 border border-red-200 rounded-xl bg-red-50/30">
            <div>
              <p className="text-sm font-bold text-red-700">Delete All Workspace Projects</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Permanently removes all projects, clips, and exports in this workspace.
              </p>
            </div>
            <button
              onClick={() => setConfirmDialog("deleteProjects")}
              className="ml-4 shrink-0 px-4 py-2 border border-red-300 text-red-600 font-bold text-sm rounded-xl hover:bg-red-50 transition-colors"
            >
              Delete All
            </button>
          </div>
        )}

        {/* Delete workspace */}
        {!isPersonal && (
          <div className="flex items-center justify-between p-4 border border-red-200 rounded-xl bg-red-50/30">
            <div>
              <p className="text-sm font-bold text-red-700">Delete Workspace</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Permanently delete this workspace, all its projects, and remove all members.
              </p>
            </div>
            <button
              onClick={() => setConfirmDialog("deleteWorkspace")}
              className="ml-4 shrink-0 px-4 py-2 bg-red-600 text-white font-bold text-sm rounded-xl hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        )}

        {/* Personal workspace — just show info */}
        {isPersonal && (
          <div className="p-4 border border-border rounded-xl text-sm text-muted-foreground">
            Your personal workspace cannot be deleted. To close your account, contact support.
          </div>
        )}
      </div>

      {/* Confirm dialogs */}
      {confirmDialog === "deleteProjects" && (
        <ConfirmDialog
          title="Delete All Projects?"
          description={`This will permanently delete every project, clip, and export in "${currentName}". This cannot be undone.`}
          confirmLabel="Delete All Projects"
          danger
          onConfirm={handleDeleteAllProjects}
          onClose={() => setConfirmDialog(null)}
        />
      )}
      {confirmDialog === "deleteWorkspace" && (
        <ConfirmDialog
          title="Delete Workspace?"
          description={`This will permanently delete the "${currentName}" workspace, all its projects, and remove all members. This cannot be undone.`}
          confirmLabel="Delete Workspace"
          danger
          onConfirm={handleDeleteWorkspace}
          onClose={() => setConfirmDialog(null)}
        />
      )}
    </div>
  );
}
