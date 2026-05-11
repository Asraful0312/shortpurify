import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "YouTube Shorts Duration Calculator | Free Tool",
  description: "Calculate how many YouTube Shorts you can make from a long video. Find the optimal clip length — 15s, 30s, 60s, or 3 minutes. Free, no sign-up required.",
  keywords: [
    "youtube shorts duration calculator",
    "youtube shorts timer",
    "how long should youtube shorts be",
    "youtube shorts length",
    "youtube shorts clip calculator",
    "how many shorts from long video",
    "youtube shorts optimal length",
    "youtube shorts 3 minutes",
  ],
  alternates: { canonical: "https://shortpurify.com/tools/youtube-shorts-duration-calculator" },
  openGraph: {
    title: "YouTube Shorts Duration Calculator | Free Tool",
    description: "Calculate how many YouTube Shorts you can make from a long video. Find the optimal clip length instantly. Free, no sign-up required.",
    url: "https://shortpurify.com/tools/youtube-shorts-duration-calculator",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "YouTube Shorts Duration Calculator | Free Tool",
    description: "Calculate how many YouTube Shorts you can make from a long video. Find the optimal clip length instantly. Free, no sign-up required.",
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
            "name": "YouTube Shorts Duration Calculator",
            "url": "https://shortpurify.com/tools/youtube-shorts-duration-calculator",
            "description": "Calculate how many YouTube Shorts you can make from a long video and find the optimal clip length.",
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
          __html: JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"How long can YouTube Shorts be in 2025?","acceptedAnswer":{"@type":"Answer","text":"YouTube Shorts can be up to 3 minutes (180 seconds) long as of October 2023. The previous limit was 60 seconds. However, shorts under 60 seconds still tend to get more loops and higher retention rates, which the algorithm rewards."}},{"@type":"Question","name":"What is the best length for YouTube Shorts?","acceptedAnswer":{"@type":"Answer","text":"15–30 seconds is the sweet spot for most YouTube Shorts content. This length is long enough to deliver value but short enough to encourage loops. For tutorials and explainers, 30–60 seconds works well. Only go longer if the content genuinely requires it."}},{"@type":"Question","name":"How many YouTube Shorts can I make from a long video?","acceptedAnswer":{"@type":"Answer","text":"A 60-minute video contains 3,600 seconds of content. At 30 seconds per clip, that's up to 120 potential Shorts. At 60 seconds per clip, that's 60 Shorts. Tools like ShortPurify automatically identify the best moments so you don't have to manually review the whole video."}},{"@type":"Question","name":"Do longer YouTube Shorts get fewer views?","acceptedAnswer":{"@type":"Answer","text":"Not necessarily, but completion rate matters. The YouTube algorithm rewards videos with high audience retention. A 20-second Short with 95% completion outperforms a 90-second Short with 40% completion. Keep Shorts tight and front-load the value."}},{"@type":"Question","name":"What is the minimum length for YouTube Shorts?","acceptedAnswer":{"@type":"Answer","text":"There is no official minimum length for YouTube Shorts, but videos shorter than 3 seconds rarely perform well. The practical minimum for meaningful content is around 7–10 seconds. YouTube requires a vertical (9:16) aspect ratio or square format to classify a video as a Short."}}]}),
        }}
      />
      <div className="min-h-screen bg-[#FAFAF8]">
        {children}
        <div className="max-w-3xl mx-auto px-4 pb-14">
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <h2 className="text-foreground font-extrabold text-xl">YouTube Shorts timer everything you need to know in 2025</h2>
            <p>YouTube Shorts now supports videos up to <strong>3 minutes (180 seconds)</strong>, up from the previous 60-second limit. However, longer doesn&apos;t always mean better the algorithm still favors videos with high audience retention, which typically means shorter clips.</p>
            <h3 className="text-foreground font-bold">Best YouTube Shorts length by content type</h3>
            <ul>
              <li><strong>15–30 seconds</strong> — Hooks, reactions, memes, satisfying clips. Highest loop rate.</li>
              <li><strong>30–60 seconds</strong> — Tips, tutorials, product showcases. Best balance of retention and value.</li>
              <li><strong>60–90 seconds</strong> — Mini-tutorials, storytelling, before/after. Good for educational content.</li>
              <li><strong>90s–3 minutes</strong> — In-depth explainers, vlogs, mini-docs. Use only if the full time is necessary.</li>
            </ul>
            <h3 className="text-foreground font-bold">How to use the YouTube Shorts timer in the app</h3>
            <p>When recording in the YouTube app, tap the timer icon to set a countdown before recording starts. You can also set a clip duration so recording stops automatically. For best results, plan your script to fit within 30–45 seconds and record in one take.</p>
            <h3 className="text-foreground font-bold">How many Shorts can you make from a 1-hour video?</h3>
            <p>A 60-minute video contains 3,600 seconds of content. At 30 seconds per clip, that&apos;s up to 120 Shorts. At 60 seconds per clip, that&apos;s 60 Shorts. Tools like ShortPurify automatically identify the best moments so you don&apos;t have to watch the whole video manually.</p>
            <h3 className="text-foreground font-bold">Other free tools you might like</h3>
            <ul>
              <li><Link href="/tools/youtube-shorts-title-generator" className="text-primary">YouTube Shorts Title Generator</Link> — 10 click-worthy titles instantly</li>
              <li><Link href="/tools/youtube-thumbnail-prompt-generator" className="text-primary">YouTube Thumbnail Prompt Generator</Link> — AI prompts for Midjourney &amp; DALL·E</li>
              <li><Link href="/tools/hashtag-generator" className="text-primary">Hashtag Generator</Link> — Instagram, TikTok &amp; YouTube hashtags</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
