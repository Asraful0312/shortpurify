import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "YouTube Thumbnail Prompt Generator | Free AI Tool",
  description: "Generate optimized AI image prompts for YouTube thumbnails instantly. Get Midjourney, DALL-E 3, and Stable Diffusion prompts tailored to your video topic. Free, no sign-up.",
  keywords: [
    "YouTube thumbnail prompt generator",
    "AI YouTube thumbnail",
    "Midjourney YouTube thumbnail prompt",
    "DALL-E thumbnail prompt",
    "YouTube thumbnail generator",
    "AI thumbnail prompt",
    "YouTube thumbnail ideas",
    "thumbnail prompt generator",
  ],
  alternates: { canonical: "https://shortpurify.com/tools/youtube-thumbnail-prompt-generator" },
  openGraph: {
    title: "YouTube Thumbnail Prompt Generator | Free AI Tool",
    description: "Generate optimized AI image prompts for YouTube thumbnails. Get Midjourney, DALL-E 3, and Stable Diffusion prompts for your video. Free, no sign-up.",
    url: "https://shortpurify.com/tools/youtube-thumbnail-prompt-generator",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "YouTube Thumbnail Prompt Generator | Free AI Tool",
    description: "Generate optimized AI image prompts for YouTube thumbnails. Get Midjourney, DALL-E 3, and Stable Diffusion prompts for your video. Free, no sign-up.",
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
            "name": "YouTube Thumbnail Prompt Generator",
            "url": "https://shortpurify.com/tools/youtube-thumbnail-prompt-generator",
            "description": "Generate optimized AI image prompts for YouTube thumbnails instantly. Get Midjourney, DALL-E 3, and Stable Diffusion prompts tailored to your video topic.",
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
