import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Best Time to Post Instagram Reels Today | Free Calculator",
  description: "Find the best time to post Instagram Reels today by day and timezone. Free 2026 Reels posting time calculator for creators.",
  keywords: [
    "best time to post reels on instagram",
    "best time to post instagram reels",
    "best time to post on instagram reels",
    "best time to post reels on instagram today",
    "instagram reels posting time",
    "when to post reels on instagram",
  ],
  alternates: { canonical: "https://shortpurify.com/tools/best-time-to-post-instagram-reels" },
  openGraph: {
    title: "Best Time to Post Instagram Reels Today | Free Calculator",
    description: "Find the best time to post Instagram Reels today by day and timezone.",
    url: "https://shortpurify.com/tools/best-time-to-post-instagram-reels",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Time to Post Instagram Reels Today | Free Calculator",
    description: "Find the best time to post Instagram Reels today by day and timezone.",
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
            "name": "Best Time to Post Instagram Reels Calculator",
            "url": "https://shortpurify.com/tools/best-time-to-post-instagram-reels",
            "description": "Find the best time to post Instagram Reels today by day and timezone.",
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
              { "@type": "Question", "name": "What is the best time to post Instagram Reels?", "acceptedAnswer": { "@type": "Answer", "text": "The best times to post Instagram Reels are Tuesday at 10 AM, Wednesday at 11 AM, and Friday at 10 AM in your audience's local time. Lunch breaks (12–2 PM) and evenings (7–9 PM) consistently show high engagement across most niches." } },
              { "@type": "Question", "name": "Does posting time affect Instagram Reels reach?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Instagram's algorithm gives your Reel an initial push to a small audience. If that first group engages quickly (watches to the end, likes, comments, saves), the Reel reaches more people. Posting when your audience is active maximizes that first-hour engagement window." } },
              { "@type": "Question", "name": "Is there a best time to post Reels today specifically?", "acceptedAnswer": { "@type": "Answer", "text": "The best time varies by day. Weekday evenings (7–9 PM) and weekend mornings (9–11 AM) generally perform well. Use the calculator above for a timezone-adjusted estimate, then confirm with your own Instagram Insights under Audience → Most Active Times." } },
              { "@type": "Question", "name": "Does timezone matter when posting Instagram Reels?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, if most of your audience is in a specific timezone, post when that timezone is active. If you have a global audience, target the overlap of active hours across your top two regions. Instagram Insights shows your follower breakdown by country." } },
              { "@type": "Question", "name": "How often should I post Instagram Reels?", "acceptedAnswer": { "@type": "Answer", "text": "Most creators see growth posting 3–5 Reels per week. Consistency matters more than volume — posting 4 Reels every week beats posting 20 one week and nothing the next. Quality and posting time together drive discovery." } },
            ],
          }),
        }}
      />
      <div className="min-h-screen bg-[#FAFAF8]">
        {children}
        <div className="max-w-3xl mx-auto px-4 pb-14">
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <h2 className="text-foreground font-extrabold text-xl">Best time to post Reels on Instagram</h2>
            <p>The best time to post Instagram Reels is usually when your audience is already opening the app: lunch breaks, early evening, and late evening. These windows help your Reel earn early views, saves, comments, and shares.</p>
            <h3 className="text-foreground font-bold">Is there a best time to post Reels today?</h3>
            <p>Yes, but it depends on your audience location. Use the calculator above for a timezone-adjusted starting point, then confirm it with your own Instagram Insights.</p>
            <h3 className="text-foreground font-bold">Related free Instagram tools</h3>
            <ul>
              <li><Link href="/tools/instagram-reels-size-calculator" className="text-primary">Instagram Reels Size Calculator</Link> for 9:16 dimensions</li>
              <li><Link href="/tools/instagram-reels-length-calculator" className="text-primary">Instagram Reels Length Calculator</Link> for duration checks</li>
              <li><Link href="/tools/instagram-trending-songs-finder" className="text-primary">Instagram Trending Songs Finder</Link> for Reels audio research</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
