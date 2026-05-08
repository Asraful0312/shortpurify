import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trending Songs on Instagram Reels Today | Free Finder",
  description: "Find trending songs on Instagram Reels today with a simple research checklist, audio scoring system, and Reels sound workflow.",
  keywords: [
    "trending songs on instagram reels today",
    "instagram reels trending songs",
    "trending audio instagram reels",
    "instagram reels songs today",
    "reels audio finder",
  ],
  alternates: { canonical: "https://shortpurify.com/tools/instagram-trending-songs-finder" },
  openGraph: {
    title: "Trending Songs on Instagram Reels Today | Free Finder",
    description: "Find trending songs on Instagram Reels today with a simple research checklist.",
    url: "https://shortpurify.com/tools/instagram-trending-songs-finder",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Trending Songs on Instagram Reels Today | Free Finder",
    description: "Find trending songs on Instagram Reels today with a simple research checklist.",
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
            "name": "Instagram Trending Songs Finder",
            "url": "https://shortpurify.com/tools/instagram-trending-songs-finder",
            "description": "Find trending songs on Instagram Reels today with a simple research checklist.",
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
