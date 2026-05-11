import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Free TikTok Video Download Helper | Best-Effort Tool",
  description: "Try a free best-effort TikTok video download helper. Paste a public TikTok link and get fallback steps if public extraction services are unavailable.",
  keywords: [
    "tiktok downloader",
    "tiktok video downloader",
    "tiktok no watermark",
    "download tiktok mp4",
    "free tiktok downloader",
    "tiktok to mp4",
    "save tiktok video",
    "tiktok download helper",
  ],
  alternates: { canonical: "https://shortpurify.com/tools/tiktok-video-downloader" },
  openGraph: {
    title: "Free TikTok Video Download Helper | Best-Effort Tool",
    description: "Try a free best-effort TikTok video download helper with clear fallback steps.",
    url: "https://shortpurify.com/tools/tiktok-video-downloader",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free TikTok Video Download Helper | Best-Effort Tool",
    description: "Try a free best-effort TikTok video download helper with clear fallback steps.",
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
            "name": "TikTok Video Download Helper",
            "url": "https://shortpurify.com/tools/tiktok-video-downloader",
            "description": "Try a free best-effort TikTok video download helper with clear fallback steps.",
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
          __html: JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"How do I download a TikTok video without watermark?","acceptedAnswer":{"@type":"Answer","text":"To download a TikTok video without a watermark: 1) Copy the TikTok video link from the Share menu. 2) Paste it into a TikTok downloader tool. 3) Download the MP4 file. Note that availability depends on whether the creator has enabled downloads and whether public extraction services are currently working."}},{"@type":"Question","name":"Is it legal to download TikTok videos?","acceptedAnswer":{"@type":"Answer","text":"Downloading TikTok videos for personal viewing is generally permitted. Reposting downloaded content without credit or permission from the creator may violate copyright and TikTok's terms of service. Always credit original creators if you share their content."}},{"@type":"Question","name":"Why can't I download some TikTok videos?","acceptedAnswer":{"@type":"Answer","text":"Some TikTok videos cannot be downloaded because: the creator disabled the download option in their privacy settings, the video contains licensed music that restricts downloading, the video is from a private account, or the extraction service is temporarily rate-limited by TikTok."}},{"@type":"Question","name":"What format are TikTok video downloads?","acceptedAnswer":{"@type":"Answer","text":"TikTok videos download as MP4 files. The video is in 9:16 vertical format, typically at 720p or 1080p resolution. Without a watermark, you get the clean video file without the TikTok username overlay."}}]}),
        }}
      />
      <div className="min-h-screen bg-[#FAFAF8]">
        {children}
        <div className="max-w-3xl mx-auto px-4 pb-14">
          <div className="prose prose-sm max-w-none text-muted-foreground border-t border-border pt-12">
            <h2 className="text-foreground font-extrabold text-2xl">How to try downloading a TikTok video</h2>
            <p>TikTok download tools can be unreliable because public extraction services go offline, get rate-limited, or lose support for TikTok changes. This helper is free and best-effort: it works when the link is public and an available extractor can process it.</p>
            <h3 className="text-foreground font-bold text-lg mt-8">Simple steps to save TikTok videos to MP4:</h3>
            <ol>
              <li><strong>Copy Link:</strong> Find the TikTok video you want to download, click the &quot;Share&quot; button, and select &quot;Copy Link&quot;.</li>
              <li><strong>Paste URL:</strong> Open ShortPurify&apos;s TikTok Downloader and paste the link into the input box above.</li>
              <li><strong>Try Download:</strong> Click the button. If a free extractor can process the link, you&apos;ll get a downloadable file.</li>
            </ol>
            <h3 className="text-foreground font-bold text-lg mt-8">What to do if download fails</h3>
            <p>If this free helper cannot extract your TikTok link, it usually means the public extraction service is unavailable or TikTok blocked that request. You can still try:</p>
            <ul>
              <li><strong>Use TikTok&apos;s own save option:</strong> Open the video, tap Share, then Save video when available.</li>
              <li><strong>Check the link:</strong> Make sure the video is public, still online, and not region-blocked.</li>
              <li><strong>Try later:</strong> Free extraction services often recover after rate limits or temporary outages.</li>
            </ul>
            <div className="bg-secondary/30 rounded-2xl p-6 mt-10">
              <h3 className="text-foreground font-bold text-lg mb-4 mt-0">More Viral Creator Tools</h3>
              <ul className="grid sm:grid-cols-2 gap-4 list-none p-0 m-0">
                <li><Link href="/tools/tiktok-caption-generator" className="text-primary font-bold hover:underline">TikTok Caption Generator →</Link></li>
                <li><Link href="/tools/best-time-to-post-on-tiktok" className="text-primary font-bold hover:underline">Best Time to Post (2025) →</Link></li>
                <li><Link href="/tools/hashtag-generator" className="text-primary font-bold hover:underline">Viral Hashtag Generator →</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
