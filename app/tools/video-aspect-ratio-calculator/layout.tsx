import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Video Aspect Ratio Calculator | Free Tool",
  description: "Instantly calculate and convert video aspect ratios for any platform. Find the right dimensions for YouTube Shorts, TikTok, Instagram Reels, and more. Free, no sign-up.",
  keywords: [
    "video aspect ratio calculator",
    "video dimensions calculator",
    "9:16 aspect ratio",
    "YouTube Shorts dimensions",
    "TikTok video size",
    "Instagram Reels dimensions",
    "aspect ratio converter",
    "video size calculator",
  ],
  alternates: { canonical: "https://shortpurify.com/tools/video-aspect-ratio-calculator" },
  openGraph: {
    title: "Video Aspect Ratio Calculator | Free Tool",
    description: "Instantly calculate and convert video aspect ratios for YouTube Shorts, TikTok, Instagram Reels, and more. Free, no sign-up.",
    url: "https://shortpurify.com/tools/video-aspect-ratio-calculator",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Video Aspect Ratio Calculator | Free Tool",
    description: "Instantly calculate and convert video aspect ratios for YouTube Shorts, TikTok, Instagram Reels, and more. Free, no sign-up.",
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
            "name": "Video Aspect Ratio Calculator",
            "url": "https://shortpurify.com/tools/video-aspect-ratio-calculator",
            "description": "Instantly calculate and convert video aspect ratios for any platform. Find the right dimensions for YouTube Shorts, TikTok, Instagram Reels, and more.",
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
