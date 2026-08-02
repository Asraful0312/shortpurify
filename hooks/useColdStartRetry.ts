"use client";

import { useEffect, useState } from "react";

const COLD_START_SECONDS = 50;

/** Tracks a countdown after a cold-start-style failure (e.g. a sleeping free-tier
 * backend) and automatically calls `onRetry` once the countdown reaches zero. */
export function useColdStartRetry(onRetry: () => void) {
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setTimeout(() => {
      setSecondsLeft((s) => {
        const next = s - 1;
        if (next <= 0) onRetry();
        return next;
      });
    }, 1000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  return {
    secondsLeft,
    isWaking: secondsLeft > 0,
    start: () => setSecondsLeft(COLD_START_SECONDS),
  };
}
