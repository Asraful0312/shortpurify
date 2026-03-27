"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";

export default function AcceptInvitePage() {
  const { user, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const invitationId = searchParams.get("id");

  const [state, setState] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  const acceptInvitation = useMutation(api.tenants.acceptInvitation);

  useEffect(() => {
    if (!isLoaded || !invitationId) return;
    if (!user) {
      // Redirect to sign-in with return URL
      router.replace(`/sign-in?redirect_url=/invite/accept?id=${invitationId}`);
      return;
    }

    acceptInvitation({ invitationId: invitationId as any })
      .then(() => {
        setState("success");
        setTimeout(() => router.replace("/dashboard/team"), 2500);
      })
      .catch((err: any) => {
        setState("error");
        setErrorMsg(err?.message ?? "Failed to accept invitation. It may have expired or already been used.");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, user?.id, invitationId]);

  if (!invitationId) {
    return (
      <PageShell>
        <XCircle size={48} className="text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-extrabold mb-2">Invalid Link</h1>
        <p className="text-muted-foreground mb-6">This invitation link is missing required information.</p>
        <Link href="/" className="text-primary font-bold hover:underline">Go home</Link>
      </PageShell>
    );
  }

  return (
    <PageShell>
      {state === "loading" && (
        <>
          <Loader2 size={48} className="text-primary animate-spin mx-auto mb-4" />
          <h1 className="text-2xl font-extrabold mb-2">Accepting Invitation…</h1>
          <p className="text-muted-foreground">Please wait a moment.</p>
        </>
      )}

      {state === "success" && (
        <>
          <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-extrabold mb-2">You're in!</h1>
          <p className="text-muted-foreground mb-1">Invitation accepted. Redirecting to your workspace…</p>
          <Link href="/dashboard/team" className="text-primary font-bold hover:underline text-sm">
            Go to Team page now
          </Link>
        </>
      )}

      {state === "error" && (
        <>
          <XCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-extrabold mb-2">Couldn't Accept</h1>
          <p className="text-muted-foreground mb-4">{errorMsg}</p>
          <Link href="/dashboard" className="text-primary font-bold hover:underline">
            Go to Dashboard
          </Link>
        </>
      )}
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-border shadow-sm p-10 text-center">
        <div className="mb-2">
          <span className="text-xl font-extrabold tracking-tight text-primary">ShortPurify</span>
        </div>
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
