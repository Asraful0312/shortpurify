import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "YouTube Monetization Checker | Free Tool",
  description: "Check if a YouTube channel meets the YouTube Partner Program (YPP) requirements. Enter any channel URL or @handle to see subscriber count, video count, and monetization eligibility instantly.",
  keywords: [
    "youtube monetization checker",
    "youtube monetization eligibility",
    "youtube partner program checker",
    "YPP eligibility checker",
    "youtube channel monetization",
    "can I monetize my youtube channel",
    "youtube 1000 subscribers checker",
    "youtube monetization requirements",
  ],
  alternates: { canonical: "https://shortpurify.com/tools/youtube-monetization-checker" },
  openGraph: {
    title: "YouTube Monetization Checker | Free Tool",
    description: "Check if a YouTube channel meets YPP requirements. Enter any channel URL or @handle instantly. Free, no sign-up required.",
    url: "https://shortpurify.com/tools/youtube-monetization-checker",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "YouTube Monetization Checker | Free Tool",
    description: "Check if a YouTube channel meets YPP requirements. Enter any channel URL or @handle instantly. Free, no sign-up required.",
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
            "name": "YouTube Monetization Checker",
            "url": "https://shortpurify.com/tools/youtube-monetization-checker",
            "description": "Check if a YouTube channel meets YouTube Partner Program requirements. Free, no sign-up required.",
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
          __html: JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"How many subscribers do you need to monetize YouTube?","acceptedAnswer":{"@type":"Answer","text":"For Standard YouTube Partner Program (full monetization with ads): 1,000 subscribers AND 4,000 public watch hours in the past 12 months, OR 10 million Shorts views in 90 days. For Early Access YPP (fan funding only): 500 subscribers AND 3,000 watch hours or 3 million Shorts views."}},{"@type":"Question","name":"How do I check if a YouTube channel is monetized?","acceptedAnswer":{"@type":"Answer","text":"You can't see another channel's monetization status directly. Indicators of monetization include: ads appearing before/during videos, a 'Join' button for channel memberships, Super Thanks option on videos, and merchandise shelf on the channel page. Our checker tool shows subscriber counts and watch hour eligibility."}},{"@type":"Question","name":"How long does YouTube monetization approval take?","acceptedAnswer":{"@type":"Answer","text":"After applying for the YouTube Partner Program, the review process takes approximately 1 month. YouTube reviews your content for advertiser-friendliness, community guidelines compliance, and originality. If rejected, you can reapply after 30 days."}},{"@type":"Question","name":"Do YouTube Shorts count toward watch hours for monetization?","acceptedAnswer":{"@type":"Answer","text":"No. YouTube Shorts views do NOT count toward the 4,000 watch hours requirement for Standard YPP. However, there is a separate Shorts path: 10 million valid public Shorts views in the past 90 days qualifies you for Standard YPP."}},{"@type":"Question","name":"How much money does YouTube pay per 1,000 views?","acceptedAnswer":{"@type":"Answer","text":"YouTube pays an average of $1–$5 per 1,000 views (CPM) for most channels, though this varies heavily by niche, country, and video type. Finance, business, and tech channels earn $5–$30 CPM. Entertainment and gaming typically earn $1–$3 CPM. You receive about 55% of ad revenue after YouTube's cut."}}]}),
        }}
      />
      <div className="min-h-screen bg-[#FAFAF8]">
        {children}
        <div className="max-w-3xl mx-auto px-4 pb-14">
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <h2 className="text-foreground font-extrabold text-xl">YouTube Partner Program requirements in 2025</h2>
            <p>YouTube has two tiers of monetization Early Access YPP and Standard YPP. Both require your channel to comply with YouTube&apos;s monetization policies and be in good standing.</p>
            <h3 className="text-foreground font-bold">Standard YPP (full monetization)</h3>
            <ul>
              <li>1,000 subscribers</li>
              <li>4,000 public watch hours in the past 12 months <strong>OR</strong> 10 million valid public Shorts views in the past 90 days</li>
            </ul>
            <h3 className="text-foreground font-bold">Early Access YPP (fan funding only)</h3>
            <ul>
              <li>500 subscribers</li>
              <li>3 public uploads in the last 90 days</li>
              <li>3,000 public watch hours in the past 12 months <strong>OR</strong> 3 million valid public Shorts views in the past 90 days</li>
            </ul>
            <h3 className="text-foreground font-bold">How to reach 4,000 watch hours faster</h3>
            <p>4,000 watch hours = 240,000 minutes of watchtime. Focus on longer videos (10–20 min) with high retention, and use YouTube Shorts to drive subscribers to your long-form content. ShortPurify can clip your existing long videos into Shorts automatically to grow both metrics simultaneously.</p>
            <h3 className="text-foreground font-bold">Other free tools you might like</h3>
            <ul>
              <li><Link href="/tools/youtube-shorts-title-generator" className="text-primary">YouTube Shorts Title Generator</Link> — 10 click-worthy titles instantly</li>
              <li><Link href="/tools/youtube-shorts-script-generator" className="text-primary">YouTube Shorts Script Generator</Link> — complete scripts with hook, body &amp; CTA</li>
              <li><Link href="/tools/youtube-shorts-duration-calculator" className="text-primary">YouTube Shorts Duration Calculator</Link> — optimal clip length for your video</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
