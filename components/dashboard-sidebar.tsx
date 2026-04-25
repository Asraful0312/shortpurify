"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  UploadCloud,
  CreditCard,
  BarChart3,
  Send,
  Clock,
  Users,
  Settings,
  ChevronDown,
  Check,
  Building2,
  Crown,
  Shield,
  User,
  Plus,
  Lock,
  Loader2,
  X,
  HelpCircle,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "./shared/logo";
import { useWorkspace } from "./workspace-context";
import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { friendlyError } from "@/lib/utils";

const ROLE_ICON: Record<string, React.ElementType> = {
  owner: Crown,
  admin: Shield,
  member: User,
};

function PlanBadge({ tier }: { tier: "starter" | "pro" | "agency" }) {
  if (tier === "pro") {
    return (
      <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold uppercase tracking-wider bg-amber-400/20 text-amber-600 border border-amber-400/40 px-1.5 py-0.5 rounded-full">
        <Crown size={8} />
        Pro
      </span>
    );
  }
  if (tier === "agency") {
    return (
      <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold uppercase tracking-wider bg-violet-500/15 text-violet-600 border border-violet-400/40 px-1.5 py-0.5 rounded-full">
        <Zap size={8} />
        Agency
      </span>
    );
  }
  return null;
}

/** Modal for creating a new workspace */
function NewWorkspaceModal({ onClose, onCreated }: { onClose: () => void; onCreated: (id: string) => void }) {
  const canCreate = useQuery(api.usage.canCreateWorkspace);
  const createOrganization = useMutation(api.tenants.createOrganization);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    if (!name.trim()) return;
    setSaving(true);
    setError("");
    try {
      const result = await createOrganization({ name: name.trim() }) as { _id?: string } | string | null;
      // convex-tenants returns the org ID either directly or as an object
      const id = typeof result === "string" ? result : (result as { _id?: string })?._id ?? "";
      onCreated(id);
    } catch (err) {
      setError(friendlyError(err, "Failed to create workspace"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-border p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold">New Workspace</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <X size={16} />
          </button>
        </div>

        {canCreate === undefined ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 size={20} className="animate-spin text-muted-foreground" />
          </div>
        ) : !canCreate.allowed ? (
          /* Upgrade prompt */
          <div className="flex flex-col items-center gap-3 py-2 text-center">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
              <Lock size={20} className="text-amber-500" />
            </div>
            <div>
              <p className="font-extrabold text-sm">Agency plan required</p>
              <p className="text-xs text-muted-foreground mt-1">
                Multiple workspaces are available on the Agency plan. Upgrade to create unlimited workspaces for your clients and teams.
              </p>
            </div>
            <a
              href="/dashboard/billing"
              onClick={onClose}
              className="mt-1 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-extrabold shadow hover:bg-primary/90 transition-all"
            >
              Upgrade to Agency
            </a>
            <button onClick={onClose} className="text-xs text-muted-foreground hover:underline">
              Maybe later
            </button>
          </div>
        ) : (
          /* Create form */
          <>
            <div>
              <label className="text-sm font-bold mb-1.5 block">Workspace Name</label>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                placeholder="e.g. Acme Corp, Client XYZ…"
                className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                disabled={saving}
              />
            </div>
            {error && (
              <p className="text-xs text-red-600 font-semibold bg-red-50 border border-red-200 px-3 py-2 rounded-xl">
                {error}
              </p>
            )}
            <div className="flex gap-2 mt-1">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!name.trim() || saving}
                className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-extrabold shadow hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? <><Loader2 size={14} className="animate-spin" /> Creating…</> : "Create"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/** Workspace switcher dropdown */
function WorkspaceSwitcher() {
  const { orgs, activeOrg, setActiveOrgId, myRole, isLoading, activeOrgId } = useWorkspace();
  const tier = useQuery(api.usage.getDirectWorkspaceTier, { workspaceId: activeOrgId ?? undefined }) ?? "starter";
  const [open, setOpen] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (isLoading) {
    return <div className="h-12 bg-secondary animate-pulse rounded-xl mx-1" />;
  }

  const RoleIcon = ROLE_ICON[myRole ?? "member"] ?? User;

  return (
    <>
      <div ref={ref} className="relative mx-1">
        <button
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-secondary/60 hover:bg-secondary transition-colors border",
            tier === "agency" ? "border-violet-300 shadow-[0_0_0_1px_rgba(139,92,246,0.15)]" :
            tier === "pro"    ? "border-amber-300 shadow-[0_0_0_1px_rgba(251,191,36,0.15)]" :
            "border-border",
          )}
        >
          <div className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
            tier === "agency" ? "bg-violet-100 text-violet-600" :
            tier === "pro"    ? "bg-amber-100 text-amber-600" :
            "bg-primary/15 text-primary",
          )}>
            {tier === "agency" ? <Zap size={14} /> : tier === "pro" ? <Crown size={14} /> : <Building2 size={14} />}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-extrabold truncate leading-tight">{activeOrg?.name ?? "Loading…"}</p>
              <PlanBadge tier={tier} />
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <RoleIcon size={9} className="text-muted-foreground" />
              <p className="text-[10px] font-semibold text-muted-foreground capitalize">{myRole}</p>
            </div>
          </div>
          <ChevronDown size={14} className={cn("text-muted-foreground transition-transform shrink-0", open && "rotate-180")} />
        </button>

        {open && orgs && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-border rounded-xl shadow-lg z-50 overflow-hidden">
            {orgs.length > 1 && (
              <>
                <p className="px-3 pt-2.5 pb-1 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/60">
                  Switch Workspace
                </p>
                {orgs.map((org) => {
                  const Icon = ROLE_ICON[org.role] ?? User;
                  const isActive = org._id === activeOrg?._id;
                  return (
                    <button
                      key={org._id}
                      onClick={() => { setActiveOrgId(org._id); setOpen(false); }}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-secondary/60 transition-colors text-left",
                        isActive && "bg-primary/5"
                      )}
                    >
                      <div className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Building2 size={12} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate">{org.name}</p>
                        <div className="flex items-center gap-1">
                          <Icon size={9} className="text-muted-foreground" />
                          <p className="text-[10px] text-muted-foreground capitalize">{org.role}</p>
                        </div>
                      </div>
                      {isActive && <Check size={13} className="text-primary shrink-0" />}
                    </button>
                  );
                })}
                <div className="border-t border-border mx-2 my-1" />
              </>
            )}

            {/* New Workspace button — always visible */}
            <button
              onClick={() => { setOpen(false); setShowNewModal(true); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-secondary/60 transition-colors text-left text-primary"
            >
              <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                <Plus size={12} className="text-primary" />
              </div>
              <p className="text-xs font-bold">New Workspace</p>
            </button>
          </div>
        )}
      </div>

      {showNewModal && (
        <NewWorkspaceModal
          onClose={() => setShowNewModal(false)}
          onCreated={(id) => {
            setShowNewModal(false);
            if (id) setActiveOrgId(id);
          }}
        />
      )}
    </>
  );
}

