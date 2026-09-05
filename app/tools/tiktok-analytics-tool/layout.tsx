import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "TikTok Analytics Tool | Free Engagement Rate Calculator",
  description: "Calculate your TikTok engagement rate from views, likes, comments, and shares, and see how it compares to industry benchmarks. Free, no sign-up.",
  keywords: [
    "tiktok analytics tool",
    "tiktok engagement rate calculator",
    "tiktok engagement rate",
    "how to calculate tiktok engagement rate",
    "tiktok analytics calculator",
    "tiktok performance calculator",
    "free tiktok analytics tool",
    "tiktok stats calculator",
  ],
  alternates: { canonical: "https://shortpurify.com/tools/tiktok-analytics-tool" },
  openGraph: {
    title: "TikTok Analytics Tool | Free Engagement Rate Calculator",
    description: "Calculate your TikTok engagement rate and see how it compares to industry benchmarks.",
    url: "https://shortpurify.com/tools/tiktok-analytics-tool",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TikTok Analytics Tool | Free Engagement Rate Calculator",
    description: "Calculate your TikTok engagement rate and see how it compares to industry benchmarks.",
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
            "name": "TikTok Analytics Tool",
            "url": "https://shortpurify.com/tools/tiktok-analytics-tool",
            "description": "Calculate your TikTok engagement rate from views, likes, comments, and shares, and compare it to industry benchmarks.",
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
          __html: JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"How do I calculate my TikTok engagement rate?","acceptedAnswer":{"@type":"Answer","text":"Add up likes, comments, and shares for a video, then divide by either the video's views or your total follower count, and multiply by 100. Dividing by views measures how engaging the content was to the people who actually saw it; dividing by followers measures how much of your audience engaged."}},{"@type":"Question","name":"What is a good TikTok engagement rate?","acceptedAnswer":{"@type":"Answer","text":"As a rough rule of thumb, an engagement rate by views of 6-10% is considered good and over 10% excellent, while under 3% is below average. By followers, 4-8% is good and over 8% excellent. These are general industry benchmarks, not official TikTok figures, and vary by niche and account size."}},{"@type":"Question","name":"Should I calculate engagement rate by views or by followers?","acceptedAnswer":{"@type":"Answer","text":"By views is usually more useful on TikTok since the algorithm shows content to non-followers heavily, so a video's reach isn't tied to your follower count the way it is on other platforms. By followers is still useful for understanding how engaged your existing audience is."}},{"@type":"Question","name":"Where do I find my TikTok video stats?","acceptedAnswer":{"@type":"Answer","text":"On a TikTok Pro or Business account, tap the three-dot menu on any published video and select \"Analytics\" (or view it directly under Creator Tools > Analytics in your profile settings) to see views, likes, comments, and shares for that video."}}]}),
        }}
      />
      <div className="min-h-screen bg-[#FAFAF8]">
        {children}
        <div className="max-w-3xl mx-auto px-4 pb-14">
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <h2 className="text-foreground font-extrabold text-xl">What TikTok engagement rate actually tells you</h2>
            <p>Engagement rate is a quick way to judge whether a video resonated with the people who saw it, independent of raw view count. A video with fewer views but a high engagement rate often signals stronger content-market fit than a high-view, low-engagement video that got algorithm reach but didn&apos;t hold attention.</p>
            <h3 className="text-foreground font-bold">Where to find your raw stats</h3>
            <p>Switch to a TikTok Pro or Business account (free), then open any video and tap Analytics, or go to Creator Tools → Analytics in your profile settings for account-wide numbers.</p>
            <h3 className="text-foreground font-bold">Other free tools you might like</h3>
            <ul>
              <li><Link href="/tools/best-time-to-post-on-tiktok" className="text-primary">Best Time to Post on TikTok</Link> — find your audience&apos;s peak hours</li>
              <li><Link href="/tools/tiktok-caption-generator" className="text-primary">TikTok Caption Generator</Link> — captions built to drive comments and shares</li>
              <li><Link href="/tools/tiktok-coins-calculator" className="text-primary">TikTok Coins to USD Calculator</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
