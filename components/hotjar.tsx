"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { getCookieConsent } from "@/components/cookie-consent";

const HotJar = () => {
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false);

  useEffect(() => {
    // Check consent on mount
    if (getCookieConsent() === "all") {
      setAnalyticsAllowed(true);
    }

    // Listen for consent changes from the banner
    const handler = (e: Event) => {
      if ((e as CustomEvent).detail === "all") setAnalyticsAllowed(true);
    };
    window.addEventListener("cookie-consent-change", handler);
    return () => window.removeEventListener("cookie-consent-change", handler);
  }, []);

  if (!analyticsAllowed || process.env.NODE_ENV !== "production") return null;

  return (
    <Script
      id="hotjar-script"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function(h,o,t,j,a,r){
            h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
            h._hjSettings={hjid:6679664,hjsv:6};
            a=o.getElementsByTagName('head')[0];
            r=o.createElement('script');r.async=1;
            r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
            a.appendChild(r);
          })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
        `,
      }}
    />
  );
};

export default HotJar;
