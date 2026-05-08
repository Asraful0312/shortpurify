import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TikTok Caption Generator | Free AI Tool",
  description: "Generate viral TikTok captions with hashtags instantly using AI. Free, no sign-up required. Get engaging hooks, calls-to-action, and 20+ targeted hashtags.",
  keywords: [
    "TikTok caption generator",
    "TikTok caption ideas",
    "viral TikTok captions",
    "TikTok hashtag generator",
    "free TikTok caption tool",
    "AI caption generator",
    "TikTok content ideas",
  ],
  alternates: { canonical: "https://shortpurify.com/tools/tiktok-caption-generator" },
  openGraph: {
    title: "TikTok Caption Generator | Free AI Tool",
    description: "Generate viral TikTok captions with hashtags instantly using AI. Free, no sign-up required.",
    url: "https://shortpurify.com/tools/tiktok-caption-generator",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TikTok Caption Generator | Free AI Tool",
    description: "Generate viral TikTok captions with hashtags instantly using AI. Free, no sign-up required.",
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
            "name": "TikTok Caption Generator",
            "url": "https://shortpurify.com/tools/tiktok-caption-generator",
            "description": "Generate viral TikTok captions with hashtags instantly using AI. Free, no sign-up required.",
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
