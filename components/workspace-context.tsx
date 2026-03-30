"use client";

/**
 * workspace-context.tsx
 *
 * Provides the active workspace (organization) and the current user's role
 * throughout the dashboard. The selected workspace is persisted in localStorage.
 *
 * Usage:
 *   const { activeOrg, myRole, isOwner, isAdmin, orgs, setActiveOrgId } = useWorkspace();
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  type ReactNode,
} from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const STORAGE_KEY = "sp_active_org";

export type WorkspaceRole = "owner" | "admin" | "member" | null;

interface WorkspaceCtx {
  /** All orgs the user belongs to (undefined = loading) */
  orgs: ReturnType<typeof useQuery<typeof api.tenants.listOrganizations>> | undefined;
  /** The currently active org, or null if personal / not loaded */
  activeOrg: { _id: string; name: string; role: string } | null;
  /** Active org ID (string) */
  activeOrgId: string | null;
  /** Switch the active workspace */
  setActiveOrgId: (id: string) => void;
  /** The current user's role in the active workspace */
  myRole: WorkspaceRole;
  isOwner: boolean;
  isAdmin: boolean;
  /** true while orgs are still loading */
  isLoading: boolean;
}

const WorkspaceContext = createContext<WorkspaceCtx>({
  orgs: undefined,
  activeOrg: null,
  activeOrgId: null,
  setActiveOrgId: () => {},
  myRole: null,
  isOwner: false,
  isAdmin: false,
  isLoading: true,
});

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const orgs = useQuery(api.tenants.listOrganizations, {});

  // Initialise from localStorage synchronously (avoids flicker)
  const [activeOrgId, setActiveOrgIdState] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(STORAGE_KEY);
  });

  // Once orgs load, default to the first org if nothing is stored or the stored
  // org no longer exists (e.g., user was removed from that workspace).
  useEffect(() => {
    if (!orgs) return;
    const stillValid = activeOrgId && orgs.some((o) => o._id === activeOrgId);
    if (!stillValid) {
      const first = orgs[0]?._id ?? null;
      setActiveOrgIdState(first);
      if (first) localStorage.setItem(STORAGE_KEY, first);
      else localStorage.removeItem(STORAGE_KEY);
    }
  }, [orgs]); // eslint-disable-line react-hooks/exhaustive-deps

  const setActiveOrgId = (id: string) => {
    setActiveOrgIdState(id);
    localStorage.setItem(STORAGE_KEY, id);
  };

  const activeOrg = useMemo(
    () => (orgs && activeOrgId ? (orgs.find((o) => o._id === activeOrgId) ?? null) : null),
    [orgs, activeOrgId],
  );

  const myRole = (activeOrg?.role ?? null) as WorkspaceRole;
  const isOwner = myRole === "owner";
  const isAdmin = myRole === "owner" || myRole === "admin";

  return (
    <WorkspaceContext.Provider
      value={{
        orgs,
        activeOrg,
        activeOrgId,
        setActiveOrgId,
        myRole,
        isOwner,
        isAdmin,
        isLoading: orgs === undefined,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  return useContext(WorkspaceContext);
}
