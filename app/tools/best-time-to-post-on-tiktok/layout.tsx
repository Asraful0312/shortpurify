import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Best Time to Post on TikTok 2025 | Interactive Global Calculator",
  description: "Find the best time to post on TikTok for your specific timezone. Based on 2025 algorithm research. Maximize your views and engagement on the FYP today.",
  keywords: [
    "best time to post on tiktok",
    "best time to post on tiktok 2025",
    "best time to post on tiktok wednesday",
    "tiktok posting schedule",
    "when to post on tiktok",
    "best times for tiktok engagement",
    "tiktok algorithm timing",
    "global tiktok posting times",
  ],
  alternates: { canonical: "https://shortpurify.com/tools/best-time-to-post-on-tiktok" },
  openGraph: {
    title: "Best Time to Post on TikTok 2025 | Interactive Global Calculator",
    description: "Find the best time to post on TikTok for your specific timezone. Based on 2025 algorithm research. Maximize your views and engagement.",
    url: "https://shortpurify.com/tools/best-time-to-post-on-tiktok",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Time to Post on TikTok 2025 | Interactive Global Calculator",
    description: "Find the best time to post on TikTok for your specific timezone. Based on 2025 algorithm research. Maximize your views and engagement.",
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
            "name": "Best Time to Post on TikTok Calculator",
            "url": "https://shortpurify.com/tools/best-time-to-post-on-tiktok",
            "description": "Find the best time to post on TikTok for your specific timezone based on 2025 algorithm research.",
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
