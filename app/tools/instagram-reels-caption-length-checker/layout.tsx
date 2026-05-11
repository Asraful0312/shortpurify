import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Instagram Reels Caption Length Checker | Free Counter",
  description: "Check Instagram Reels caption length, character count, hashtag count, and readability before posting.",
  keywords: [
    "instagram reels caption length",
    "instagram caption length checker",
    "reels caption character counter",
    "instagram caption counter",
    "instagram reels caption checker",
  ],
  alternates: { canonical: "https://shortpurify.com/tools/instagram-reels-caption-length-checker" },
  openGraph: {
    title: "Instagram Reels Caption Length Checker | Free Counter",
    description: "Check Instagram Reels caption length, character count, hashtag count, and readability.",
    url: "https://shortpurify.com/tools/instagram-reels-caption-length-checker",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Instagram Reels Caption Length Checker | Free Counter",
    description: "Check Instagram Reels caption length, character count, hashtag count, and readability.",
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
            "name": "Instagram Reels Caption Length Checker",
            "url": "https://shortpurify.com/tools/instagram-reels-caption-length-checker",
            "description": "Check Instagram Reels caption length, character count, hashtag count, and readability.",
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
              { "@type": "Question", "name": "What is the Instagram Reels caption character limit?", "acceptedAnswer": { "@type": "Answer", "text": "Instagram Reels captions can be up to 2,200 characters long. However, only the first 125 characters show before the 'more' cutoff in the feed, so your hook should always be in the first line." } },
              { "@type": "Question", "name": "Do longer captions help Instagram Reels reach?", "acceptedAnswer": { "@type": "Answer", "text": "Longer captions can increase time spent on your post, which is a positive signal. However, the first line matters most — it determines whether someone reads further. Use longer captions for tutorials or storytelling, short captions for memes and trends." } },
              { "@type": "Question", "name": "How many hashtags can I add to an Instagram Reels caption?", "acceptedAnswer": { "@type": "Answer", "text": "You can add up to 30 hashtags within the 2,200 character limit. However, 5–15 targeted hashtags consistently outperform 30 generic ones. Hashtags count toward your character total." } },
              { "@type": "Question", "name": "Should I put hashtags in the caption or first comment on Instagram?", "acceptedAnswer": { "@type": "Answer", "text": "Either works for reach. Putting hashtags in the caption is simpler and ensures they're indexed immediately. Putting them in the first comment keeps the caption cleaner. There is no proven algorithm advantage to either method." } },
            ],
          }),
        }}
      />
      <div className="min-h-screen bg-[#FAFAF8]">
        {children}
        <div className="max-w-3xl mx-auto px-4 pb-14">
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <h2 className="text-foreground font-extrabold text-xl">Instagram Reels caption length</h2>
            <p>Instagram captions can be long, but Reels usually perform better when the first line is short and useful. Use this counter to keep your caption readable while staying within platform limits.</p>
            <h3 className="text-foreground font-bold">Related tools</h3>
            <ul>
              <li><Link href="/tools/hashtag-generator" className="text-primary">Hashtag Generator</Link></li>
              <li><Link href="/tools/instagram-reels-safe-zone-checker" className="text-primary">Instagram Reels Safe Zone Checker</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
