import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Instagram Story Idea Generator | Free AI Tool",
  description: "Generate 8 engaging Instagram Story ideas with sticker suggestions instantly using AI. Free, no sign-up required. Polls, quizzes, behind-the-scenes, and more.",
  keywords: [
    "instagram story idea generator",
    "instagram story ideas",
    "instagram story content ideas",
    "instagram story generator ai",
    "free instagram story ideas",
    "instagram story ideas for business",
    "instagram story ideas for engagement",
    "instagram story poll ideas",
    "instagram story sticker ideas",
    "what to post on instagram story",
    "instagram story content calendar",
  ],
  alternates: { canonical: "https://shortpurify.com/tools/instagram-story-idea-generator" },
  openGraph: {
    title: "Instagram Story Idea Generator | Free AI Tool",
    description: "Generate 8 engaging Instagram Story ideas with sticker suggestions instantly using AI. Free, no sign-up required.",
    url: "https://shortpurify.com/tools/instagram-story-idea-generator",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Instagram Story Idea Generator | Free AI Tool",
    description: "Generate 8 engaging Instagram Story ideas with sticker suggestions instantly using AI. Free, no sign-up required.",
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
            "name": "Instagram Story Idea Generator",
            "url": "https://shortpurify.com/tools/instagram-story-idea-generator",
            "description": "Generate 8 engaging Instagram Story ideas with sticker suggestions instantly using AI. Free, no sign-up required.",
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
          __html: JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"What should I post on my Instagram Story?","acceptedAnswer":{"@type":"Answer","text":"Mix interactive formats (polls, quizzes, sliders, question boxes), behind-the-scenes moments, this-or-that comparisons, countdowns for launches, user-generated content via 'Add yours', and quick tips relevant to your niche. Interactive stickers boost reach because Instagram's algorithm favors Stories that get replies and taps."}},{"@type":"Question","name":"How many Instagram Stories should I post per day?","acceptedAnswer":{"@type":"Answer","text":"Most creators and brands post 3-7 Stories per day to stay visible in followers' Story trays without overwhelming them. Quality and variety of format matter more than raw volume — mix static, video, and interactive sticker Stories."}},{"@type":"Question","name":"Do Instagram Story polls and quizzes actually help engagement?","acceptedAnswer":{"@type":"Answer","text":"Yes. Interactive stickers like polls, quizzes, sliders, and question boxes generate direct engagement signals (taps, votes, replies) that Instagram's algorithm weighs when deciding how many followers see your next Story and whether it appears in the Explore or Stories tray."}},{"@type":"Question","name":"How long should an Instagram Story idea run for?","acceptedAnswer":{"@type":"Answer","text":"Each Story frame lasts up to 15 seconds for video or 5-7 seconds for images by default. Break longer ideas into a short sequence of 2-4 frames rather than cramming everything into one Story."}}]}),
        }}
      />
      <div className="min-h-screen bg-[#FAFAF8]">
        {children}
        <div className="max-w-3xl mx-auto px-4 pb-14">
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <h2 className="text-foreground font-extrabold text-xl">How to come up with Instagram Story ideas</h2>
            <p>The best Instagram Stories mix formats instead of repeating the same static photo every day. Interactive stickers — polls, quizzes, sliders, question boxes — drive the taps and replies that Instagram&apos;s algorithm rewards with more reach.</p>
            <h3 className="text-foreground font-bold">Instagram Story idea categories that work</h3>
            <ul>
              <li><strong>Interactive:</strong> Polls, quizzes, sliders, and question boxes that invite a reply</li>
              <li><strong>Behind-the-scenes:</strong> Process, workspace, or day-in-the-life content that builds trust</li>
              <li><strong>This-or-that:</strong> Quick comparisons that are easy to react to</li>
              <li><strong>Countdown/announcement:</strong> Build anticipation for launches, drops, or events</li>
              <li><strong>UGC / &quot;Add yours&quot;:</strong> Prompts that turn followers into contributors</li>
              <li><strong>Educational:</strong> A quick tip or fact relevant to your niche</li>
            </ul>
            <h3 className="text-foreground font-bold">How often should you post Stories?</h3>
            <p>3-7 Stories per day keeps you visible without overwhelming followers. Vary the format across the day rather than posting the same type back-to-back.</p>
            <h3 className="text-foreground font-bold">Other free tools you might like</h3>
            <ul>
              <li><Link href="/tools/instagram-story-size-calculator" className="text-primary">Instagram Story Size Calculator</Link> — get dimensions and safe zones right</li>
              <li><Link href="/tools/instagram-bio-generator" className="text-primary">Instagram Bio Generator</Link> — 5 ready-to-use bio options</li>
              <li><Link href="/tools/best-time-to-post-instagram-reels" className="text-primary">Best Time to Post Instagram Reels</Link> — find peak engagement hours</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
