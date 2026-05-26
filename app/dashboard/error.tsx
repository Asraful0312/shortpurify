"use client";

import { useEffect } from "react";
import { RefreshCw, Loader2 } from "lucide-react";

// Module-level flag: allows one silent auto-retry per page session for
// post-login Clerk/Convex auth race conditions, then shows a manual button.
let hasAutoRetried = false;

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const shouldAutoRetry = !hasAutoRetried;

  useEffect(() => {
    console.error("[Dashboard error]", error);
    if (shouldAutoRetry) {
      hasAutoRetried = true;
      const t = setTimeout(reset, 400);
      return () => clearTimeout(t);
    }
  }, [error, reset, shouldAutoRetry]);

  if (shouldAutoRetry) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="animate-spin text-muted-foreground/40" size={20} />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="text-sm text-muted-foreground">
        Something went wrong loading the dashboard.
      </p>
      <button
        onClick={() => {
          hasAutoRetried = false;
          reset();
        }}
        className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        <RefreshCw size={14} />
        Retry
      </button>
    </div>
  );
}
