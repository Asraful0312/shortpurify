import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Instagram Reels Safe Zone Checker | Free Overlay Guide",
  description: "Check Instagram Reels safe zones for captions, logos, and faces. Free 9:16 Reels overlay guide for 1080x1920 videos.",
  keywords: [
    "instagram reels safe zone",
    "reels safe zone checker",
    "instagram reels caption safe zone",
    "instagram reels overlay guide",
    "instagram reels ui safe area",
  ],
  alternates: { canonical: "https://shortpurify.com/tools/instagram-reels-safe-zone-checker" },
  openGraph: {
    title: "Instagram Reels Safe Zone Checker | Free Overlay Guide",
    description: "Check Instagram Reels safe zones for captions, logos, and faces.",
    url: "https://shortpurify.com/tools/instagram-reels-safe-zone-checker",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Instagram Reels Safe Zone Checker | Free Overlay Guide",
    description: "Check Instagram Reels safe zones for captions, logos, and faces.",
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
            "name": "Instagram Reels Safe Zone Checker",
            "url": "https://shortpurify.com/tools/instagram-reels-safe-zone-checker",
            "description": "Check Instagram Reels safe zones for captions, logos, and faces.",
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
