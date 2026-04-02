import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};
import Link from "next/link";
import Logo from "@/components/shared/logo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FBFBF9] flex flex-col items-center justify-center p-4">
      {/* Brand */}
      <Link href="/" className="flex items-center gap-2 mb-8 group">
        <Logo/>
      </Link>

      {/* Clerk UI drops in here */}
      {children}

      <p className="mt-6 text-xs text-muted-foreground">
        By signing up you agree to our{" "}
        <Link href="/terms" className="underline hover:text-foreground">
          Terms
        </Link>{" "}
        &{" "}
        <Link href="/privacy" className="underline hover:text-foreground">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
