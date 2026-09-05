import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Instagram Automation Tool: Safe vs Risky | Free Guide",
  description: "Not all Instagram automation is the same. Check the red flags, compare safe vs risky automation, and see what actually complies with Instagram's rules.",
  keywords: [
    "instagram automation tool",
    "instagram automation",
    "is instagram automation safe",
    "instagram bot risk",
    "safe instagram automation",
    "instagram automation tools list",
    "instagram automation banned",
    "instagram growth tool risk",
  ],
  alternates: { canonical: "https://shortpurify.com/tools/instagram-automation-tool" },
  openGraph: {
    title: "Instagram Automation Tool: Safe vs Risky | Free Guide",
    description: "Not all Instagram automation is the same — check the red flags before connecting a tool to your account.",
    url: "https://shortpurify.com/tools/instagram-automation-tool",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Instagram Automation Tool: Safe vs Risky | Free Guide",
    description: "Not all Instagram automation is the same — check the red flags before connecting a tool to your account.",
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
            "name": "Instagram Automation Tool: Safe vs Risky",
            "url": "https://shortpurify.com/tools/instagram-automation-tool",
            "description": "Check the red flags, compare safe vs risky Instagram automation, and see what actually complies with Instagram's rules.",
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
          __html: JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Is Instagram automation safe to use?","acceptedAnswer":{"@type":"Answer","text":"It depends what's being automated. Scheduling posts, AI-assisted captioning, and analytics tools that only read your own data are generally safe and comply with Instagram's terms. Automation that performs actions on your behalf without review — auto-following, auto-liking, auto-DMing — violates Instagram's Terms of Service and risks account restriction or a permanent ban."}},{"@type":"Question","name":"What are the warning signs of a risky Instagram automation tool?","acceptedAnswer":{"@type":"Answer","text":"Red flags include: asking for your Instagram password instead of an official login, promising guaranteed fast follower growth, performing likes/follows/comments automatically, sending bulk DMs without your review, and not being a recognized Meta Business Partner using the official API."}},{"@type":"Question","name":"Can Instagram ban my account for using automation tools?","acceptedAnswer":{"@type":"Answer","text":"Yes. Instagram actively detects and penalizes accounts using bot-like automated behavior, ranging from temporary action blocks to permanent bans, especially for auto-following, auto-liking at scale, or logging in through unofficial third-party apps."}},{"@type":"Question","name":"What kind of automation does Instagram actually allow?","acceptedAnswer":{"@type":"Answer","text":"Instagram permits scheduling and publishing content through its official API and Meta Business Partners, along with tools that read your own account data for analytics. Anything that simulates real user actions like liking, following, or commenting automatically is not permitted."}}]}),
        }}
      />
      <div className="min-h-screen bg-[#FAFAF8]">
        {children}
        <div className="max-w-3xl mx-auto px-4 pb-14">
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <h2 className="text-foreground font-extrabold text-xl">Why the &quot;automation&quot; label is misleading</h2>
            <p>Marketers use &quot;automation&quot; to describe two very different things: tools that automate your workflow (scheduling, editing, captioning) and tools that automate fake engagement (bots pretending to be real user activity). Instagram&apos;s rules only target the second kind, but both get marketed with the same word.</p>
            <h3 className="text-foreground font-bold">The official line</h3>
            <p>Meta&apos;s Platform Terms explicitly prohibit automating likes, follows, comments, and direct messages outside of their approved Business Partner APIs. Content scheduling and publishing through an official integration is explicitly supported.</p>
            <h3 className="text-foreground font-bold">Related tools</h3>
            <ul>
              <li><Link href="/tools/instagram-follower-export-tool" className="text-primary">Instagram Follower Export Tool</Link> — the safe way to export your own data</li>
              <li><Link href="/tools/instagram-bio-generator" className="text-primary">Instagram Bio Generator</Link></li>
              <li><Link href="/tools/best-time-to-post-instagram-reels" className="text-primary">Best Time to Post Instagram Reels</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
