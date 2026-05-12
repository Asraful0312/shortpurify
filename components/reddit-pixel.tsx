"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";

declare global {
  interface Window {
    rdt?: (...args: unknown[]) => void;
  }
}

export default function RedditPixelEvents() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded || !user || !window.rdt) return;

    const isNewUser =
      user.createdAt != null &&
      Date.now() - new Date(user.createdAt).getTime() < 5 * 60 * 1000;
    const alreadyTracked = sessionStorage.getItem("rdt_signup");

    if (isNewUser && !alreadyTracked) {
      window.rdt("track", "SignUp");
      sessionStorage.setItem("rdt_signup", "1");
    }
  }, [isLoaded, user]);

  return null;
}
