import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "YouTube Shorts Script Generator | Free AI Tool",
  description: "Generate a complete YouTube Shorts script instantly with AI hook, body, and call-to-action. Free, no sign-up required. Write viral short-form video scripts in seconds.",
  keywords: [
    "youtube shorts script generator",
    "youtube video script generator",
    "short form video script",
    "youtube shorts script",
    "AI script generator youtube",
    "viral video script",
    "youtube shorts script template",
    "free script generator",
  ],
  alternates: { canonical: "https://shortpurify.com/tools/youtube-shorts-script-generator" },
  openGraph: {
    title: "YouTube Shorts Script Generator | Free AI Tool",
    description: "Generate a complete YouTube Shorts script with hook, body, and CTA instantly. Free, no sign-up required.",
    url: "https://shortpurify.com/tools/youtube-shorts-script-generator",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "YouTube Shorts Script Generator | Free AI Tool",
    description: "Generate a complete YouTube Shorts script with hook, body, and CTA instantly. Free, no sign-up required.",
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
            "name": "YouTube Shorts Script Generator",
            "url": "https://shortpurify.com/tools/youtube-shorts-script-generator",
            "description": "Generate a complete YouTube Shorts script with hook, body, and call-to-action instantly using AI.",
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
