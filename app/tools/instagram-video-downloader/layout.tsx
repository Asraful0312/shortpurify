import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

// Hidden pending AdSense review — downloader tools can trigger rejection.
// Flip this back to true (and remove the notFound() guard below) once the
// application is approved or rejected. Backend actions are untouched.
const TOOL_LIVE = false;

export const metadata: Metadata = {
  ...(TOOL_LIVE ? {} : { robots: { index: false, follow: false } }),
  title: "Free Instagram Video Download Helper | Best-Effort Tool",
  description: "Try a free best-effort Instagram video download helper. Paste a public Instagram link and get fallback steps if public extraction services are unavailable.",
  keywords: [
    "instagram downloader",
    "instagram video downloader",
    "instagram reel downloader",
    "download instagram video",
    "download instagram reel",
    "instagram download",
    "free instagram downloader",
    "instagram to mp4",
    "save instagram video",
    "instagram download helper",
    "how to download instagram video free",
    "how to download instagram reel",
    "instagram downloader ios",
    "instagram downloader android",
  ],
  alternates: { canonical: "https://shortpurify.com/tools/instagram-video-downloader" },
  openGraph: {
    title: "Free Instagram Video Download Helper | Best-Effort Tool",
    description: "Try a free best-effort Instagram video download helper with clear fallback steps.",
    url: "https://shortpurify.com/tools/instagram-video-downloader",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Instagram Video Download Helper | Best-Effort Tool",
    description: "Try a free best-effort Instagram video download helper with clear fallback steps.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  if (!TOOL_LIVE) {
    notFound();
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Instagram Video Download Helper",
            "url": "https://shortpurify.com/tools/instagram-video-downloader",
            "description": "Try a free best-effort Instagram video download helper with clear fallback steps.",
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
          __html: JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"How do I download an Instagram Reel or video?","acceptedAnswer":{"@type":"Answer","text":"To download an Instagram Reel or video: 1) Open the Reel or post and tap the three-dot menu or Share icon to copy the link. 2) Paste it into an Instagram downloader tool. 3) Download the MP4 file. Note that availability depends on whether the account is public and whether public extraction services are currently working."}},{"@type":"Question","name":"Is it legal to download Instagram videos?","acceptedAnswer":{"@type":"Answer","text":"Downloading Instagram content for personal viewing is generally permitted. Reposting downloaded content without credit or permission from the creator may violate copyright and Instagram's terms of service. Always credit original creators if you share their content."}},{"@type":"Question","name":"Why can't I download some Instagram Reels?","acceptedAnswer":{"@type":"Answer","text":"Some Instagram Reels cannot be downloaded because: the account is private, the post has been deleted, the content contains licensed music that restricts downloading, or the extraction service is temporarily rate-limited by Instagram."}},{"@type":"Question","name":"What format are Instagram video downloads?","acceptedAnswer":{"@type":"Answer","text":"Instagram Reels and videos download as MP4 files. Reels are in 9:16 vertical format, typically at 720p or 1080p resolution."}}]}),
        }}
      />
      <div className="min-h-screen bg-[#FAFAF8]">
        {children}
        <div className="max-w-3xl mx-auto px-4 pb-14">
          <div className="prose prose-sm max-w-none text-muted-foreground border-t border-border pt-12">
            <h2 className="text-foreground font-extrabold text-2xl">How to try downloading an Instagram video</h2>
            <p>Instagram download tools can be unreliable because public extraction services go offline, get rate-limited, or lose support for Instagram changes. This helper is free and best-effort: it works when the link is public and an available extractor can process it.</p>
            <h3 className="text-foreground font-bold text-lg mt-8">Simple steps to save Instagram videos to MP4:</h3>
            <ol>
              <li><strong>Copy Link:</strong> Find the Reel, post, or video you want to download, tap the three-dot menu or paper-plane &quot;Share&quot; icon, and select &quot;Copy Link&quot;.</li>
              <li><strong>Paste URL:</strong> Open ShortPurify&apos;s Instagram Downloader and paste the link into the input box above.</li>
              <li><strong>Try Download:</strong> Click the button. If a free extractor can process the link, you&apos;ll get a downloadable file.</li>
            </ol>
            <h3 className="text-foreground font-bold text-lg mt-8">What to do if download fails</h3>
            <p>If this free helper cannot extract your Instagram link, it usually means the public extraction service is unavailable or Instagram blocked that request. You can still try:</p>
            <ul>
              <li><strong>Use Instagram&apos;s own save option:</strong> Open the Reel or post, tap Share, then Save when available.</li>
              <li><strong>Check the link:</strong> Make sure the account is public, the post is still online, and the link format is correct (/reel/, /p/, /tv/).</li>
              <li><strong>Try later:</strong> Free extraction services often recover after rate limits or temporary outages.</li>
            </ul>
            <div className="bg-secondary/30 rounded-2xl p-6 mt-10">
              <h3 className="text-foreground font-bold text-lg mb-4 mt-0">More Instagram Creator Tools</h3>
              <ul className="grid sm:grid-cols-2 gap-4 list-none p-0 m-0">
                <li><Link href="/tools/instagram-bio-generator" className="text-primary font-bold hover:underline">Instagram Bio Generator →</Link></li>
                <li><Link href="/tools/best-time-to-post-instagram-reels" className="text-primary font-bold hover:underline">Best Time to Post Reels →</Link></li>
                <li><Link href="/tools/instagram-reels-size-calculator" className="text-primary font-bold hover:underline">Reels Size Calculator →</Link></li>
                <li><Link href="/tools/hashtag-generator" className="text-primary font-bold hover:underline">Viral Hashtag Generator →</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
