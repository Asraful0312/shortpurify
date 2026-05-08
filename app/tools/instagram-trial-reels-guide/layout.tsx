import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "What Are Trial Reels on Instagram? | Free Creator Guide",
  description: "Learn what Instagram Trial Reels are, when to use them, and how to decide if a Reel should be posted as a trial first.",
  keywords: [
    "instagram trial reels",
    "trial reels instagram",
    "what are trial reels on instagram",
    "instagram trial reels guide",
    "should i use trial reels",
  ],
  alternates: { canonical: "https://shortpurify.com/tools/instagram-trial-reels-guide" },
  openGraph: {
    title: "What Are Trial Reels on Instagram? | Free Creator Guide",
    description: "Learn what Instagram Trial Reels are and when to use them.",
    url: "https://shortpurify.com/tools/instagram-trial-reels-guide",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "What Are Trial Reels on Instagram? | Free Creator Guide",
    description: "Learn what Instagram Trial Reels are and when to use them.",
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
            "name": "Instagram Trial Reels Guide",
            "url": "https://shortpurify.com/tools/instagram-trial-reels-guide",
            "description": "Learn what Instagram Trial Reels are and when to use them.",
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
