import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Instagram Story Size Calculator | Ratio, Dimensions & Safe Zone",
  description: "Calculate Instagram Story size, aspect ratio, dimensions, and safe zones. Free 9:16 Story size calculator for 1080x1920 images and videos.",
  keywords: [
    "instagram story size",
    "instagram story size ratio",
    "instagram story dimensions",
    "instagram story aspect ratio",
    "aspect ratio for instagram story",
    "instagram story size calculator",
    "best size for instagram story",
    "instagram story pixel size",
    "instagram story safe zone",
    "what is the best size for instagram story",
  ],
  alternates: { canonical: "https://shortpurify.com/tools/instagram-story-size-calculator" },
  openGraph: {
    title: "Instagram Story Size Calculator | Ratio, Dimensions & Safe Zone",
    description: "Calculate Instagram Story size, aspect ratio, dimensions, and safe zones.",
    url: "https://shortpurify.com/tools/instagram-story-size-calculator",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Instagram Story Size Calculator | Ratio, Dimensions & Safe Zone",
    description: "Calculate Instagram Story size, aspect ratio, dimensions, and safe zones.",
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
            "name": "Instagram Story Size Calculator",
            "url": "https://shortpurify.com/tools/instagram-story-size-calculator",
            "description": "Calculate Instagram Story size, aspect ratio, dimensions, and safe zones.",
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
          __html: JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"What is the best Instagram Story size in pixels?","acceptedAnswer":{"@type":"Answer","text":"The best Instagram Story size is 1080 x 1920 pixels with a 9:16 aspect ratio. This fills the full vertical phone screen. Minimum resolution is 600 x 1067 pixels, but 1080x1920 gives the sharpest quality."}},{"@type":"Question","name":"What is the Instagram Story safe zone?","acceptedAnswer":{"@type":"Answer","text":"The Instagram Story safe zone keeps important text, logos, and faces roughly 250px from the top (below the profile name and close button) and 250px from the bottom (above the reply field and sticker tray) on a 1080x1920 canvas."}},{"@type":"Question","name":"What happens if my Instagram Story is not 9:16?","acceptedAnswer":{"@type":"Answer","text":"Instagram will add black bars (letterboxing or pillarboxing) or crop your content to fill the 9:16 frame. Always export Stories at 1080x1920 pixels to avoid this."}},{"@type":"Question","name":"Can I post a square or landscape photo to Instagram Stories?","acceptedAnswer":{"@type":"Answer","text":"Yes, but Instagram will add blurred or solid bars above and below the image to fill the vertical frame. For best results, crop or design your image at 1080x1920 before posting."}}]}),
        }}
      />
      <div className="min-h-screen bg-[#FAFAF8]">
        {children}
        <div className="max-w-3xl mx-auto px-4 pb-14">
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <h2 className="text-foreground font-extrabold text-xl">Instagram Story size and aspect ratio</h2>
            <p>The best Instagram Story size is 1080 x 1920 pixels with a 9:16 aspect ratio. This fills the vertical phone screen completely and also works for Reels, TikTok, and YouTube Shorts.</p>
            <h3 className="text-foreground font-bold">Why the safe zone matters</h3>
            <p>Instagram overlays your profile name and a close button near the top, and a reply field plus sticker tray near the bottom. Keep key text and faces out of those zones so nothing gets covered.</p>
            <h3 className="text-foreground font-bold">Related free tools</h3>
            <ul>
              <li><Link href="/tools/instagram-story-idea-generator" className="text-primary">Instagram Story Idea Generator</Link> for content that fits the format</li>
              <li><Link href="/tools/instagram-reels-size-calculator" className="text-primary">Instagram Reels Size Calculator</Link> for Reels dimensions</li>
              <li><Link href="/tools/video-aspect-ratio-calculator" className="text-primary">Video Aspect Ratio Calculator</Link> for every platform</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
