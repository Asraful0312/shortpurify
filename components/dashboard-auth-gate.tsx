"use client";

import { useAuth } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

/**
 * Holds the entire dashboard render until Clerk has finished processing
 * its auth state (including post-login redirect token exchange).
 * Without this gate, Convex queries fire before the auth token is ready,
 * which can throw and trigger Next.js's global error boundary.
 */
export function DashboardAuthGate({ children }: { children: React.ReactNode }) {
  const { isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-secondary/20">
        <Loader2 className="animate-spin text-muted-foreground/40" size={24} />
      </div>
    );
  }

  return <>{children}</>;
}
