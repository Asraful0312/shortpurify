import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Facebook Branded Content Tool | Eligibility Check & Guide",
  description: "Check your eligibility for Facebook's Branded Content Tool and learn how to request access and tag a paid partnership the right way.",
  keywords: [
    "facebook branded content tool",
    "facebook branded content",
    "facebook branded content tool request form",
    "how to use facebook branded content tool",
    "facebook paid partnership tag",
    "facebook branded content eligibility",
    "how to request branded content tool facebook",
    "facebook creator tools branded content",
  ],
  alternates: { canonical: "https://shortpurify.com/tools/facebook-branded-content-tool" },
  openGraph: {
    title: "Facebook Branded Content Tool | Eligibility Check & Guide",
    description: "Check your eligibility for Facebook's Branded Content Tool and learn how to tag a paid partnership correctly.",
    url: "https://shortpurify.com/tools/facebook-branded-content-tool",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Facebook Branded Content Tool | Eligibility Check & Guide",
    description: "Check your eligibility for Facebook's Branded Content Tool and learn how to tag a paid partnership correctly.",
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
            "name": "Facebook Branded Content Tool Guide",
            "url": "https://shortpurify.com/tools/facebook-branded-content-tool",
            "description": "Check your eligibility for Facebook's Branded Content Tool and learn how to tag a paid partnership correctly.",
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
          __html: JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"What is the Facebook Branded Content Tool?","acceptedAnswer":{"@type":"Answer","text":"It's a feature that lets creators and Pages formally tag a business partner on a post, Reel, or Live video, adding a visible \"Paid partnership with [Page]\" label. The tagged business also gets access to performance insights for that post."}},{"@type":"Question","name":"How do I request access to the Branded Content Tool on Facebook?","acceptedAnswer":{"@type":"Answer","text":"Go to your Page or professional account's Creator Tools settings, or the Branded Content section in Meta Business Suite, and request access. Approval is typically automatic if your account is in good standing, professional (not personal), and based in a supported country."}},{"@type":"Question","name":"Why was my Branded Content Tool request denied?","acceptedAnswer":{"@type":"Answer","text":"Common reasons include recent Community Standards violations, using a personal profile instead of a Page or professional account, being in an unsupported country, or promoting a restricted category like alcohol or gambling without the required extra approvals."}},{"@type":"Question","name":"How do I tag a business partner using the Branded Content Tool?","acceptedAnswer":{"@type":"Answer","text":"When creating a post, Reel, or Live video, open the advanced settings menu, select Branded Content Tool, and search for your partner's Page. The partner receives a notification and must accept the tag before the paid partnership label appears publicly."}}]}),
        }}
      />
      <div className="min-h-screen bg-[#FAFAF8]">
        {children}
        <div className="max-w-3xl mx-auto px-4 pb-14">
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <h2 className="text-foreground font-extrabold text-xl">Why tagging matters</h2>
            <p>Disclosing paid partnerships isn&apos;t just a Facebook policy — many countries legally require creators to disclose sponsored content. The Branded Content Tool handles this automatically with a visible label, so you don&apos;t need a manual disclaimer in your caption.</p>
            <h3 className="text-foreground font-bold">What your brand partner sees</h3>
            <p>Once a partner accepts a branded content tag, they can view reach and engagement data for that specific post through their own Meta Business Suite — useful for reporting on sponsorship performance without needing screenshots.</p>
            <h3 className="text-foreground font-bold">Related tools</h3>
            <ul>
              <li><Link href="/tools/facebook-video-downloader" className="text-primary">Facebook Video Download Helper</Link></li>
              <li><Link href="/tools/instagram-bio-generator" className="text-primary">Instagram Bio Generator</Link></li>
              <li><Link href="/tools/hashtag-generator" className="text-primary">Hashtag Generator</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
