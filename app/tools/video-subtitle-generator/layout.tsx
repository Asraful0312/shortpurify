import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Free AI Video Subtitle Generator | Add Captions Instantly",
  description: "Add accurate AI-generated subtitles to your video for free. Upload a clip up to 2 minutes and get an SRT and VTT caption file in seconds, no sign-up.",
  keywords: [
    "video subtitle generator",
    "how to add subtitles to video",
    "add captions to video free",
    "ai subtitle generator",
    "auto captions video",
    "free srt generator",
    "video to srt",
    "video to vtt",
    "auto generate subtitles",
    "add subtitles to video online free",
    "transcribe video to text free",
  ],
  alternates: { canonical: "https://shortpurify.com/tools/video-subtitle-generator" },
  openGraph: {
    title: "Free AI Video Subtitle Generator | Add Captions Instantly",
    description: "Add accurate AI-generated subtitles to your video for free. Upload a clip up to 2 minutes and get SRT/VTT captions in seconds.",
    url: "https://shortpurify.com/tools/video-subtitle-generator",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free AI Video Subtitle Generator | Add Captions Instantly",
    description: "Add accurate AI-generated subtitles to your video for free. Upload a clip up to 2 minutes and get SRT/VTT captions in seconds.",
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
            "name": "Video Subtitle Generator",
            "url": "https://shortpurify.com/tools/video-subtitle-generator",
            "description": "Add accurate AI-generated subtitles to your video for free. Upload a clip up to 2 minutes and get SRT/VTT captions in seconds.",
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
          __html: JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"How do I add subtitles to a video for free?","acceptedAnswer":{"@type":"Answer","text":"Upload your video or audio file, click Generate Subtitles, and wait for AI transcription to finish — usually under a minute for short clips. You'll get a downloadable SRT and VTT caption file plus the full transcript text, ready to import into any video editor or platform."}},{"@type":"Question","name":"What is the difference between SRT and VTT subtitle files?","acceptedAnswer":{"@type":"Answer","text":"SRT (SubRip) is the most widely supported subtitle format, accepted by YouTube, most video editors, and media players. VTT (WebVTT) is the web standard used by HTML5 video players and some platforms. This tool generates both so you can use whichever your platform requires."}},{"@type":"Question","name":"Why is the free subtitle generator limited to 2-minute clips?","acceptedAnswer":{"@type":"Answer","text":"AI transcription has a real processing cost, so the free tool caps clips at 2 minutes to keep it available to everyone at no charge. For longer videos, trim the clip first with our free Video Trimmer, or use ShortPurify's full product for unlimited-length transcription and auto-burned captions."}},{"@type":"Question","name":"Is my video stored after generating subtitles?","acceptedAnswer":{"@type":"Answer","text":"No. Your file is uploaded only for transcription and is permanently deleted immediately after your subtitles are generated. It is never stored, reused, or shared."}}]}),
        }}
      />
      <div className="min-h-screen bg-[#FAFAF8]">
        {children}
        <div className="max-w-3xl mx-auto px-4 pb-14">
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <h2 className="text-foreground font-extrabold text-xl">How to add subtitles to a video for free</h2>
            <p>Upload a video or audio file up to 2 minutes long, click Generate Subtitles, and AI transcription runs in the background — usually finishing in under a minute. You&apos;ll get the full transcript plus downloadable SRT and VTT files ready to import anywhere.</p>
            <h3 className="text-foreground font-bold">Where to use your subtitle file</h3>
            <ul>
              <li><strong>YouTube:</strong> Upload the .srt file directly in YouTube Studio&apos;s caption settings</li>
              <li><strong>Video editors:</strong> Most editors (Premiere, CapCut, DaVinci Resolve) import .srt files directly onto the timeline</li>
              <li><strong>Websites:</strong> Use the .vtt file with an HTML5 &lt;track&gt; element for accessible web video</li>
            </ul>
            <h3 className="text-foreground font-bold">Why add captions to your video?</h3>
            <p>Over 80% of social video is watched with sound off. Captions keep viewers watching longer, improve accessibility, and help platforms index your content for search — all of which tends to boost reach and watch time.</p>
            <h3 className="text-foreground font-bold">Other free tools you might like</h3>
            <ul>
              <li><Link href="/tools/video-trimmer" className="text-primary">Video Trimmer</Link> — cut a clip down to fit the 2-minute limit</li>
              <li><Link href="/tools/instagram-reels-caption-length-checker" className="text-primary">Instagram Reels Caption Length Checker</Link> — check caption length before posting</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
