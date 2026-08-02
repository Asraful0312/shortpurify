import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Free Video to GIF Converter | No Upload, No Watermark",
  description: "Convert any video clip to a GIF for free, right in your browser. No upload, no watermark, no sign-up. Control frame rate, size, and clip length.",
  keywords: [
    "video to gif converter",
    "convert video to gif",
    "video to gif online free",
    "mp4 to gif",
    "gif maker from video",
    "how to make a gif from video",
    "free gif converter",
    "gif converter no watermark",
    "video to gif no upload",
  ],
  alternates: { canonical: "https://shortpurify.com/tools/video-to-gif-converter" },
  openGraph: {
    title: "Free Video to GIF Converter | No Upload, No Watermark",
    description: "Convert any video clip to a GIF for free, right in your browser. No upload, no watermark, no sign-up.",
    url: "https://shortpurify.com/tools/video-to-gif-converter",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Video to GIF Converter | No Upload, No Watermark",
    description: "Convert any video clip to a GIF for free, right in your browser. No upload, no watermark, no sign-up.",
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
            "name": "Video to GIF Converter",
            "url": "https://shortpurify.com/tools/video-to-gif-converter",
            "description": "Convert any video clip to a GIF for free, right in your browser. No upload, no watermark, no sign-up.",
            "applicationCategory": "MultimediaApplication",
            "operatingSystem": "Web",
            "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
            "creator": { "@type": "Organization", "name": "ShortPurify", "url": "https://shortpurify.com" },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"How do I make a GIF from a video for free?","acceptedAnswer":{"@type":"Answer","text":"Choose a video file, pick the start point and clip length (up to 10 seconds), choose a frame rate and width, then click Convert to GIF. This tool processes your video locally in your browser, so there's no upload, no watermark, and no account required."}},{"@type":"Question","name":"Why is my GIF clip limited to 10 seconds?","acceptedAnswer":{"@type":"Answer","text":"GIFs grow quickly in file size because every frame is stored as a full image. Limiting clips to 10 seconds keeps the output small enough to share on social media, chat apps, and email without hitting upload limits."}},{"@type":"Question","name":"What frame rate should I use for a GIF?","acceptedAnswer":{"@type":"Answer","text":"10 fps is a good default — smooth enough for most motion while keeping file size reasonable. Use 5 fps for the smallest possible file, or 15 fps for smoother motion at a larger file size."}},{"@type":"Question","name":"Is my video uploaded to a server when I convert it to GIF?","acceptedAnswer":{"@type":"Answer","text":"No. This converter runs entirely client-side using ffmpeg.wasm, a WebAssembly build of FFmpeg. Your video file never leaves your device."}}]}),
        }}
      />
      <div className="min-h-screen bg-[#FAFAF8]">
        {children}
        <div className="max-w-3xl mx-auto px-4 pb-14">
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <h2 className="text-foreground font-extrabold text-xl">How to convert a video to GIF for free</h2>
            <p>Upload a video, pick the start point and how long the clip should be (up to 10 seconds), choose a frame rate and width, then click Convert to GIF. Everything runs locally in your browser — no watermark, no software to install, and nothing gets uploaded to a server.</p>
            <h3 className="text-foreground font-bold">Tips for smaller, better-looking GIFs</h3>
            <ul>
              <li>Keep clips short — under 5 seconds usually looks best and loads instantly when shared</li>
              <li>Lower the frame rate (5-10 fps) for chat apps and messaging where file size matters</li>
              <li>Use a smaller width (320-480px) if the GIF will be viewed on mobile</li>
            </ul>
            <h3 className="text-foreground font-bold">Other free tools you might like</h3>
            <ul>
              <li><Link href="/tools/video-trimmer" className="text-primary">Video Trimmer</Link> — cut a video before converting it</li>
              <li><Link href="/tools/video-aspect-ratio-calculator" className="text-primary">Video Aspect Ratio Calculator</Link> — find the right size for every platform</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