function NavGroup({
  label,
  items,
  pathname,
  onNavClick,
}: {
  label?: string;
  items: { name: string; href: string; icon: React.ElementType; badge?: string }[];
  pathname: string;
  onNavClick?: () => void;
}) {
  return (
    <div className="mb-2">
      {label && (
        <p className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/60 mb-1">
          {label}
        </p>
      )}
      <div className="space-y-1">
        {items.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavClick}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon
                size={18}
                className={cn(isActive ? "text-primary-foreground" : "text-muted-foreground")}
              />
              <span className="flex-1">{item.name}</span>
              {item.badge && !isActive && (
                <span className="text-[9px] font-extrabold uppercase tracking-wide bg-accent/20 text-accent px-1.5 py-0.5 rounded-full border border-accent/30">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function DashboardSidebar({ onNavClick }: { onNavClick?: () => void } = {}) {
  const pathname = usePathname();
  const { isOwner, activeOrgId } = useWorkspace();
  const tier = useQuery(api.usage.getDirectWorkspaceTier, { workspaceId: activeOrgId ?? undefined }) ?? "starter";

  const mainNav = [
    { name: "Projects", href: "/dashboard", icon: LayoutDashboard },
    { name: "Create New", href: "/dashboard/upload", icon: UploadCloud },
  ];

  const publishNav = [
    { name: "Publish Hub", href: "/dashboard/publish", icon: Send },
    { name: "Scheduled", href: "/dashboard/scheduled", icon: Clock },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  ];

  // Members see Team page but can't manage — still useful to view
  const teamNav = [
    { name: "Team", href: "/dashboard/team", icon: Users },
  ];

  // Billing/Settings only for owners
  const accountNav = [
    ...(isOwner ? [{ name: "Settings", href: "/dashboard/settings", icon: Settings }] : []),
    ...(isOwner ? [{ name: "Billing", href: "/dashboard/billing", icon: CreditCard }] : []),
  ];

  return (
    <div className="flex h-full w-75% md:w-[260px] flex-col md:border-r border-border bg-background md:bg-white px-4 py-6">
      {/* Brand */}
      <Logo />

      {/* Workspace Switcher */}
      <div className="mt-5 mb-2">
        <WorkspaceSwitcher />
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-4 overflow-y-auto mt-4">
        <NavGroup items={mainNav} pathname={pathname} onNavClick={onNavClick} />
        <NavGroup label="Publish" items={publishNav} pathname={pathname} onNavClick={onNavClick} />
        <NavGroup label="Team" items={teamNav} pathname={pathname} onNavClick={onNavClick} />
        {accountNav.length > 0 && (
          <NavGroup label="Account" items={accountNav} pathname={pathname} onNavClick={onNavClick} />
        )}
      </nav>

      {/* Support */}
      <div className="mt-auto">
        <a
          href="mailto:support@shortpurify.com"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground font-medium transition-all"
        >
          <HelpCircle size={18} className="text-muted-foreground" />
          <span>Help &amp; Support</span>
        </a>
      </div>

      {/* User Area */}
      <div className="border-t border-border pt-4 px-2 space-y-2">
        <div className="flex items-center gap-3 px-2 py-2">
          <UserButton appearance={{ elements: { userButtonAvatarBox: "w-9 h-9" } }} />
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-foreground">My Account</span>
              <PlanBadge tier={tier} />
            </div>
            <span className="text-xs font-medium text-muted-foreground truncate w-28">
              {tier === "starter" ? "Free plan" : tier === "pro" ? "Pro Creator" : "Agency"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
