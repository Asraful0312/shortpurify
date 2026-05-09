import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TikTok Hashtag Counter | Free Hashtag Checker",
  description: "Count TikTok hashtags, check hashtag mix, and avoid overloaded captions before posting short-form videos.",
  keywords: [
    "tiktok hashtag counter",
    "tiktok hashtag checker",
    "how many hashtags on tiktok",
    "tiktok hashtags count",
    "tiktok hashtag tool",
  ],
  alternates: { canonical: "https://shortpurify.com/tools/tiktok-hashtag-counter" },
  openGraph: {
    title: "TikTok Hashtag Counter | Free Hashtag Checker",
    description: "Count TikTok hashtags, check hashtag mix, and avoid overloaded captions.",
    url: "https://shortpurify.com/tools/tiktok-hashtag-counter",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TikTok Hashtag Counter | Free Hashtag Checker",
    description: "Count TikTok hashtags, check hashtag mix, and avoid overloaded captions.",
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
            "name": "TikTok Hashtag Counter",
            "url": "https://shortpurify.com/tools/tiktok-hashtag-counter",
            "description": "Count TikTok hashtags, check hashtag mix, and avoid overloaded captions.",
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
