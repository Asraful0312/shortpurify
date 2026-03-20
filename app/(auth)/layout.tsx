import { ReactNode } from "react";
import { Sparkles } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FBFBF9] flex flex-col items-center justify-center p-4">
      {/* Brand */}
      <Link href="/" className="flex items-center gap-2 mb-8 group">
        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
          <Sparkles className="text-primary" size={20} />
        </div>
        <span className="text-2xl font-extrabold tracking-tight text-primary group-hover:opacity-80 transition-opacity">
          ShortPurify
        </span>
      </Link>

      {/* Clerk UI drops in here */}
      {children}

      <p className="mt-6 text-xs text-muted-foreground">
        By signing up you agree to our{" "}
        <Link href="/" className="underline hover:text-foreground">
          Terms
        </Link>{" "}
        &{" "}
        <Link href="/" className="underline hover:text-foreground">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
