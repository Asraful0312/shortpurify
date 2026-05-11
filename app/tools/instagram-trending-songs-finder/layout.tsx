import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Trending Songs on Instagram Reels Today | Free Finder",
  description: "Find trending songs on Instagram Reels today with a simple research checklist, audio scoring system, and Reels sound workflow.",
  keywords: [
    "trending songs on instagram reels today",
    "instagram reels trending songs",
    "trending audio instagram reels",
    "instagram reels songs today",
    "reels audio finder",
  ],
  alternates: { canonical: "https://shortpurify.com/tools/instagram-trending-songs-finder" },
  openGraph: {
    title: "Trending Songs on Instagram Reels Today | Free Finder",
    description: "Find trending songs on Instagram Reels today with a simple research checklist.",
    url: "https://shortpurify.com/tools/instagram-trending-songs-finder",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Trending Songs on Instagram Reels Today | Free Finder",
    description: "Find trending songs on Instagram Reels today with a simple research checklist.",
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
            "name": "Instagram Trending Songs Finder",
            "url": "https://shortpurify.com/tools/instagram-trending-songs-finder",
            "description": "Find trending songs on Instagram Reels today with a simple research checklist.",
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
          __html: JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"How do I find trending songs on Instagram Reels?","acceptedAnswer":{"@type":"Answer","text":"To find trending songs on Instagram: 1) Browse the Reels tab and look for the upward arrow icon on audio. 2) Check the Reels creation screen — Instagram shows trending audio at the top. 3) Look at what songs top creators in your niche are using. 4) Use the audio page of any popular Reel to see how many videos use that sound."}},{"@type":"Question","name":"Does using trending audio help Instagram Reels get more views?","acceptedAnswer":{"@type":"Answer","text":"Yes. Instagram's algorithm recommends Reels using trending audio to users who have previously engaged with that sound. This gives you a distribution boost beyond your existing followers. However, the content still needs to hook viewers in the first second."}},{"@type":"Question","name":"How often do trending songs change on Instagram?","acceptedAnswer":{"@type":"Answer","text":"Trending songs on Instagram can change daily, especially for viral TikTok sounds that cross over. Some songs trend for 1–2 weeks, while others peak in 24–48 hours. Check trending audio every 2–3 days to stay current."}},{"@type":"Question","name":"Can I use copyrighted music in Instagram Reels?","acceptedAnswer":{"@type":"Answer","text":"Instagram has licensing agreements with major labels, so most popular music is available for personal creator accounts. Business accounts have more restrictions. If a song isn't available in your region, you may see it grayed out. Original audio and Instagram's music library are always safe to use."}}]}),
        }}
      />
      <div className="min-h-screen bg-[#FAFAF8]">
        {children}
        <div className="max-w-3xl mx-auto px-4 pb-14">
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <h2 className="text-foreground font-extrabold text-xl">How to find trending songs on Instagram Reels today</h2>
            <p>Instagram trending songs change daily and can vary by country, niche, and account type. The most reliable method is to check the audio page in Instagram, look for the trending arrow, and confirm that recent Reels in your niche are using the sound.</p>
            <h3 className="text-foreground font-bold">Should every Reel use trending audio?</h3>
            <p>No. Trending audio helps discovery when it supports the video. If the sound distracts from the hook or voiceover, use a low-volume track or original audio instead.</p>
            <h3 className="text-foreground font-bold">Related tools</h3>
            <ul>
              <li><Link href="/tools/hashtag-generator" className="text-primary">Hashtag Generator</Link></li>
              <li><Link href="/tools/best-time-to-post-instagram-reels" className="text-primary">Best Time to Post Instagram Reels</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
