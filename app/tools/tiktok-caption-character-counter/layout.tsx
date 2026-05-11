import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "TikTok Caption Character Counter | Free Caption Checker",
  description: "Count TikTok caption characters, hashtags, mentions, and readability before posting. Free TikTok caption checker for creators.",
  keywords: [
    "tiktok caption character counter",
    "tiktok caption length checker",
    "tiktok character counter",
    "tiktok caption counter",
    "tiktok caption checker",
  ],
  alternates: { canonical: "https://shortpurify.com/tools/tiktok-caption-character-counter" },
  openGraph: {
    title: "TikTok Caption Character Counter | Free Caption Checker",
    description: "Count TikTok caption characters, hashtags, mentions, and readability before posting.",
    url: "https://shortpurify.com/tools/tiktok-caption-character-counter",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TikTok Caption Character Counter | Free Caption Checker",
    description: "Count TikTok caption characters, hashtags, mentions, and readability before posting.",
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
            "name": "TikTok Caption Character Counter",
            "url": "https://shortpurify.com/tools/tiktok-caption-character-counter",
            "description": "Count TikTok caption characters, hashtags, mentions, and readability before posting.",
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
          __html: JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"What is the TikTok caption character limit?","acceptedAnswer":{"@type":"Answer","text":"TikTok captions have a limit of 2,200 characters, including hashtags. Only the first 100–150 characters show in the feed before the 'more' button. Front-load your most important information and hook in the first line."}},{"@type":"Question","name":"Do TikTok captions affect the algorithm?","acceptedAnswer":{"@type":"Answer","text":"Yes. TikTok reads captions to understand your video's topic and match it to the right audience. Including relevant keywords (not just hashtags) in your caption helps the algorithm categorize your content and recommend it to interested users."}},{"@type":"Question","name":"Should TikTok captions be long or short?","acceptedAnswer":{"@type":"Answer","text":"Short captions (under 150 characters) work best for fast-paced, visual content like memes and trends. Longer captions work well for educational content where you want to add context or a call to action. Either way, the first line must be a strong hook."}},{"@type":"Question","name":"Do hashtags count toward the TikTok caption limit?","acceptedAnswer":{"@type":"Answer","text":"Yes, hashtags are part of the caption and count toward the 2,200 character limit. Each character in a hashtag, including the # symbol, counts. Plan your caption length to leave room for 3–5 targeted hashtags."}}]}),
        }}
      />
      <div className="min-h-screen bg-[#FAFAF8]">
        {children}
        <div className="max-w-3xl mx-auto px-4 pb-14">
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <h2 className="text-foreground font-extrabold text-xl">TikTok caption length checker</h2>
            <p>TikTok captions can carry hashtags, context, and a call to action. This counter helps keep captions readable while giving the algorithm clear topic signals.</p>
            <h3 className="text-foreground font-bold">Related tools</h3>
            <ul>
              <li><Link href="/tools/tiktok-hashtag-counter" className="text-primary">TikTok Hashtag Counter</Link></li>
              <li><Link href="/tools/tiktok-caption-generator" className="text-primary">TikTok Caption Generator</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
