import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Best Time to Post Instagram Reels Today | Free Calculator",
  description: "Find the best time to post Instagram Reels today by day and timezone. Free 2026 Reels posting time calculator for creators.",
  keywords: [
    "best time to post reels on instagram",
    "best time to post instagram reels",
    "best time to post on instagram reels",
    "best time to post reels on instagram today",
    "instagram reels posting time",
    "when to post reels on instagram",
  ],
  alternates: { canonical: "https://shortpurify.com/tools/best-time-to-post-instagram-reels" },
  openGraph: {
    title: "Best Time to Post Instagram Reels Today | Free Calculator",
    description: "Find the best time to post Instagram Reels today by day and timezone.",
    url: "https://shortpurify.com/tools/best-time-to-post-instagram-reels",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Time to Post Instagram Reels Today | Free Calculator",
    description: "Find the best time to post Instagram Reels today by day and timezone.",
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
            "name": "Best Time to Post Instagram Reels Calculator",
            "url": "https://shortpurify.com/tools/best-time-to-post-instagram-reels",
            "description": "Find the best time to post Instagram Reels today by day and timezone.",
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
