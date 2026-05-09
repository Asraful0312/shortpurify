import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "YouTube Shorts Title Length Checker | Free Counter",
  description: "Check YouTube Shorts title length, character count, word count, and mobile readability before publishing.",
  keywords: [
    "youtube shorts title length checker",
    "youtube shorts title counter",
    "youtube title length checker",
    "youtube shorts title character limit",
    "shorts title checker",
  ],
  alternates: { canonical: "https://shortpurify.com/tools/youtube-shorts-title-length-checker" },
  openGraph: {
    title: "YouTube Shorts Title Length Checker | Free Counter",
    description: "Check YouTube Shorts title length, character count, word count, and mobile readability.",
    url: "https://shortpurify.com/tools/youtube-shorts-title-length-checker",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "YouTube Shorts Title Length Checker | Free Counter",
    description: "Check YouTube Shorts title length, character count, word count, and mobile readability.",
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
            "name": "YouTube Shorts Title Length Checker",
            "url": "https://shortpurify.com/tools/youtube-shorts-title-length-checker",
            "description": "Check YouTube Shorts title length, character count, word count, and mobile readability.",
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
