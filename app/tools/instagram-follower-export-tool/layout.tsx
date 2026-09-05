import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Instagram Follower Export Tool | Free Official Method",
  description: "Learn the safe, official way to export your Instagram followers list to a spreadsheet — no password sharing, no risky third-party tools.",
  keywords: [
    "instagram follower export tool",
    "ig follower export tool",
    "instagram export tool",
    "follower export tool",
    "how to export instagram followers",
    "export instagram followers to csv",
    "download instagram followers list",
    "instagram followers list export",
  ],
  alternates: { canonical: "https://shortpurify.com/tools/instagram-follower-export-tool" },
  openGraph: {
    title: "Instagram Follower Export Tool | Free Official Method",
    description: "Learn the safe, official way to export your Instagram followers list — no password sharing required.",
    url: "https://shortpurify.com/tools/instagram-follower-export-tool",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Instagram Follower Export Tool | Free Official Method",
    description: "Learn the safe, official way to export your Instagram followers list — no password sharing required.",
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
            "name": "Instagram Follower Export Guide",
            "url": "https://shortpurify.com/tools/instagram-follower-export-tool",
            "description": "Learn the safe, official way to export your Instagram followers list to a spreadsheet.",
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
          __html: JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"How do I export my Instagram followers list?","acceptedAnswer":{"@type":"Answer","text":"Go to Instagram Settings → Accounts Center → Your information and permissions → Download your information. Select your account, choose 'Some of your information,' pick 'Followers and following,' and choose JSON or HTML format. Instagram emails you a download link once it's ready."}},{"@type":"Question","name":"Is it safe to use a third-party Instagram follower export tool?","acceptedAnswer":{"@type":"Answer","text":"Be very cautious. Most third-party tools that promise instant follower exports ask for your Instagram password, which is a common credential-phishing pattern, or they use automated bot access that violates Instagram's Terms of Service and can get your account restricted or banned. Instagram's own built-in export feature does the same job without those risks."}},{"@type":"Question","name":"How do I convert my Instagram followers JSON export to a spreadsheet?","acceptedAnswer":{"@type":"Answer","text":"Open the exported followers_1.json file in a text editor to see the raw list, or use a free online JSON-to-CSV converter to turn it into a spreadsheet you can open in Excel or Google Sheets."}},{"@type":"Question","name":"How long does an Instagram data export take?","acceptedAnswer":{"@type":"Answer","text":"It usually takes anywhere from a few minutes to a few hours, depending on account size and Instagram's current processing load. You'll get a notification and email when your download is ready."}}]}),
        }}
      />
      <div className="min-h-screen bg-[#FAFAF8]">
        {children}
        <div className="max-w-3xl mx-auto px-4 pb-14">
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <h2 className="text-foreground font-extrabold text-xl">Why so many &quot;export tools&quot; ask for your password</h2>
            <p>Instagram doesn&apos;t offer a public API for pulling someone&apos;s full follower list on demand — Meta locked that down years ago to prevent spam and scraping. Any tool that instantly hands you a follower list without going through Instagram&apos;s own export flow is almost certainly either using stolen session cookies, asking you to log in through a fake page, or automating actions that put your account at risk.</p>
            <h3 className="text-foreground font-bold">What you can actually do with the exported data</h3>
            <p>The official export gives you usernames, not activity or engagement data. It&apos;s useful for backups, audience-size verification, or cross-referencing against your own CRM — not for automated outreach, which Instagram also restricts.</p>
            <h3 className="text-foreground font-bold">Related tools</h3>
            <ul>
              <li><Link href="/tools/instagram-bio-generator" className="text-primary">Instagram Bio Generator</Link></li>
              <li><Link href="/tools/instagram-reels-history-finder" className="text-primary">Instagram Reels History Finder</Link></li>
              <li><Link href="/tools/best-time-to-post-instagram-reels" className="text-primary">Best Time to Post Instagram Reels</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
