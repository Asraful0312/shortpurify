import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Instagram Reels Caption Length Checker | Free Counter",
  description: "Check Instagram Reels caption length, character count, hashtag count, and readability before posting.",
  keywords: [
    "instagram reels caption length",
    "instagram caption length checker",
    "reels caption character counter",
    "instagram caption counter",
    "instagram reels caption checker",
  ],
  alternates: { canonical: "https://shortpurify.com/tools/instagram-reels-caption-length-checker" },
  openGraph: {
    title: "Instagram Reels Caption Length Checker | Free Counter",
    description: "Check Instagram Reels caption length, character count, hashtag count, and readability.",
    url: "https://shortpurify.com/tools/instagram-reels-caption-length-checker",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Instagram Reels Caption Length Checker | Free Counter",
    description: "Check Instagram Reels caption length, character count, hashtag count, and readability.",
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
            "name": "Instagram Reels Caption Length Checker",
            "url": "https://shortpurify.com/tools/instagram-reels-caption-length-checker",
            "description": "Check Instagram Reels caption length, character count, hashtag count, and readability.",
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
