import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Instagram Reels Length Calculator | How Long Can Reels Be?",
  description: "Check Instagram Reels length limits and ideal duration. Free calculator for how long Instagram Reels can be in 2026.",
  keywords: [
    "how long can reels be on instagram",
    "how long can instagram reels be",
    "how long are instagram reels",
    "instagram reels length",
    "instagram reels duration",
    "reels length calculator",
  ],
  alternates: { canonical: "https://shortpurify.com/tools/instagram-reels-length-calculator" },
  openGraph: {
    title: "Instagram Reels Length Calculator | How Long Can Reels Be?",
    description: "Check Instagram Reels length limits and ideal duration.",
    url: "https://shortpurify.com/tools/instagram-reels-length-calculator",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Instagram Reels Length Calculator | How Long Can Reels Be?",
    description: "Check Instagram Reels length limits and ideal duration.",
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
            "name": "Instagram Reels Length Calculator",
            "url": "https://shortpurify.com/tools/instagram-reels-length-calculator",
            "description": "Check Instagram Reels length limits and ideal duration.",
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
