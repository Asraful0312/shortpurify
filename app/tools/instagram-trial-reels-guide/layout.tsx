import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "What Are Trial Reels on Instagram? | Free Creator Guide",
  description: "Learn what Instagram Trial Reels are, when to use them, and how to decide if a Reel should be posted as a trial first.",
  keywords: [
    "instagram trial reels",
    "trial reels instagram",
    "what are trial reels on instagram",
    "instagram trial reels guide",
    "should i use trial reels",
  ],
  alternates: { canonical: "https://shortpurify.com/tools/instagram-trial-reels-guide" },
  openGraph: {
    title: "What Are Trial Reels on Instagram? | Free Creator Guide",
    description: "Learn what Instagram Trial Reels are and when to use them.",
    url: "https://shortpurify.com/tools/instagram-trial-reels-guide",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "What Are Trial Reels on Instagram? | Free Creator Guide",
    description: "Learn what Instagram Trial Reels are and when to use them.",
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
            "name": "Instagram Trial Reels Guide",
            "url": "https://shortpurify.com/tools/instagram-trial-reels-guide",
            "description": "Learn what Instagram Trial Reels are and when to use them.",
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
          __html: JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"What are Trial Reels on Instagram?","acceptedAnswer":{"@type":"Answer","text":"Trial Reels are an Instagram feature that lets creators share a Reel with non-followers first, before it goes to their existing audience. It's useful for testing new content styles or niches without risking your follower engagement metrics."}},{"@type":"Question","name":"How do I enable Trial Reels on Instagram?","acceptedAnswer":{"@type":"Answer","text":"When creating a Reel, look for the 'Trial' toggle before posting. Enabling it will show the Reel to non-followers in the Reels tab. After 24 hours, Instagram shows you performance data so you can decide whether to share it with your followers too."}},{"@type":"Question","name":"Do Trial Reels affect my Instagram account reach?","acceptedAnswer":{"@type":"Answer","text":"Trial Reels are shown to non-followers only, so they don't affect your existing follower engagement rate. If the trial performs well, sharing it to your followers can then boost your overall account reach."}},{"@type":"Question","name":"When should I use Trial Reels instead of regular Reels?","acceptedAnswer":{"@type":"Answer","text":"Use Trial Reels when: testing a new content format or niche, experimenting with different hooks or styles, posting content that might not appeal to your current audience, or trying a new video length. For proven content that fits your brand, regular Reels work better since followers can drive early engagement."}}]}),
        }}
      />
      <div className="min-h-screen bg-[#FAFAF8]">
        {children}
        <div className="max-w-3xl mx-auto px-4 pb-14">
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <h2 className="text-foreground font-extrabold text-xl">What are Trial Reels on Instagram?</h2>
            <p>Trial Reels are an Instagram testing option for creators who want to show a Reel to non-followers first. They are useful when you want to experiment without immediately pushing the content to your existing audience.</p>
            <h3 className="text-foreground font-bold">Are Trial Reels good for growth?</h3>
            <p>They can help when you are testing a new niche or format. For proven content, a normal Reel may be better because your followers can help with early engagement.</p>
            <h3 className="text-foreground font-bold">Related tools</h3>
            <ul>
              <li><Link href="/tools/best-time-to-post-instagram-reels" className="text-primary">Best Time to Post Instagram Reels</Link></li>
              <li><Link href="/tools/instagram-reels-length-calculator" className="text-primary">Instagram Reels Length Calculator</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
