import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "YouTube Monetization Checker | Free Tool",
  description: "Check if a YouTube channel meets the YouTube Partner Program (YPP) requirements. Enter any channel URL or @handle to see subscriber count, video count, and monetization eligibility instantly.",
  keywords: [
    "youtube monetization checker",
    "youtube monetization eligibility",
    "youtube partner program checker",
    "YPP eligibility checker",
    "youtube channel monetization",
    "can I monetize my youtube channel",
    "youtube 1000 subscribers checker",
    "youtube monetization requirements",
  ],
  alternates: { canonical: "https://shortpurify.com/tools/youtube-monetization-checker" },
  openGraph: {
    title: "YouTube Monetization Checker | Free Tool",
    description: "Check if a YouTube channel meets YPP requirements. Enter any channel URL or @handle instantly. Free, no sign-up required.",
    url: "https://shortpurify.com/tools/youtube-monetization-checker",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "YouTube Monetization Checker | Free Tool",
    description: "Check if a YouTube channel meets YPP requirements. Enter any channel URL or @handle instantly. Free, no sign-up required.",
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
            "name": "YouTube Monetization Checker",
            "url": "https://shortpurify.com/tools/youtube-monetization-checker",
            "description": "Check if a YouTube channel meets YouTube Partner Program requirements. Free, no sign-up required.",
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
