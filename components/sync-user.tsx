"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

/**
 * Invisible component — renders nothing.
 * Mount inside the dashboard layout so it fires once after Clerk loads the user,
 * creating or updating their row in the Convex `users` table.
 * On first login (isNew = true), auto-creates a personal workspace via convex-tenants.
 */
export function SyncUser() {
  const { user, isLoaded } = useUser();
  const upsertUser = useMutation(api.users.upsertUser);
  const createOrganization = useMutation(api.tenants.createOrganization);
  const orgs = useQuery(api.tenants.listOrganizations, {});

  useEffect(() => {
    if (!isLoaded || !user) return;

    upsertUser({
      clerkId: user.id,
      email: user.primaryEmailAddress?.emailAddress ?? "",
      name: user.fullName ?? undefined,
      imageUrl: user.imageUrl ?? undefined,
    }).catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, user?.id]);

  // Auto-create personal workspace once orgs load and user has none
  useEffect(() => {
    if (!isLoaded || !user || orgs === undefined || orgs.length > 0) return;

    const workspaceName = user.fullName ? `${user.fullName}'s Workspace` : "My Workspace";
    createOrganization({ name: workspaceName }).catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, user?.id, orgs]);

  return null;
}
