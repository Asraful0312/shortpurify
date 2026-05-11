import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "YouTube Shorts Script Generator | Free AI Tool",
  description: "Generate a complete YouTube Shorts script instantly with AI hook, body, and call-to-action. Free, no sign-up required. Write viral short-form video scripts in seconds.",
  keywords: [
    "youtube shorts script generator",
    "youtube video script generator",
    "short form video script",
    "youtube shorts script",
    "AI script generator youtube",
    "viral video script",
    "youtube shorts script template",
    "free script generator",
  ],
  alternates: { canonical: "https://shortpurify.com/tools/youtube-shorts-script-generator" },
  openGraph: {
    title: "YouTube Shorts Script Generator | Free AI Tool",
    description: "Generate a complete YouTube Shorts script with hook, body, and CTA instantly. Free, no sign-up required.",
    url: "https://shortpurify.com/tools/youtube-shorts-script-generator",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "YouTube Shorts Script Generator | Free AI Tool",
    description: "Generate a complete YouTube Shorts script with hook, body, and CTA instantly. Free, no sign-up required.",
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
            "name": "YouTube Shorts Script Generator",
            "url": "https://shortpurify.com/tools/youtube-shorts-script-generator",
            "description": "Generate a complete YouTube Shorts script with hook, body, and call-to-action instantly using AI.",
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
          __html: JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"How do I write a YouTube Shorts script?","acceptedAnswer":{"@type":"Answer","text":"A YouTube Shorts script has three parts: Hook (first 3 seconds — start mid-thought with a bold claim or question), Body (deliver value fast, one idea per sentence, cut anything that doesn't move the story forward), and CTA (last 3 seconds — ask for one action: follow, comment, or link)."}},{"@type":"Question","name":"How long should a YouTube Shorts script be?","acceptedAnswer":{"@type":"Answer","text":"For a 30-second Short, write approximately 65 words. For 60 seconds, write about 130 words. Average speaking pace is 130–150 words per minute. Keep scripts tight — shorter scripts encourage loops, and loops signal high retention to the algorithm."}},{"@type":"Question","name":"What makes a good YouTube Shorts hook?","acceptedAnswer":{"@type":"Answer","text":"The best YouTube Shorts hooks start mid-action: 'I just discovered something most creators don't know...', 'Nobody talks about this hack...', or 'Here's why your Shorts aren't going viral...' Avoid intros, channel names, and pleasantries. The hook must create urgency or curiosity in the first 3 seconds."}},{"@type":"Question","name":"Should YouTube Shorts have a call to action?","acceptedAnswer":{"@type":"Answer","text":"Yes, but keep it to one CTA. Ask viewers to follow, comment with their answer, or watch another video. Multiple CTAs confuse viewers and reduce conversion. Place the CTA in the last 3 seconds of the Short so it doesn't interrupt the content."}},{"@type":"Question","name":"Can I use AI to write YouTube Shorts scripts?","acceptedAnswer":{"@type":"Answer","text":"Yes. AI script generators work well for YouTube Shorts because the format is structured and short. The key is to customize the AI output to match your speaking style and add specific details, examples, or personal insights that make the content feel authentic."}}]}),
        }}
      />
      <div className="min-h-screen bg-[#FAFAF8]">
        {children}
        <div className="max-w-3xl mx-auto px-4 pb-14">
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <h2 className="text-foreground font-extrabold text-xl">How to write a YouTube Shorts script that keeps viewers watching</h2>
            <p>YouTube Shorts are won or lost in the first 3 seconds. Unlike long-form videos, you have no time to warm up your hook must be the very first thing viewers hear or see.</p>
            <h3 className="text-foreground font-bold">The 3-part Short script structure</h3>
            <ul>
              <li><strong>Hook (0–3s)</strong> — Start mid-thought. &quot;I can&apos;t believe this works...&quot; or &quot;Nobody talks about this.&quot; Avoid intros and name drops.</li>
              <li><strong>Body (3s–end)</strong> — Deliver the value fast. One idea per sentence. Cut anything that doesn&apos;t move the story forward.</li>
              <li><strong>CTA (last 3s)</strong> — Ask for one thing: follow, comment, or link. Never ask for multiple actions in one Short.</li>
            </ul>
            <h3 className="text-foreground font-bold">How long should a YouTube Shorts script be?</h3>
            <p>An average speaking pace is 130–150 words per minute. For a 30-second Short, write ~65 words. For 60 seconds, ~130 words. Keep it tight the algorithm rewards high retention, and shorter scripts typically perform better because viewers loop them.</p>
            <h3 className="text-foreground font-bold">Other free tools you might like</h3>
            <ul>
              <li><Link href="/tools/youtube-shorts-title-generator" className="text-primary">YouTube Shorts Title Generator</Link> — 10 click-worthy titles instantly</li>
              <li><Link href="/tools/youtube-shorts-duration-calculator" className="text-primary">YouTube Shorts Duration Calculator</Link> — find the optimal clip length</li>
              <li><Link href="/tools/youtube-thumbnail-prompt-generator" className="text-primary">YouTube Thumbnail Prompt Generator</Link> — AI prompts for Midjourney &amp; DALL·E</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
