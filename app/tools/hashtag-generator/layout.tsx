import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Hashtag Generator | Free AI Tool for Instagram, TikTok & YouTube",
  description: "Generate the best hashtags for Instagram, TikTok, and YouTube Shorts instantly with AI. Free, no sign-up required. Get niche, medium, and broad hashtags tailored to your content.",
  keywords: [
    "hashtag generator",
    "Instagram hashtag generator",
    "TikTok hashtag generator",
    "YouTube hashtags",
    "free hashtag generator",
    "AI hashtag generator",
    "best hashtags for Instagram",
    "viral hashtags",
    "hashtag tool",
  ],
  alternates: { canonical: "https://shortpurify.com/tools/hashtag-generator" },
  openGraph: {
    title: "Hashtag Generator | Free AI Tool for Instagram, TikTok & YouTube",
    description: "Generate the best hashtags for Instagram, TikTok, and YouTube Shorts instantly with AI. Free, no sign-up required.",
    url: "https://shortpurify.com/tools/hashtag-generator",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hashtag Generator | Free AI Tool for Instagram, TikTok & YouTube",
    description: "Generate the best hashtags for Instagram, TikTok, and YouTube Shorts instantly with AI. Free, no sign-up required.",
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
            "name": "Hashtag Generator",
            "url": "https://shortpurify.com/tools/hashtag-generator",
            "description": "Generate the best hashtags for Instagram, TikTok, and YouTube Shorts instantly with AI. Free, no sign-up required.",
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
              { "@type": "Question", "name": "How many hashtags should I use on Instagram?", "acceptedAnswer": { "@type": "Answer", "text": "Use 5–15 targeted hashtags on Instagram, not the maximum 30. Mix niche tags (under 100K posts), medium tags (100K–1M), and 2–3 broad ones. Quality over quantity consistently outperforms hashtag stuffing." } },
              { "@type": "Question", "name": "Do hashtags work on TikTok in 2025?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, but TikTok's algorithm relies more on video content than hashtags. Use 3–5 relevant hashtags per post. Niche-specific hashtags outperform broad ones like #FYP or #ForYou, which are too saturated to drive meaningful discovery." } },
              { "@type": "Question", "name": "How many hashtags should I use on YouTube Shorts?", "acceptedAnswer": { "@type": "Answer", "text": "Use 3–5 hashtags in your YouTube Shorts description. YouTube shows the first 3 hashtags above the video title. Using more than 15 hashtags may cause YouTube to ignore all of them." } },
              { "@type": "Question", "name": "What is the difference between niche and broad hashtags?", "acceptedAnswer": { "@type": "Answer", "text": "Niche hashtags have under 100K posts and show your content to a highly targeted audience. Broad hashtags have millions of posts and are more competitive. A mix of both gives you targeted reach plus a chance at viral discovery." } },
              { "@type": "Question", "name": "Are banned hashtags real and do they hurt your reach?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Instagram periodically bans or restricts hashtags associated with spam or policy violations. Using a banned hashtag can suppress your post in hashtag feeds. Always test new hashtags by searching them in Instagram before using them in a post." } },
            ],
          }),
        }}
      />
      <div className="min-h-screen bg-[#FAFAF8]">
        {children}
        <div className="max-w-3xl mx-auto px-4 pb-14">
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <h2 className="text-foreground font-extrabold text-xl">How to use hashtags effectively in 2025</h2>
            <p>Hashtags work differently on each platform. On Instagram, a mix of niche and mid-size hashtags outperforms spamming 30 broad ones. On TikTok, hashtags influence the For You Page algorithm. On YouTube Shorts, they help with topic categorization rather than direct discovery.</p>
            <h3 className="text-foreground font-bold">Instagram hashtag strategy</h3>
            <ul>
              <li>Use 5–15 targeted hashtags, not the maximum 30 quality over quantity</li>
              <li>Mix: 3–4 niche tags (under 100K posts), 5–7 medium (100K–1M), 2–3 broad (1M+)</li>
              <li>Avoid banned or overused hashtags they can suppress your reach</li>
            </ul>
            <h3 className="text-foreground font-bold">TikTok hashtag strategy</h3>
            <ul>
              <li>3–5 hashtags is enough TikTok&apos;s algorithm relies more on content than tags</li>
              <li>Always include at least one trending hashtag relevant to your niche</li>
              <li>#FYP and #ForYou are too saturated use niche-specific tags instead</li>
            </ul>
            <h3 className="text-foreground font-bold">YouTube Shorts hashtag strategy</h3>
            <ul>
              <li>Add 3–5 hashtags in the description YouTube shows the first 3 above the title</li>
              <li>Use your main keyword as the first hashtag</li>
              <li>Too many hashtags can result in YouTube ignoring all of them</li>
            </ul>
            <h3 className="text-foreground font-bold">Other free tools you might like</h3>
            <ul>
              <li><Link href="/tools/tiktok-caption-generator" className="text-primary">TikTok Caption Generator</Link> — viral captions + hashtags</li>
              <li><Link href="/tools/youtube-shorts-title-generator" className="text-primary">YouTube Shorts Title Generator</Link> — 10 click-worthy titles instantly</li>
              <li><Link href="/tools/video-aspect-ratio-calculator" className="text-primary">Video Aspect Ratio Calculator</Link> — perfect size for every platform</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
