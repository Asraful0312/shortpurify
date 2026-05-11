import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Instagram Reels Length Calculator | How Long Can Reels Be?",
  description: "Check Instagram Reels length limits and ideal duration. Free calculator for how long Instagram Reels can be in 2026.",
  keywords: [
    "how long can reels be on instagram",
    "how long can instagram reels be",
    "how long are instagram reels",
    "instagram reels length",
    "instagram reels duration",
    "reels length calculator",
  ],
  alternates: { canonical: "https://shortpurify.com/tools/instagram-reels-length-calculator" },
  openGraph: {
    title: "Instagram Reels Length Calculator | How Long Can Reels Be?",
    description: "Check Instagram Reels length limits and ideal duration.",
    url: "https://shortpurify.com/tools/instagram-reels-length-calculator",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Instagram Reels Length Calculator | How Long Can Reels Be?",
    description: "Check Instagram Reels length limits and ideal duration.",
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
            "name": "Instagram Reels Length Calculator",
            "url": "https://shortpurify.com/tools/instagram-reels-length-calculator",
            "description": "Check Instagram Reels length limits and ideal duration.",
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
              {
                "@type": "Question",
                "name": "How long can Instagram Reels be?",
                "acceptedAnswer": { "@type": "Answer", "text": "Instagram Reels can be up to 3 minutes (180 seconds) long. For the best reach and discovery, most creators keep Reels under 90 seconds because shorter videos are easier to finish, replay, and share." },
              },
              {
                "@type": "Question",
                "name": "What is the best length for Instagram Reels?",
                "acceptedAnswer": { "@type": "Answer", "text": "15–30 seconds is the safest starting point for most creators. Use 3–15 seconds for trend-based or meme clips, and 30–90 seconds for tutorials or storytelling that needs more context." },
              },
              {
                "@type": "Question",
                "name": "Do longer Reels get fewer views?",
                "acceptedAnswer": { "@type": "Answer", "text": "Not always, but completion rate matters. Instagram's algorithm favors Reels that viewers finish and replay. A 10-second Reel with 90% completion outperforms a 90-second Reel with 10% completion. Keep your content tight to maximize reach." },
              },
              {
                "@type": "Question",
                "name": "What is the minimum length for Instagram Reels?",
                "acceptedAnswer": { "@type": "Answer", "text": "Instagram Reels must be at least 3 seconds long. Anything shorter will not be accepted as a Reel by the platform." },
              },
              {
                "@type": "Question",
                "name": "Does Instagram Reels length affect monetization?",
                "acceptedAnswer": { "@type": "Answer", "text": "Yes. For the Instagram Reels bonus program and ads overlay eligibility, Reels typically need to be over 30 seconds. Reels under 30 seconds may not qualify for all monetization features." },
              },
            ],
          }),
        }}
      />
      <div className="min-h-screen bg-[#FAFAF8]">
        {children}
        <div className="max-w-3xl mx-auto px-4 pb-14">
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <h2 className="text-foreground font-extrabold text-xl">How long can Instagram Reels be?</h2>
            <p>Instagram Reels can be up to 3 minutes for standard creation. For reach, many creators still keep Reels under 90 seconds because shorter videos are easier to finish, replay, save, and share.</p>
            <h3 className="text-foreground font-bold">What is the best Instagram Reels length?</h3>
            <p>For most creators, 15-30 seconds is the safest starting point. Use 3-15 seconds for trend-based clips and 30-90 seconds for tutorials that need context.</p>
            <h3 className="text-foreground font-bold">Related tools</h3>
            <ul>
              <li><Link href="/tools/instagram-reels-size-calculator" className="text-primary">Instagram Reels Size Calculator</Link></li>
              <li><Link href="/tools/best-time-to-post-instagram-reels" className="text-primary">Best Time to Post Instagram Reels</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
