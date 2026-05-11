import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "YouTube Shorts Title Length Checker | Free Counter",
  description: "Check YouTube Shorts title length, character count, word count, and mobile readability before publishing.",
  keywords: [
    "youtube shorts title length checker",
    "youtube shorts title counter",
    "youtube title length checker",
    "youtube shorts title character limit",
    "shorts title checker",
  ],
  alternates: { canonical: "https://shortpurify.com/tools/youtube-shorts-title-length-checker" },
  openGraph: {
    title: "YouTube Shorts Title Length Checker | Free Counter",
    description: "Check YouTube Shorts title length, character count, word count, and mobile readability.",
    url: "https://shortpurify.com/tools/youtube-shorts-title-length-checker",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "YouTube Shorts Title Length Checker | Free Counter",
    description: "Check YouTube Shorts title length, character count, word count, and mobile readability.",
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
            "name": "YouTube Shorts Title Length Checker",
            "url": "https://shortpurify.com/tools/youtube-shorts-title-length-checker",
            "description": "Check YouTube Shorts title length, character count, word count, and mobile readability.",
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
          __html: JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"What is the YouTube Shorts title character limit?","acceptedAnswer":{"@type":"Answer","text":"YouTube allows up to 100 characters for video titles. For Shorts specifically, keep titles under 60 characters so they display fully on mobile without being cut off. The first 40–60 characters are the most visible in the Shorts feed."}},{"@type":"Question","name":"Do longer YouTube titles get fewer views?","acceptedAnswer":{"@type":"Answer","text":"Not necessarily, but truncated titles hurt click-through rate. If your title is cut off on mobile (where 85%+ of Shorts are watched), viewers don't get the full message. Keep Shorts titles concise and put the most compelling part in the first 50 characters."}},{"@type":"Question","name":"Where does the YouTube Shorts title appear?","acceptedAnswer":{"@type":"Answer","text":"The YouTube Shorts title appears below the video in the Shorts player, in YouTube search results, in the subscription feed, and on the video's watch page. It also appears in Google search results for video content."}},{"@type":"Question","name":"Should I include keywords in my YouTube Shorts title?","acceptedAnswer":{"@type":"Answer","text":"Yes. Keywords in your title help YouTube and Google understand what the Short is about and surface it in relevant searches. Place your main keyword in the first 3–4 words of the title for the best SEO impact."}}]}),
        }}
      />
      <div className="min-h-screen bg-[#FAFAF8]">
        {children}
        <div className="max-w-3xl mx-auto px-4 pb-14">
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <h2 className="text-foreground font-extrabold text-xl">YouTube Shorts title length</h2>
            <p>YouTube titles can be up to 100 characters, but Shorts viewers usually scan quickly on mobile. Shorter titles with the keyword near the front are easier to read.</p>
            <h3 className="text-foreground font-bold">Related tools</h3>
            <ul>
              <li><Link href="/tools/youtube-shorts-title-generator" className="text-primary">YouTube Shorts Title Generator</Link></li>
              <li><Link href="/tools/youtube-shorts-script-generator" className="text-primary">YouTube Shorts Script Generator</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
