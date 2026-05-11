import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "TikTok Hashtag Counter | Free Hashtag Checker",
  description: "Count TikTok hashtags, check hashtag mix, and avoid overloaded captions before posting short-form videos.",
  keywords: [
    "tiktok hashtag counter",
    "tiktok hashtag checker",
    "how many hashtags on tiktok",
    "tiktok hashtags count",
    "tiktok hashtag tool",
  ],
  alternates: { canonical: "https://shortpurify.com/tools/tiktok-hashtag-counter" },
  openGraph: {
    title: "TikTok Hashtag Counter | Free Hashtag Checker",
    description: "Count TikTok hashtags, check hashtag mix, and avoid overloaded captions.",
    url: "https://shortpurify.com/tools/tiktok-hashtag-counter",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TikTok Hashtag Counter | Free Hashtag Checker",
    description: "Count TikTok hashtags, check hashtag mix, and avoid overloaded captions.",
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
            "name": "TikTok Hashtag Counter",
            "url": "https://shortpurify.com/tools/tiktok-hashtag-counter",
            "description": "Count TikTok hashtags, check hashtag mix, and avoid overloaded captions.",
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
          __html: JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"How many hashtags can you use on TikTok?","acceptedAnswer":{"@type":"Answer","text":"TikTok allows up to 100 hashtags in a caption, but using that many is counterproductive. 3–5 targeted hashtags are most effective. TikTok's algorithm prioritizes video content over hashtags, so quality matters more than quantity."}},{"@type":"Question","name":"Do more hashtags help on TikTok?","acceptedAnswer":{"@type":"Answer","text":"No. Using 20+ hashtags does not increase reach on TikTok and can make your caption look spammy. A focused set of 3–8 relevant hashtags gives the algorithm clear topic signals without diluting relevance."}},{"@type":"Question","name":"What is the best hashtag strategy for TikTok?","acceptedAnswer":{"@type":"Answer","text":"Mix 1–2 niche hashtags (under 500K posts), 2–3 medium hashtags (500K–5M posts), and 1 broad hashtag (5M+ posts). Avoid overused tags like #fyp or #foryou. Use hashtags that your target audience actually follows and searches."}},{"@type":"Question","name":"Do TikTok hashtags count toward the character limit?","acceptedAnswer":{"@type":"Answer","text":"Yes. Hashtags count toward TikTok's 2,200 character caption limit. Each character in the hashtag, including the # symbol, is counted. Plan your caption to leave space for 3–5 hashtags without cutting your main text."}}]}),
        }}
      />
      <div className="min-h-screen bg-[#FAFAF8]">
        {children}
        <div className="max-w-3xl mx-auto px-4 pb-14">
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <h2 className="text-foreground font-extrabold text-xl">How many hashtags should you use on TikTok?</h2>
            <p>Most TikTok captions do not need a large hashtag block. A focused set of 3-5 relevant hashtags is usually easier for viewers and algorithms to understand.</p>
            <h3 className="text-foreground font-bold">Related tools</h3>
            <ul>
              <li><Link href="/tools/tiktok-caption-character-counter" className="text-primary">TikTok Caption Character Counter</Link></li>
              <li><Link href="/tools/hashtag-generator" className="text-primary">Hashtag Generator</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
