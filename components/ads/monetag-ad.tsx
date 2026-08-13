"use client";

import { useEffect } from "react";

/** Injects a Monetag self-injecting ad loader script once, guarding against
 * duplicate injection across re-renders/remounts (React strict mode, route
 * changes that remount the host component, etc). Monetag's in-page formats
 * place themselves on the page — there is no container div to target. */
function useMonetagScript(zone: string, src: string) {
  useEffect(() => {
    if (document.querySelector(`script[data-zone="${zone}"]`)) return;

    const script = document.createElement("script");
    script.dataset.zone = zone;
    script.src = src;
    (document.body || document.documentElement).appendChild(script);

    return () => {
      script.remove();
    };
  }, [zone, src]);
}

/** Active format — renders like an in-content banner, no permission prompts,
 * no tab hijacking. Add once per page (not per ad slot). */
export function MonetagInPagePush() {
  useMonetagScript("11568566", "https://nap5k.com/tag.min.js");
  return null;
}

/** Throttled full-screen ad shown between navigations — same pattern Google
 * itself uses (vignette ads), so it's a comparatively "acceptable" format. */
export function MonetagVignetteBanner() {
  useMonetagScript("11568568", "https://n6wxm.com/vignette.min.js");
  return null;
}

/** Push Notifications format — prompts the visitor to opt into browser
 * notifications, then serves ads via that channel. Uses a plain external
 * <script src> tag (Monetag's own snippet shape for this format), unlike
 * the self-injecting zone-based loader the other two formats use. */
export function MonetagPushNotification() {
  useEffect(() => {
    const src = "https://5gvci.com/act/files/tag.min.js?z=11568766";
    if (document.querySelector(`script[src="${src}"]`)) return;

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.cfasync = "false";
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);
  return null;
}

const DIRECT_LINK_URL = "https://omg10.com/4/11568776";

/** Direct Link format — unlike the others, this isn't a script: it's a URL
 * that pays out when a visitor actually clicks through. Rendered as a small,
 * clearly labeled sponsored link rather than bound to an existing button or
 * a page-wide click handler, so it can't be mistaken for site UI. */
export function MonetagDirectLinkAd({ className = "" }: { className?: string }) {
  return (
    <div className={`text-center ${className}`}>
      <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Advertisement</p>
      <a
        href={DIRECT_LINK_URL}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="inline-block text-sm font-semibold text-primary hover:underline"
      >
        Sponsored offer — tap to view
      </a>
    </div>
  );
}
