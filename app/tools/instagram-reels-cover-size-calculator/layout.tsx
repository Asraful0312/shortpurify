import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Instagram Reels Cover Size Calculator | Free Cover Guide",
  description: "Calculate Instagram Reels cover size, profile grid crop, and feed preview dimensions for better Reels thumbnails.",
  keywords: [
    "instagram reels cover size",
    "reels cover size calculator",
    "instagram reels thumbnail size",
    "instagram reels cover dimensions",
    "reels profile grid crop",
  ],
  alternates: { canonical: "https://shortpurify.com/tools/instagram-reels-cover-size-calculator" },
  openGraph: {
    title: "Instagram Reels Cover Size Calculator | Free Cover Guide",
    description: "Calculate Instagram Reels cover size, profile grid crop, and feed preview dimensions.",
    url: "https://shortpurify.com/tools/instagram-reels-cover-size-calculator",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Instagram Reels Cover Size Calculator | Free Cover Guide",
    description: "Calculate Instagram Reels cover size, profile grid crop, and feed preview dimensions.",
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
            "name": "Instagram Reels Cover Size Calculator",
            "url": "https://shortpurify.com/tools/instagram-reels-cover-size-calculator",
            "description": "Calculate Instagram Reels cover size, profile grid crop, and feed preview dimensions.",
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
              { "@type": "Question", "name": "What is the Instagram Reels cover size?", "acceptedAnswer": { "@type": "Answer", "text": "The ideal Instagram Reels cover size is 1080 x 1920 pixels with a 9:16 aspect ratio. Instagram may crop the cover differently in the feed (4:5 ratio) and profile grid (1:1 ratio), so keep key visuals and text in the center 1080 x 1080 area." } },
              { "@type": "Question", "name": "How do I add a custom cover to my Instagram Reel?", "acceptedAnswer": { "@type": "Answer", "text": "When uploading a Reel, tap 'Edit cover' to select a frame from the video or upload a custom image from your camera roll. Custom covers let you control the thumbnail shown in your profile grid and feed." } },
              { "@type": "Question", "name": "What aspect ratio should an Instagram Reels cover be?", "acceptedAnswer": { "@type": "Answer", "text": "The cover should be 9:16 (vertical) for the Reels tab, but Instagram crops it to 1:1 (square) in your profile grid. Design your cover so the main subject is centered and visible in both formats." } },
              { "@type": "Question", "name": "Can I use a photo as a Reels cover on Instagram?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. When editing your Reel before posting, tap 'Edit cover' and select 'Add from camera roll' to upload any photo. The image should be at least 1080 x 1920 px for the best quality." } },
            ],
          }),
        }}
      />
      <div className="min-h-screen bg-[#FAFAF8]">
        {children}
        <div className="max-w-3xl mx-auto px-4 pb-14">
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <h2 className="text-foreground font-extrabold text-xl">Instagram Reels cover size</h2>
            <p>A full Instagram Reels cover uses the same vertical 9:16 canvas as the Reel. The tricky part is that Instagram may crop the cover in the feed and profile grid, so the title should stay near the center.</p>
            <h3 className="text-foreground font-bold">Related tools</h3>
            <ul>
              <li><Link href="/tools/instagram-reels-size-calculator" className="text-primary">Instagram Reels Size Calculator</Link></li>
              <li><Link href="/tools/instagram-reels-safe-zone-checker" className="text-primary">Instagram Reels Safe Zone Checker</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
