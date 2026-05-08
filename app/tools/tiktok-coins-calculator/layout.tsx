import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TikTok Coins to USD Calculator | Real-Time Gift Value 2025",
  description: "Calculate the exact value of TikTok coins in USD. Convert coins to dollars for buying or creator payouts. Free, real-time TikTok gift value calculator for 2025.",
  keywords: [
    "tiktok coins to usd",
    "tiktok coin calculator",
    "tiktok gift value 2025",
    "how much is 1 tiktok coin",
    "tiktok diamond to usd",
    "tiktok money calculator",
    "buy tiktok coins cheap",
    "tiktok universe gift price",
    "tiktok lion gift price",
  ],
  alternates: { canonical: "https://shortpurify.com/tools/tiktok-coins-calculator" },
  openGraph: {
    title: "TikTok Coins to USD Calculator | Real-Time Gift Value 2025",
    description: "Calculate the exact value of TikTok coins in USD. Convert coins to dollars for buying or creator payouts instantly.",
    url: "https://shortpurify.com/tools/tiktok-coins-calculator",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TikTok Coins to USD Calculator | Real-Time Gift Value 2025",
    description: "Calculate the exact value of TikTok coins in USD. Convert coins to dollars for buying or creator payouts instantly.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "TikTok Coins to USD Calculator",
            "url": "https://shortpurify.com/tools/tiktok-coins-calculator",
            "description": "Calculate the exact value of TikTok coins in USD. Convert coins to dollars for buying or creator payouts instantly.",
            "applicationCategory": "UtilityApplication",
            "operatingSystem": "Web",
            "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
            "creator": { "@type": "Organization", "name": "ShortPurify", "url": "https://shortpurify.com" },
          }),
        }}
      />
      {children}
    </>
  );
}
