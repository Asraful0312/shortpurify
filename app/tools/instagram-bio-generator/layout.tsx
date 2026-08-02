import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Instagram Bio Generator | Free AI Tool",
  description: "Generate 5 ready-to-use Instagram bio ideas instantly using AI. Free, no sign-up required. Aesthetic, funny, professional, minimal, and bold styles.",
  keywords: [
    "instagram bio generator",
    "how to write a bio for instagram",
    "bio for instagram",
    "instagram bio ideas",
    "instagram bio generator ai",
    "free instagram bio generator",
    "instagram bio maker",
    "aesthetic instagram bio",
    "funny instagram bio",
    "professional instagram bio",
    "instagram bio for business",
    "instagram bio character limit",
    "cute instagram bio ideas",
    "instagram bio generator free",
    "good instagram bio",
  ],
  alternates: { canonical: "https://shortpurify.com/tools/instagram-bio-generator" },
  openGraph: {
    title: "Instagram Bio Generator | Free AI Tool",
    description: "Generate 5 ready-to-use Instagram bio ideas instantly using AI. Free, no sign-up required.",
    url: "https://shortpurify.com/tools/instagram-bio-generator",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Instagram Bio Generator | Free AI Tool",
    description: "Generate 5 ready-to-use Instagram bio ideas instantly using AI. Free, no sign-up required.",
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
            "name": "Instagram Bio Generator",
            "url": "https://shortpurify.com/tools/instagram-bio-generator",
            "description": "Generate 5 ready-to-use Instagram bio ideas instantly using AI. Free, no sign-up required.",
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
          __html: JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"How do I write a good Instagram bio?","acceptedAnswer":{"@type":"Answer","text":"A good Instagram bio states who you are or what you do in the first line, adds a benefit or personality line, and ends with a clear call to action (follow, shop, DM, or tap the link). Keep it under 150 characters, use line breaks with emojis or the '|' symbol to separate ideas, and avoid vague filler like 'living my best life'."}},{"@type":"Question","name":"What is the Instagram bio character limit?","acceptedAnswer":{"@type":"Answer","text":"Instagram bios are limited to 150 characters, including spaces, emojis, and line breaks. The username field is separate and limited to 30 characters."}},{"@type":"Question","name":"Should I use emojis in my Instagram bio?","acceptedAnswer":{"@type":"Answer","text":"Yes, in moderation. 1-4 relevant emojis can replace bullet points or line breaks and make a bio easier to scan on mobile. Overusing emojis makes a bio look cluttered and can hurt readability."}},{"@type":"Question","name":"How do I write a business Instagram bio?","acceptedAnswer":{"@type":"Answer","text":"A business bio should name the category or niche, state the core benefit to the customer, include a proof point if space allows (location, years, results), and end with a single call to action pointing to the link in bio."}},{"@type":"Question","name":"Can I change my Instagram bio often?","acceptedAnswer":{"@type":"Answer","text":"Yes, there's no limit on how often you can edit your Instagram bio. Many creators update it seasonally, for launches, or to test which version drives more profile-to-follow conversions."}}]}),
        }}
      />
      <div className="min-h-screen bg-[#FAFAF8]">
        {children}
        <div className="max-w-3xl mx-auto px-4 pb-14">
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <h2 className="text-foreground font-extrabold text-xl">How to write a bio for Instagram</h2>
            <p>Your Instagram bio is 150 characters that decide whether a profile visitor taps follow or scrolls away. It needs to say who you are, what you offer, and why someone should care — fast.</p>
            <h3 className="text-foreground font-bold">Instagram bio best practices</h3>
            <ul>
              <li>Line 1: state who you are or what you do, plainly</li>
              <li>Line 2: add a benefit, personality touch, or credibility point</li>
              <li>Line 3: one clear call to action — &quot;Shop below&quot;, &quot;DM to collab&quot;, &quot;New drop 👇&quot;</li>
              <li>Use emojis or &quot;|&quot; to separate ideas instead of full sentences</li>
              <li>Cut filler phrases like &quot;living my best life&quot; — say something specific instead</li>
            </ul>
            <h3 className="text-foreground font-bold">How many characters can an Instagram bio have?</h3>
            <p>Instagram bios are capped at 150 characters including spaces, emojis, and line breaks. Your name field allows 30 more characters and is searchable, so put a keyword there if it fits naturally.</p>
            <h3 className="text-foreground font-bold">Other free tools you might like</h3>
            <ul>
              <li><Link href="/tools/hashtag-generator" className="text-primary">Hashtag Generator</Link> — platform-specific hashtag sets in seconds</li>
              <li><Link href="/tools/instagram-reels-caption-length-checker" className="text-primary">Instagram Reels Caption Length Checker</Link> — check captions before posting</li>
              <li><Link href="/tools/best-time-to-post-instagram-reels" className="text-primary">Best Time to Post Instagram Reels</Link> — find peak engagement hours</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
