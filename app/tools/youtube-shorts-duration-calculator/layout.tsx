import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "YouTube Shorts Duration Calculator | Free Tool",
  description: "Calculate how many YouTube Shorts you can make from a long video. Find the optimal clip length — 15s, 30s, 60s, or 3 minutes. Free, no sign-up required.",
  keywords: [
    "youtube shorts duration calculator",
    "youtube shorts timer",
    "how long should youtube shorts be",
    "youtube shorts length",
    "youtube shorts clip calculator",
    "how many shorts from long video",
    "youtube shorts optimal length",
    "youtube shorts 3 minutes",
  ],
  alternates: { canonical: "https://shortpurify.com/tools/youtube-shorts-duration-calculator" },
  openGraph: {
    title: "YouTube Shorts Duration Calculator | Free Tool",
    description: "Calculate how many YouTube Shorts you can make from a long video. Find the optimal clip length instantly. Free, no sign-up required.",
    url: "https://shortpurify.com/tools/youtube-shorts-duration-calculator",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "YouTube Shorts Duration Calculator | Free Tool",
    description: "Calculate how many YouTube Shorts you can make from a long video. Find the optimal clip length instantly. Free, no sign-up required.",
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
            "name": "YouTube Shorts Duration Calculator",
            "url": "https://shortpurify.com/tools/youtube-shorts-duration-calculator",
            "description": "Calculate how many YouTube Shorts you can make from a long video and find the optimal clip length.",
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
