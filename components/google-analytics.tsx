"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { getCookieConsent } from "@/components/cookie-consent";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

const GoogleAnalytics = () => {
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false);

  useEffect(() => {
    if (getCookieConsent() === "all") setAnalyticsAllowed(true);

    const handler = (e: Event) => {
      if ((e as CustomEvent).detail === "all") setAnalyticsAllowed(true);
    };
    window.addEventListener("cookie-consent-change", handler);
    return () => window.removeEventListener("cookie-consent-change", handler);
  }, []);

  if (!analyticsAllowed || !GA_ID || process.env.NODE_ENV !== "production") return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', { page_path: window.location.pathname });
          `,
        }}
      />
    </>
  );
};

export default GoogleAnalytics;
