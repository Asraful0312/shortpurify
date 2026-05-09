import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Instagram Reels Cover Size Calculator | Free Cover Guide",
  description: "Calculate Instagram Reels cover size, profile grid crop, and feed preview dimensions for better Reels thumbnails.",
  keywords: [
    "instagram reels cover size",
    "reels cover size calculator",
    "instagram reels thumbnail size",
    "instagram reels cover dimensions",
    "reels profile grid crop",
  ],
  alternates: { canonical: "https://shortpurify.com/tools/instagram-reels-cover-size-calculator" },
  openGraph: {
    title: "Instagram Reels Cover Size Calculator | Free Cover Guide",
    description: "Calculate Instagram Reels cover size, profile grid crop, and feed preview dimensions.",
    url: "https://shortpurify.com/tools/instagram-reels-cover-size-calculator",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Instagram Reels Cover Size Calculator | Free Cover Guide",
    description: "Calculate Instagram Reels cover size, profile grid crop, and feed preview dimensions.",
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
            "name": "Instagram Reels Cover Size Calculator",
            "url": "https://shortpurify.com/tools/instagram-reels-cover-size-calculator",
            "description": "Calculate Instagram Reels cover size, profile grid crop, and feed preview dimensions.",
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
