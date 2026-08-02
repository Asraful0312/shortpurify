import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Free Video Trimmer | Cut Video Online, No Upload",
  description: "Trim or cut any video online for free. Runs entirely in your browser — no upload, no watermark, no sign-up. Works with MP4, MOV, and WebM.",
  keywords: [
    "video trimmer",
    "trim video online",
    "cut video online",
    "free video trimmer",
    "video cutter online free",
    "how to trim a video",
    "trim video without watermark",
    "mp4 trimmer",
    "video trimmer no upload",
    "cut video without downloading software",
  ],
  alternates: { canonical: "https://shortpurify.com/tools/video-trimmer" },
  openGraph: {
    title: "Free Video Trimmer | Cut Video Online, No Upload",
    description: "Trim or cut any video online for free, right in your browser. No upload, no watermark, no sign-up.",
    url: "https://shortpurify.com/tools/video-trimmer",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Video Trimmer | Cut Video Online, No Upload",
    description: "Trim or cut any video online for free, right in your browser. No upload, no watermark, no sign-up.",
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
            "name": "Video Trimmer",
            "url": "https://shortpurify.com/tools/video-trimmer",
            "description": "Trim or cut any video online for free, right in your browser. No upload, no watermark, no sign-up.",
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
          __html: JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"How do I trim a video for free without watermarks?","acceptedAnswer":{"@type":"Answer","text":"Choose a video file, drag the start and end sliders to your desired clip, and click Trim Video. This tool processes your video locally in your browser using WebAssembly, so there's no upload, no watermark, and no account required."}},{"@type":"Question","name":"Is my video uploaded to a server when I trim it?","acceptedAnswer":{"@type":"Answer","text":"No. This trimmer runs entirely client-side using ffmpeg.wasm, a WebAssembly build of FFmpeg. Your video file never leaves your device — trimming happens locally in your browser tab."}},{"@type":"Question","name":"Are the cuts frame-accurate?","acceptedAnswer":{"@type":"Answer","text":"Yes. This tool re-encodes the selected range instead of copying the raw video stream, so the trimmed clip starts and ends exactly where you set the sliders. Re-encoding takes a little longer than a raw copy, but avoids corrupted or misaligned output."}},{"@type":"Question","name":"What video formats does this trimmer support?","acceptedAnswer":{"@type":"Answer","text":"This tool accepts MP4, MOV, WebM, and most common video formats, and exports the trimmed clip as an MP4 file."}}]}),
        }}
      />
      <div className="min-h-screen bg-[#FAFAF8]">
        {children}
        <div className="max-w-3xl mx-auto px-4 pb-14">
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <h2 className="text-foreground font-extrabold text-xl">How to trim a video online for free</h2>
            <p>Upload a video, drag the start and end handles to select the part you want, and click Trim Video. Everything runs locally in your browser — no software to install, no watermark, and nothing gets uploaded to a server.</p>
            <h3 className="text-foreground font-bold">Why trim in the browser instead of an app?</h3>
            <p>Browser-based trimming using WebAssembly means your original video stays private on your device, there&apos;s no waiting for uploads or downloads to a remote server, and no account or software installation is required.</p>
            <h3 className="text-foreground font-bold">Other free tools you might like</h3>
            <ul>
              <li><Link href="/tools/video-to-gif-converter" className="text-primary">Video to GIF Converter</Link> — turn a clip into a shareable GIF</li>
              <li><Link href="/tools/video-aspect-ratio-calculator" className="text-primary">Video Aspect Ratio Calculator</Link> — find the right size for every platform</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
