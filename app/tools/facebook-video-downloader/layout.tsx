import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

// Hidden pending AdSense review — downloader tools can trigger rejection.
// Flip this back to true (and remove the notFound() guard below) once the
// application is approved or rejected. Backend actions are untouched.
const TOOL_LIVE = false;

export const metadata: Metadata = {
  ...(TOOL_LIVE ? {} : { robots: { index: false, follow: false } }),
  title: "Free Facebook Video Download Helper | Best-Effort Tool",
  description: "Try a free best-effort Facebook video download helper. Paste a public Facebook video, Reel, or Watch link and get fallback steps if public extraction services are unavailable.",
  keywords: [
    "facebook video downloader",
    "download facebook video",
    "facebook download",
    "download facebook",
    "facebook video download",
    "free facebook video downloader",
    "facebook reel downloader",
    "facebook watch downloader",
    "save facebook video",
    "how to download facebook video free",
    "facebook downloader ios",
    "facebook downloader android",
  ],
  alternates: { canonical: "https://shortpurify.com/tools/facebook-video-downloader" },
  openGraph: {
    title: "Free Facebook Video Download Helper | Best-Effort Tool",
    description: "Try a free best-effort Facebook video download helper with clear fallback steps.",
    url: "https://shortpurify.com/tools/facebook-video-downloader",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Facebook Video Download Helper | Best-Effort Tool",
    description: "Try a free best-effort Facebook video download helper with clear fallback steps.",
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
            "name": "Facebook Video Download Helper",
            "url": "https://shortpurify.com/tools/facebook-video-downloader",
            "description": "Try a free best-effort Facebook video download helper with clear fallback steps.",
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
          __html: JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"How do I download a Facebook video?","acceptedAnswer":{"@type":"Answer","text":"To download a Facebook video: 1) Open the video, Reel, or Watch post and copy its link from the Share menu. 2) Paste it into a Facebook downloader tool. 3) Download the MP4 file. Note that availability depends on whether the post is public and whether public extraction services are currently working."}},{"@type":"Question","name":"Is it legal to download Facebook videos?","acceptedAnswer":{"@type":"Answer","text":"Downloading Facebook videos for personal viewing is generally permitted. Reposting downloaded content without credit or permission from the creator may violate copyright and Facebook's terms of service. Always credit original creators if you share their content."}},{"@type":"Question","name":"Why can't I download some Facebook videos?","acceptedAnswer":{"@type":"Answer","text":"Some Facebook videos cannot be downloaded because: the post is private or restricted to friends, the video has been deleted, the content contains licensed music that restricts downloading, or the extraction service is temporarily rate-limited by Facebook."}},{"@type":"Question","name":"What format are Facebook video downloads?","acceptedAnswer":{"@type":"Answer","text":"Facebook video and Reel downloads are MP4 files. Reels are in 9:16 vertical format; regular videos and Watch posts vary by original aspect ratio."}}]}),
        }}
      />
      <div className="min-h-screen bg-[#FAFAF8]">
        {children}
        <div className="max-w-3xl mx-auto px-4 pb-14">
          <div className="prose prose-sm max-w-none text-muted-foreground border-t border-border pt-12">
            <h2 className="text-foreground font-extrabold text-2xl">How to try downloading a Facebook video</h2>
            <p>Facebook download tools can be unreliable because public extraction services go offline, get rate-limited, or lose support after Facebook changes. This helper is free and best-effort: it works when the link is public and an available extractor can process it.</p>
            <h3 className="text-foreground font-bold text-lg mt-8">Simple steps to save Facebook videos to MP4:</h3>
            <ol>
              <li><strong>Copy Link:</strong> Find the video, Reel, or Watch post you want to download, click the &quot;Share&quot; button, and select &quot;Copy Link&quot;.</li>
              <li><strong>Paste URL:</strong> Open ShortPurify&apos;s Facebook Downloader and paste the link into the input box above.</li>
              <li><strong>Try Download:</strong> Click the button. If a free extractor can process the link, you&apos;ll get a downloadable file.</li>
            </ol>
            <h3 className="text-foreground font-bold text-lg mt-8">What to do if download fails</h3>
            <p>If this free helper cannot extract your Facebook link, it usually means the public extraction service is unavailable or the post is private. You can still try:</p>
            <ul>
              <li><strong>Use Facebook&apos;s own save option:</strong> Open the video, tap Share, then Save video when available.</li>
              <li><strong>Check the link:</strong> Make sure the post is public, still online, and not restricted.</li>
              <li><strong>Try later:</strong> Free extraction services often recover after rate limits or temporary outages.</li>
            </ul>
            <div className="bg-secondary/30 rounded-2xl p-6 mt-10">
              <h3 className="text-foreground font-bold text-lg mb-4 mt-0">More Free Creator Tools</h3>
              <ul className="grid sm:grid-cols-2 gap-4 list-none p-0 m-0">
                <li><Link href="/tools/video-trimmer" className="text-primary font-bold hover:underline">Video Trimmer →</Link></li>
                <li><Link href="/tools/video-subtitle-generator" className="text-primary font-bold hover:underline">Video Subtitle Generator →</Link></li>
                <li><Link href="/tools/instagram-video-downloader" className="text-primary font-bold hover:underline">Instagram Video Downloader →</Link></li>
                <li><Link href="/tools/hashtag-generator" className="text-primary font-bold hover:underline">Viral Hashtag Generator →</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
