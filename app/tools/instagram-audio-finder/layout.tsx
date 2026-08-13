import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Instagram Audio Finder | Find Any Reel's Song for Free",
  description: "Find the name of any song or sound used in an Instagram Reel. Free step-by-step methods for when you have the Reel open or only remember hearing it.",
  keywords: [
    "instagram audio finder",
    "instagram reels audio finder",
    "instagram sound finder",
    "instagram audio song finder",
    "instagram reels song finder",
    "instagram reels audio name finder",
    "instagram reels music finder",
    "how to find song on instagram reel",
    "how to find audio name on instagram",
    "identify song in instagram reel",
    "instagram reel song identifier",
  ],
  alternates: { canonical: "https://shortpurify.com/tools/instagram-audio-finder" },
  openGraph: {
    title: "Instagram Audio Finder | Find Any Reel's Song for Free",
    description: "Find the name of any song or sound used in an Instagram Reel. Free step-by-step methods, no app download required.",
    url: "https://shortpurify.com/tools/instagram-audio-finder",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Instagram Audio Finder | Find Any Reel's Song for Free",
    description: "Find the name of any song or sound used in an Instagram Reel. Free step-by-step methods, no app download required.",
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
            "name": "Instagram Audio Finder",
            "url": "https://shortpurify.com/tools/instagram-audio-finder",
            "description": "Find the name of any song or sound used in an Instagram Reel. Free step-by-step methods, no app download required.",
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
          __html: JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"How do I find the song used in an Instagram Reel?","acceptedAnswer":{"@type":"Answer","text":"Open the Reel and tap the audio name or spinning record icon in the bottom-left corner. Instagram opens the audio page showing the song title, artist, and every other Reel that used it. If there's no tappable audio name, screen record the Reel and run it through Shazam or SoundHound instead."}},{"@type":"Question","name":"Why doesn't Instagram show the audio name on some Reels?","acceptedAnswer":{"@type":"Answer","text":"Instagram hides the tappable audio name when the creator used original audio, added a voiceover on top of a track, or the sound was muted or replaced due to licensing. In these cases, use Shazam or SoundHound while the clip plays, or ask in the comments."}},{"@type":"Question","name":"Can I find a song without having the original Reel open?","acceptedAnswer":{"@type":"Answer","text":"Yes. Search Instagram or Google with any lyrics you remember, check the creator's profile caption or pinned comments, or look for reposts of the same clip on other platforms where captions often credit the original audio."}},{"@type":"Question","name":"Does Shazam work on Instagram Reels?","acceptedAnswer":{"@type":"Answer","text":"Yes. Shazam and SoundHound can identify most commercial songs playing through your device's microphone or a screen recording, even when Instagram itself doesn't display the audio name. They generally can't identify original or custom audio that isn't a released song."}}]}),
        }}
      />
      <div className="min-h-screen bg-[#FAFAF8]">
        {children}
        <div className="max-w-3xl mx-auto px-4 pb-14">
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <h2 className="text-foreground font-extrabold text-xl">Why can&apos;t I always tap the audio name?</h2>
            <p>Instagram only shows a tappable audio link when the sound is licensed through Instagram&apos;s own music library. If a creator recorded original audio, added a voiceover, or the platform muted a track for licensing reasons, there&apos;s nothing to tap — that&apos;s when a screen-record-and-Shazam approach becomes the reliable fallback.</p>
            <h3 className="text-foreground font-bold">Save sounds you find for later</h3>
            <p>Once you find a song via the audio page, tap the bookmark icon to save it to your own audio library in Instagram, so you can reuse it in your own Reels without searching again.</p>
            <h3 className="text-foreground font-bold">Other free tools you might like</h3>
            <ul>
              <li><Link href="/tools/instagram-trending-songs-finder" className="text-primary">Instagram Trending Songs Finder</Link> — score and find trending Reels audio before you post</li>
              <li><Link href="/tools/instagram-bio-generator" className="text-primary">Instagram Bio Generator</Link> — 5 ready-to-use bio options</li>
              <li><Link href="/tools/best-time-to-post-instagram-reels" className="text-primary">Best Time to Post Instagram Reels</Link> — find peak engagement hours</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
