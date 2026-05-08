import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "YouTube Shorts Title Generator | Free AI Tool",
  description: "Generate 10 click-worthy YouTube Shorts titles instantly with AI. Free, no sign-up required. Optimized for the YouTube Shorts algorithm in 2025.",
  keywords: [
    "YouTube Shorts title generator",
    "YouTube Shorts title ideas",
    "AI title generator YouTube",
    "viral YouTube Shorts titles",
    "free YouTube title generator",
    "YouTube Shorts SEO",
  ],
  alternates: { canonical: "https://shortpurify.com/tools/youtube-shorts-title-generator" },
  openGraph: {
    title: "YouTube Shorts Title Generator | Free AI Tool",
    description: "Generate 10 click-worthy YouTube Shorts titles instantly with AI. Free, no sign-up required.",
    url: "https://shortpurify.com/tools/youtube-shorts-title-generator",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "YouTube Shorts Title Generator | Free AI Tool",
    description: "Generate 10 click-worthy YouTube Shorts titles instantly with AI. Free, no sign-up required.",
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
            "name": "YouTube Shorts Title Generator",
            "url": "https://shortpurify.com/tools/youtube-shorts-title-generator",
            "description": "Generate 10 click-worthy YouTube Shorts titles instantly with AI. Free, no sign-up required.",
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
