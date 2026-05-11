import type { Metadata } from "next";
import Link from "next/link";

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"What is the best aspect ratio for short-form video?","acceptedAnswer":{"@type":"Answer","text":"9:16 (vertical) is the best aspect ratio for TikTok, Instagram Reels, YouTube Shorts, and Snapchat. It fills the entire phone screen without black bars. 1:1 (square) works on Instagram feed posts. 16:9 (landscape) is best for YouTube long-form and desktop viewing."}},{"@type":"Question","name":"How do I convert a 16:9 video to 9:16?","acceptedAnswer":{"@type":"Answer","text":"To convert 16:9 to 9:16: keep the height at 1080px and crop the width to 607px (pillarbox crop), or keep the width at 1080px and set the height to 1920px. You can also use smart cropping tools like ShortPurify that automatically follow the speaker's face during the crop."}},{"@type":"Question","name":"What aspect ratio does YouTube Shorts use?","acceptedAnswer":{"@type":"Answer","text":"YouTube Shorts uses a 9:16 aspect ratio at 1080x1920 pixels. Videos not in 9:16 will have black bars added. The recommended frame rate is 30fps or 60fps, and the maximum file size is 256MB for Shorts."}},{"@type":"Question","name":"What is a 4:5 aspect ratio used for?","acceptedAnswer":{"@type":"Answer","text":"4:5 is used for Instagram feed posts (portrait orientation). It's the tallest ratio Instagram allows in the main feed, giving your image more screen real estate than a square 1:1 post. For Reels and Stories, use 9:16 instead."}},{"@type":"Question","name":"Does aspect ratio affect video quality?","acceptedAnswer":{"@type":"Answer","text":"Aspect ratio itself doesn't affect video quality, but cropping a video to a different ratio can reduce quality if the resolution drops below recommended minimums. Always start with the highest resolution source and export at the target platform's recommended resolution."}}]}),
        }}
      />
      <div className="min-h-screen bg-[#FAFAF8]">
        {children}
        <div className="max-w-3xl mx-auto px-4 pb-14">
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <h2 className="text-foreground font-extrabold text-xl">Video aspect ratios explained</h2>
            <p>An aspect ratio describes the proportional relationship between a video&apos;s width and height. The most common ratios in 2025 are 9:16 (vertical/portrait), 16:9 (landscape), and 1:1 (square). Getting the ratio wrong means black bars, auto-cropping, or rejection by the platform&apos;s uploader.</p>
            <h3 className="text-foreground font-bold">Why 9:16 dominates short-form video</h3>
            <p>TikTok, YouTube Shorts, Instagram Reels, and Snapchat all default to 9:16 because it fills a smartphone screen edge-to-edge. Uploading a 16:9 video to any of these platforms results in letterboxing (black bars on the sides) which dramatically reduces engagement.</p>
            <h3 className="text-foreground font-bold">How to convert 16:9 to 9:16</h3>
            <p>To crop a 1920×1080 video to 9:16, keep the height at 1080 and set the width to 607 — or keep the width at 1080 and set the height to 1920. ShortPurify does this automatically with smart cropping that follows the speaker&apos;s face.</p>
            <h3 className="text-foreground font-bold">Other free tools you might like</h3>
            <ul>
              <li><Link href="/tools/youtube-shorts-title-generator" className="text-primary">YouTube Shorts Title Generator</Link> — 10 click-worthy titles instantly</li>
              <li><Link href="/tools/tiktok-caption-generator" className="text-primary">TikTok Caption Generator</Link> — viral captions + hashtags</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
