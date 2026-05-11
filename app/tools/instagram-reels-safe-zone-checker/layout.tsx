import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Instagram Reels Safe Zone Checker | Free Overlay Guide",
  description: "Check Instagram Reels safe zones for captions, logos, and faces. Free 9:16 Reels overlay guide for 1080x1920 videos.",
  keywords: [
    "instagram reels safe zone",
    "reels safe zone checker",
    "instagram reels caption safe zone",
    "instagram reels overlay guide",
    "instagram reels ui safe area",
  ],
  alternates: { canonical: "https://shortpurify.com/tools/instagram-reels-safe-zone-checker" },
  openGraph: {
    title: "Instagram Reels Safe Zone Checker | Free Overlay Guide",
    description: "Check Instagram Reels safe zones for captions, logos, and faces.",
    url: "https://shortpurify.com/tools/instagram-reels-safe-zone-checker",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Instagram Reels Safe Zone Checker | Free Overlay Guide",
    description: "Check Instagram Reels safe zones for captions, logos, and faces.",
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
            "name": "Instagram Reels Safe Zone Checker",
            "url": "https://shortpurify.com/tools/instagram-reels-safe-zone-checker",
            "description": "Check Instagram Reels safe zones for captions, logos, and faces.",
            "applicationCategory": "UtilityApplication",
            "operatingSystem": "Web",
            "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
            "creator": { "@type": "Organization", "name": "ShortPurify", "url": "https://shortpurify.com" },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              { "@type": "Question", "name": "What is the Instagram Reels safe zone?", "acceptedAnswer": { "@type": "Answer", "text": "The Instagram Reels safe zone is the center area of the 9:16 frame where text, logos, and key visuals won't be covered by UI elements. For 1080x1920 Reels, keep important content away from the top 14%, bottom 35%, and right 8% of the frame." } },
              { "@type": "Question", "name": "Where are the UI overlays on Instagram Reels?", "acceptedAnswer": { "@type": "Answer", "text": "Instagram overlays the username, caption, and audio info at the bottom of the Reel. The right side has action buttons (like, comment, share, save). The top-left shows the back arrow. Avoid placing text or logos in these areas." } },
              { "@type": "Question", "name": "What dimensions should I use for safe zone on Instagram Reels?", "acceptedAnswer": { "@type": "Answer", "text": "For a 1080x1920 Reel, keep your main content in the center 1080x1200 area (approximately). Avoid the bottom 600 pixels (where the caption and username appear) and the right 100 pixels (action buttons)." } },
              { "@type": "Question", "name": "Does the safe zone apply to TikTok and YouTube Shorts too?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. All three platforms (Instagram Reels, TikTok, YouTube Shorts) use similar 9:16 formats with UI overlays at the bottom and right side. The safe zones are slightly different per platform, but keeping content in the center 60% of the frame is safe for all three." } },
            ],
          }),
        }}
      />
      <div className="min-h-screen bg-[#FAFAF8]">
        {children}
        <div className="max-w-3xl mx-auto px-4 pb-14">
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <h2 className="text-foreground font-extrabold text-xl">Instagram Reels safe zone guide</h2>
            <p>The Instagram Reels safe zone is the center area where captions, logos, and key visuals are least likely to be covered by app controls. For 1080x1920 Reels, keep important text away from the top, bottom, and right-side action buttons.</p>
            <h3 className="text-foreground font-bold">Related tools</h3>
            <ul>
              <li><Link href="/tools/instagram-reels-size-calculator" className="text-primary">Instagram Reels Size Calculator</Link></li>
              <li><Link href="/tools/instagram-reels-caption-length-checker" className="text-primary">Instagram Reels Caption Length Checker</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
