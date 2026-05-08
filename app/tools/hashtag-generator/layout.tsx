import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hashtag Generator | Free AI Tool for Instagram, TikTok & YouTube",
  description: "Generate the best hashtags for Instagram, TikTok, and YouTube Shorts instantly with AI. Free, no sign-up required. Get niche, medium, and broad hashtags tailored to your content.",
  keywords: [
    "hashtag generator",
    "Instagram hashtag generator",
    "TikTok hashtag generator",
    "YouTube hashtags",
    "free hashtag generator",
    "AI hashtag generator",
    "best hashtags for Instagram",
    "viral hashtags",
    "hashtag tool",
  ],
  alternates: { canonical: "https://shortpurify.com/tools/hashtag-generator" },
  openGraph: {
    title: "Hashtag Generator | Free AI Tool for Instagram, TikTok & YouTube",
    description: "Generate the best hashtags for Instagram, TikTok, and YouTube Shorts instantly with AI. Free, no sign-up required.",
    url: "https://shortpurify.com/tools/hashtag-generator",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hashtag Generator | Free AI Tool for Instagram, TikTok & YouTube",
    description: "Generate the best hashtags for Instagram, TikTok, and YouTube Shorts instantly with AI. Free, no sign-up required.",
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
            "name": "Hashtag Generator",
            "url": "https://shortpurify.com/tools/hashtag-generator",
            "description": "Generate the best hashtags for Instagram, TikTok, and YouTube Shorts instantly with AI. Free, no sign-up required.",
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
