"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

const COOKIE_NAME = "sp_ref";
const COOKIE_DAYS = 180;

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

export function getReferralCode(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export default function ReferralCapture() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("via") ?? searchParams.get("ref");
    if (code) setCookie(COOKIE_NAME, code, COOKIE_DAYS);
  }, [searchParams]);

  return null;
}
