import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "TikTok Caption Generator | Free AI Tool",
  description: "Generate viral TikTok captions with hashtags instantly using AI. Free, no sign-up required. Get engaging hooks, calls-to-action, and 20+ targeted hashtags.",
  keywords: [
    "TikTok caption generator",
    "TikTok caption ideas",
    "viral TikTok captions",
    "TikTok hashtag generator",
    "free TikTok caption tool",
    "AI caption generator",
    "TikTok content ideas",
  ],
  alternates: { canonical: "https://shortpurify.com/tools/tiktok-caption-generator" },
  openGraph: {
    title: "TikTok Caption Generator | Free AI Tool",
    description: "Generate viral TikTok captions with hashtags instantly using AI. Free, no sign-up required.",
    url: "https://shortpurify.com/tools/tiktok-caption-generator",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TikTok Caption Generator | Free AI Tool",
    description: "Generate viral TikTok captions with hashtags instantly using AI. Free, no sign-up required.",
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
            "name": "TikTok Caption Generator",
            "url": "https://shortpurify.com/tools/tiktok-caption-generator",
            "description": "Generate viral TikTok captions with hashtags instantly using AI. Free, no sign-up required.",
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
          __html: JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"How do I write a good TikTok caption?","acceptedAnswer":{"@type":"Answer","text":"A good TikTok caption starts with a hook in the first line (a question, bold claim, or relatable statement), follows with 1–2 supporting sentences, ends with a call to action (save, comment, follow), and includes 3–5 niche hashtags. Keep it under 150 characters if possible to avoid the 'more' cutoff."}},{"@type":"Question","name":"How many hashtags should I use in a TikTok caption?","acceptedAnswer":{"@type":"Answer","text":"3–8 targeted hashtags consistently outperform 20+ generic ones on TikTok. Mix niche hashtags (under 500K posts), medium hashtags (500K–5M), and one or two broad ones. Avoid #FYP and #ForYou — they're too saturated to drive meaningful discovery."}},{"@type":"Question","name":"What is the TikTok caption limit in 2025?","acceptedAnswer":{"@type":"Answer","text":"TikTok captions are limited to 2,200 characters including hashtags. However, only the first 100–150 characters are visible in the feed before the 'more' button, so make your opening line count."}},{"@type":"Question","name":"Do TikTok captions help with the For You Page?","acceptedAnswer":{"@type":"Answer","text":"Yes. TikTok's algorithm reads your caption to understand what your video is about and who to show it to. Including relevant keywords in your caption (not just hashtags) helps the algorithm match your content with users who search for or watch similar topics."}},{"@type":"Question","name":"What should I put in a TikTok CTA?","acceptedAnswer":{"@type":"Answer","text":"Effective TikTok CTAs are specific and low-friction: 'Save this for later', 'Comment your answer below', 'Follow for part 2', or 'Share with someone who needs this'. Ask for one action only — multiple CTAs reduce conversion."}}]}),
        }}
      />
      <div className="min-h-screen bg-[#FAFAF8]">
        {children}
        <div className="max-w-3xl mx-auto px-4 pb-14">
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <h2 className="text-foreground font-extrabold text-xl">How to write TikTok captions that go viral</h2>
            <p>TikTok captions are limited to 2,200 characters but shorter is almost always better. The first line is the most important — it appears before the &quot;more&quot; cutoff and determines whether someone keeps watching or scrolls away.</p>
            <h3 className="text-foreground font-bold">TikTok caption best practices</h3>
            <ul>
              <li>Lead with a hook — a question, bold claim, or relatable statement in the first line</li>
              <li>Keep the main caption to 1-3 sentences; save detail for the comments</li>
              <li>End with a call to action: &quot;Save this for later&quot;, &quot;Comment your answer&quot;, &quot;Follow for part 2&quot;</li>
              <li>Use 3-5 niche hashtags + 1-2 broad hashtags (avoid spamming 30 hashtags)</li>
              <li>Tag trending sounds or topics to ride discovery waves</li>
            </ul>
            <h3 className="text-foreground font-bold">How many hashtags should I use on TikTok?</h3>
            <p>Research suggests 3-8 targeted hashtags outperform 20+ generic ones. Mix niche hashtags (under 500K posts), medium hashtags (500K–5M), and one or two broad ones (5M+) to hit multiple discovery layers.</p>
            <h3 className="text-foreground font-bold">Other free tools you might like</h3>
            <ul>
              <li><Link href="/tools/youtube-shorts-title-generator" className="text-primary">YouTube Shorts Title Generator</Link> — 10 click-worthy titles instantly</li>
              <li><Link href="/tools/video-aspect-ratio-calculator" className="text-primary">Video Aspect Ratio Calculator</Link> — perfect size for every platform</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
