import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TikTok Caption Character Counter | Free Caption Checker",
  description: "Count TikTok caption characters, hashtags, mentions, and readability before posting. Free TikTok caption checker for creators.",
  keywords: [
    "tiktok caption character counter",
    "tiktok caption length checker",
    "tiktok character counter",
    "tiktok caption counter",
    "tiktok caption checker",
  ],
  alternates: { canonical: "https://shortpurify.com/tools/tiktok-caption-character-counter" },
  openGraph: {
    title: "TikTok Caption Character Counter | Free Caption Checker",
    description: "Count TikTok caption characters, hashtags, mentions, and readability before posting.",
    url: "https://shortpurify.com/tools/tiktok-caption-character-counter",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TikTok Caption Character Counter | Free Caption Checker",
    description: "Count TikTok caption characters, hashtags, mentions, and readability before posting.",
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
            "name": "TikTok Caption Character Counter",
            "url": "https://shortpurify.com/tools/tiktok-caption-character-counter",
            "description": "Count TikTok caption characters, hashtags, mentions, and readability before posting.",
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
