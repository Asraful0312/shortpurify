import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Instagram Reels Size Calculator | Ratio, Dimensions & Safe Zone",
  description: "Calculate Instagram Reels size, aspect ratio, dimensions, and safe zones. Free 9:16 Reels size calculator for 1080x1920 videos.",
  keywords: [
    "instagram reels size",
    "instagram reels size ratio",
    "instagram reels dimensions",
    "instagram reels aspect ratio",
    "aspect ratio for instagram reels",
    "instagram reels size calculator",
  ],
  alternates: { canonical: "https://shortpurify.com/tools/instagram-reels-size-calculator" },
  openGraph: {
    title: "Instagram Reels Size Calculator | Ratio, Dimensions & Safe Zone",
    description: "Calculate Instagram Reels size, aspect ratio, dimensions, and safe zones.",
    url: "https://shortpurify.com/tools/instagram-reels-size-calculator",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Instagram Reels Size Calculator | Ratio, Dimensions & Safe Zone",
    description: "Calculate Instagram Reels size, aspect ratio, dimensions, and safe zones.",
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
            "name": "Instagram Reels Size Calculator",
            "url": "https://shortpurify.com/tools/instagram-reels-size-calculator",
            "description": "Calculate Instagram Reels size, aspect ratio, dimensions, and safe zones.",
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
