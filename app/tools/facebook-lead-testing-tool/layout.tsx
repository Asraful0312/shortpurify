import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Facebook Lead Testing Tool | Pre-Launch Checklist",
  description: "A free pre-launch checklist for testing your Facebook lead ad form — preview, CRM integration, redirect, and test-lead cleanup.",
  keywords: [
    "facebook lead testing tool",
    "facebook lead ads testing",
    "test facebook lead form",
    "facebook lead form preview",
    "facebook instant forms testing",
    "how to test facebook lead ads",
    "facebook leads center test",
    "facebook lead ad crm integration test",
  ],
  alternates: { canonical: "https://shortpurify.com/tools/facebook-lead-testing-tool" },
  openGraph: {
    title: "Facebook Lead Testing Tool | Pre-Launch Checklist",
    description: "A free pre-launch checklist for testing your Facebook lead ad form before it goes live.",
    url: "https://shortpurify.com/tools/facebook-lead-testing-tool",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Facebook Lead Testing Tool | Pre-Launch Checklist",
    description: "A free pre-launch checklist for testing your Facebook lead ad form before it goes live.",
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
            "name": "Facebook Lead Testing Tool Checklist",
            "url": "https://shortpurify.com/tools/facebook-lead-testing-tool",
            "description": "A free pre-launch checklist for testing your Facebook lead ad form before it goes live.",
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
          __html: JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"How do I test a Facebook lead ad form before publishing?","acceptedAnswer":{"@type":"Answer","text":"In Meta Business Suite or Ads Manager, open Publishing Tools, go to the Forms Library, select your lead form, and use the Preview option. This shows the form exactly as a visitor would see it on both mobile and desktop before you spend any budget."}},{"@type":"Question","name":"Where do test leads from Facebook go?","acceptedAnswer":{"@type":"Answer","text":"Test submissions land in the same place as real leads — your connected CRM, webhook/Zapier destination, or the manual CSV download in Leads Center. There's no separate 'test' inbox, so you need to identify and remove test entries yourself before launch."}},{"@type":"Question","name":"Why isn't my Facebook lead form sending data to my CRM?","acceptedAnswer":{"@type":"Answer","text":"This is usually a broken or disconnected integration rather than a problem with the form itself. Submit a real test lead and check whether it appears in your CRM or webhook tool — if it doesn't, reconnect the integration in Ads Manager before going live."}},{"@type":"Question","name":"Do I need to delete test leads from Facebook before launching my ad?","acceptedAnswer":{"@type":"Answer","text":"Yes. Test leads are indistinguishable from real ones once they're in your Leads Center or CRM, so delete or clearly tag them before turning the ad on to avoid your sales team following up on fake submissions."}}]}),
        }}
      />
      <div className="min-h-screen bg-[#FAFAF8]">
        {children}
        <div className="max-w-3xl mx-auto px-4 pb-14">
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <h2 className="text-foreground font-extrabold text-xl">Why testing matters before you spend budget</h2>
            <p>A lead form that looks fine in the ad preview can still fail silently — a broken CRM connection, a missing redirect, or a form field that doesn&apos;t match what your sales team expects. Running through the checklist above once, before launch, avoids paying for leads that never actually reach anyone.</p>
            <h3 className="text-foreground font-bold">Test on both platforms</h3>
            <p>Facebook lead forms render differently on mobile versus desktop. Always preview both — most lead ad traffic is mobile, so that&apos;s the version that matters most, but desktop visitors still convert too.</p>
            <h3 className="text-foreground font-bold">Related tools</h3>
            <ul>
              <li><Link href="/tools/facebook-branded-content-tool" className="text-primary">Facebook Branded Content Tool</Link></li>
              <li><Link href="/tools/facebook-video-downloader" className="text-primary">Facebook Video Download Helper</Link></li>
              <li><Link href="/tools/hashtag-generator" className="text-primary">Hashtag Generator</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
