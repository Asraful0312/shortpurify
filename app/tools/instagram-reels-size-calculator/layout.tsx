import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Instagram Reels Size Calculator | Ratio, Dimensions & Safe Zone",
  description: "Calculate Instagram Reels size, aspect ratio, dimensions, and safe zones. Free 9:16 Reels size calculator for 1080x1920 videos.",
  keywords: [
    "instagram reels size",
    "instagram reels size ratio",
    "instagram reels dimensions",
    "instagram reels aspect ratio",
    "aspect ratio for instagram reels",
    "instagram reels size calculator",
  ],
  alternates: { canonical: "https://shortpurify.com/tools/instagram-reels-size-calculator" },
  openGraph: {
    title: "Instagram Reels Size Calculator | Ratio, Dimensions & Safe Zone",
    description: "Calculate Instagram Reels size, aspect ratio, dimensions, and safe zones.",
    url: "https://shortpurify.com/tools/instagram-reels-size-calculator",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Instagram Reels Size Calculator | Ratio, Dimensions & Safe Zone",
    description: "Calculate Instagram Reels size, aspect ratio, dimensions, and safe zones.",
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
            "name": "Instagram Reels Size Calculator",
            "url": "https://shortpurify.com/tools/instagram-reels-size-calculator",
            "description": "Calculate Instagram Reels size, aspect ratio, dimensions, and safe zones.",
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
          __html: JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"What is the best Instagram Reels size in pixels?","acceptedAnswer":{"@type":"Answer","text":"The best Instagram Reels size is 1080 x 1920 pixels with a 9:16 aspect ratio. This fills the vertical phone screen completely. Minimum resolution is 600 x 1067 pixels, but 1080x1920 is the recommended quality."}},{"@type":"Question","name":"What aspect ratio does Instagram Reels use?","acceptedAnswer":{"@type":"Answer","text":"Instagram Reels uses a 9:16 aspect ratio (vertical). In the profile grid, Reels are cropped to 1:1 (square). In the feed, they may appear at 4:5. Design for 9:16 and keep your main subject centered to look good in all placements."}},{"@type":"Question","name":"What happens if my Instagram Reel is not 9:16?","acceptedAnswer":{"@type":"Answer","text":"Instagram will add black bars (letterboxing or pillarboxing) to fill the 9:16 frame. This reduces visual impact and often lowers engagement. Always export your Reels at 1080x1920 pixels before uploading."}},{"@type":"Question","name":"What file size limit does Instagram Reels have?","acceptedAnswer":{"@type":"Answer","text":"Instagram Reels have a maximum file size of 4 GB. For best upload quality, export as MP4 with H.264 encoding, a frame rate of 30fps, and a bitrate of at least 3,500 Kbps."}}]}),
        }}
      />
      <div className="min-h-screen bg-[#FAFAF8]">
        {children}
        <div className="max-w-3xl mx-auto px-4 pb-14">
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <h2 className="text-foreground font-extrabold text-xl">Instagram Reels size and aspect ratio</h2>
            <p>The best Instagram Reels size is 1080 x 1920 pixels with a 9:16 aspect ratio. This fills the vertical phone screen and also works for TikTok and YouTube Shorts.</p>
            <h3 className="text-foreground font-bold">What happens if your Reel is not 9:16?</h3>
            <p>Instagram may add empty space, crop the frame, or show the Reel differently in the feed, profile grid, and Reels tab. Use the calculator above before exporting.</p>
            <h3 className="text-foreground font-bold">Related free tools</h3>
            <ul>
              <li><Link href="/tools/video-aspect-ratio-calculator" className="text-primary">Video Aspect Ratio Calculator</Link> for every platform</li>
              <li><Link href="/tools/instagram-reels-length-calculator" className="text-primary">Instagram Reels Length Calculator</Link> for duration checks</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
