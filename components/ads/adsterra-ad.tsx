"use client";

import { useEffect, useId, useRef } from "react";
import { usePathname } from "next/navigation";

const BANNER_UNITS = {
  rectangle: {
    key: "9595bec832e8d529f728ed6c8dd6aede",
    width: 300,
    height: 250,
  },
  leaderboard: {
    key: "46c2b24ded9cc50699eec302fa3bd5d9",
    width: 728,
    height: 90,
  },
  mobile: {
    key: "2d74c43ef0fc890e33e8b508ec24a79f",
    width: 320,
    height: 50,
  },
} as const;

type BannerSize = keyof typeof BANNER_UNITS;

function useAdsterraBanner(size: BannerSize) {
  const ref = useRef<HTMLDivElement>(null);
  const unit = BANNER_UNITS[size];

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    container.innerHTML = "";

    const optionsScript = document.createElement("script");
    optionsScript.type = "text/javascript";
    optionsScript.innerHTML = `
      atOptions = {
        'key': '${unit.key}',
        'format': 'iframe',
        'height': ${unit.height},
        'width': ${unit.width},
        'params': {}
      };
    `;

    const invokeScript = document.createElement("script");
    invokeScript.type = "text/javascript";
    invokeScript.src = `https://www.highperformanceformat.com/${unit.key}/invoke.js`;

    container.append(optionsScript, invokeScript);

    return () => {
      container.innerHTML = "";
    };
  }, [unit.height, unit.key, unit.width]);

  return ref;
}

function AdLabel() {
  return (
    <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
      Advertisement
    </p>
  );
}

export function AdsterraBannerAd({ size, className = "" }: { size: BannerSize; className?: string }) {
  const ref = useAdsterraBanner(size);
  const unit = BANNER_UNITS[size];

  return (
    <aside className={`mx-auto w-full ${className}`} aria-label="Advertisement">
      <AdLabel />
      <div
        className="mx-auto overflow-hidden rounded-xl border border-border/60 bg-white shadow-sm"
        style={{ width: unit.width, minHeight: unit.height }}
      >
        <div ref={ref} />
      </div>
    </aside>
  );
}

export function AdsterraResponsiveBanner({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <div className="hidden md:block">
        <AdsterraBannerAd size="leaderboard" />
      </div>
      <div className="md:hidden">
        <AdsterraBannerAd size="mobile" />
      </div>
    </div>
  );
}

export function AdsterraRectangleAd({ className = "" }: { className?: string }) {
  return <AdsterraBannerAd size="rectangle" className={className} />;
}

export function AdsterraNativeBanner({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const stableId = useId().replaceAll(":", "");
  const containerId = `container-d250d160b6a8857af036f17eda7ba756-${stableId}`;

  useEffect(() => {
    const wrapper = ref.current;
    if (!wrapper) return;

    wrapper.innerHTML = "";

    const adContainer = document.createElement("div");
    adContainer.id = "container-d250d160b6a8857af036f17eda7ba756";

    const script = document.createElement("script");
    script.async = true;
    script.dataset.cfasync = "false";
    script.src = "https://pl29488115.effectivecpmnetwork.com/d250d160b6a8857af036f17eda7ba756/invoke.js";

    wrapper.append(script, adContainer);

    return () => {
      wrapper.innerHTML = "";
    };
  }, [containerId]);

  return (
    <aside className={`mx-auto w-full ${className}`} aria-label="Advertisement">
      <AdLabel />
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-white p-3 shadow-sm">
        <div ref={ref} />
      </div>
    </aside>
  );
}

export function AdsterraToolsBottomAd() {
  const pathname = usePathname();
  const shouldHide =
    pathname === "/tools" ||
    pathname === "/tools/tiktok-video-downloader" ||
    !pathname.startsWith("/tools/");

  if (shouldHide) return null;

  return (
    <div className="bg-[#FAFAF8] px-4 pb-12">
      <AdsterraRectangleAd />
    </div>
  );
}
