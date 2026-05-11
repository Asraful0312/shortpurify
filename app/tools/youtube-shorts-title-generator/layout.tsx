import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "YouTube Shorts Title Generator | Free AI Tool",
  description: "Generate 10 click-worthy YouTube Shorts titles instantly with AI. Free, no sign-up required. Optimized for the YouTube Shorts algorithm in 2025.",
  keywords: [
    "YouTube Shorts title generator",
    "YouTube Shorts title ideas",
    "AI title generator YouTube",
    "viral YouTube Shorts titles",
    "free YouTube title generator",
    "YouTube Shorts SEO",
  ],
  alternates: { canonical: "https://shortpurify.com/tools/youtube-shorts-title-generator" },
  openGraph: {
    title: "YouTube Shorts Title Generator | Free AI Tool",
    description: "Generate 10 click-worthy YouTube Shorts titles instantly with AI. Free, no sign-up required.",
    url: "https://shortpurify.com/tools/youtube-shorts-title-generator",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "YouTube Shorts Title Generator | Free AI Tool",
    description: "Generate 10 click-worthy YouTube Shorts titles instantly with AI. Free, no sign-up required.",
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
            "name": "YouTube Shorts Title Generator",
            "url": "https://shortpurify.com/tools/youtube-shorts-title-generator",
            "description": "Generate 10 click-worthy YouTube Shorts titles instantly with AI. Free, no sign-up required.",
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
          __html: JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"How long should a YouTube Shorts title be?","acceptedAnswer":{"@type":"Answer","text":"YouTube Shorts titles should be under 60 characters so they don't get cut off on mobile. The ideal length is 40–60 characters. Front-load your main keyword in the first 3 words so it's visible even if the title is truncated."}},{"@type":"Question","name":"Do YouTube Shorts titles affect views?","acceptedAnswer":{"@type":"Answer","text":"Yes. Titles affect click-through rate (CTR) in search results, related videos, and the Shorts feed where the title briefly appears. A compelling title with a clear benefit or curiosity gap significantly increases how often viewers click or swipe to watch."}},{"@type":"Question","name":"What makes a good YouTube Shorts title?","acceptedAnswer":{"@type":"Answer","text":"The best YouTube Shorts titles use: numbers ('5 ways to...'), power words ('shocking', 'secret', 'never'), a clear benefit, or a question your audience is already asking. Keep it under 60 characters and put the main keyword early. Avoid clickbait that doesn't match the content."}},{"@type":"Question","name":"Should YouTube Shorts have keywords in the title?","acceptedAnswer":{"@type":"Answer","text":"Yes. Including your main keyword in the title helps YouTube understand the video topic and rank it in search. Put the keyword in the first 3–4 words of the title. This also helps viewers immediately understand what the Short is about."}},{"@type":"Question","name":"How many characters can a YouTube Shorts title be?","acceptedAnswer":{"@type":"Answer","text":"YouTube allows up to 100 characters for all video titles, including Shorts. However, most screens show only 60–70 characters before truncating. Keep Shorts titles under 60 characters for full visibility on mobile devices where most Shorts are watched."}}]}),
        }}
      />
      <div className="min-h-screen bg-[#FAFAF8]">
        {children}
        <div className="max-w-3xl mx-auto px-4 pb-14">
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <h2 className="text-foreground font-extrabold text-xl">How to write great YouTube Shorts titles</h2>
            <p>A great YouTube Shorts title does three things: stops the scroll, sets expectations, and triggers curiosity. The best performing titles in 2025 use numbers (&quot;5 ways…&quot;), strong action verbs, and a clear benefit.</p>
            <h3 className="text-foreground font-bold">Tips for higher click-through rates</h3>
            <ul>
              <li>Keep titles under 60 characters so they don&apos;t get cut off</li>
              <li>Front-load the most important keyword in the first 3 words</li>
              <li>Use brackets like [SHOCKING] or (Must Watch) sparingly but effectively</li>
              <li>Ask a question your target audience is already wondering</li>
              <li>Test 2-3 different titles by re-uploading or using A/B tools</li>
            </ul>
            <h3 className="text-foreground font-bold">Other free tools you might like</h3>
            <ul>
              <li><Link href="/tools/tiktok-caption-generator" className="text-primary">TikTok Caption Generator</Link> — viral captions + hashtags</li>
              <li><Link href="/tools/video-aspect-ratio-calculator" className="text-primary">Video Aspect Ratio Calculator</Link> — get the perfect size for every platform</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
