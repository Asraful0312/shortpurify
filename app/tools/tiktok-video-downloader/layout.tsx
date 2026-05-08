import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free TikTok Video Download Helper | Best-Effort Tool",
  description: "Try a free best-effort TikTok video download helper. Paste a public TikTok link and get fallback steps if public extraction services are unavailable.",
  keywords: [
    "tiktok downloader",
    "tiktok video downloader",
    "tiktok no watermark",
    "download tiktok mp4",
    "free tiktok downloader",
    "tiktok to mp4",
    "save tiktok video",
    "tiktok download helper",
  ],
  alternates: { canonical: "https://shortpurify.com/tools/tiktok-video-downloader" },
  openGraph: {
    title: "Free TikTok Video Download Helper | Best-Effort Tool",
    description: "Try a free best-effort TikTok video download helper with clear fallback steps.",
    url: "https://shortpurify.com/tools/tiktok-video-downloader",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free TikTok Video Download Helper | Best-Effort Tool",
    description: "Try a free best-effort TikTok video download helper with clear fallback steps.",
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
            "name": "TikTok Video Download Helper",
            "url": "https://shortpurify.com/tools/tiktok-video-downloader",
            "description": "Try a free best-effort TikTok video download helper with clear fallback steps.",
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
