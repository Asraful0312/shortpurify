import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "YouTube Keyword Tool | Free AI Keyword Research",
  description: "Generate a primary keyword, video tags, and real search phrases for your YouTube video instantly with AI. Free, no sign-up required.",
  keywords: [
    "youtube keyword tool",
    "keyword tool youtube",
    "youtube seo tool",
    "tool seo youtube",
    "youtube research tool",
    "youtube tag generator",
    "keyword discovery tool",
    "youtube keyword research",
    "what is keyword research tool",
    "free youtube keyword tool",
    "youtube video tags generator",
  ],
  alternates: { canonical: "https://shortpurify.com/tools/youtube-keyword-tool" },
  openGraph: {
    title: "YouTube Keyword Tool | Free AI Keyword Research",
    description: "Generate a primary keyword, video tags, and real search phrases for your YouTube video instantly with AI.",
    url: "https://shortpurify.com/tools/youtube-keyword-tool",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "YouTube Keyword Tool | Free AI Keyword Research",
    description: "Generate a primary keyword, video tags, and real search phrases for your YouTube video instantly with AI.",
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
            "name": "YouTube Keyword Tool",
            "url": "https://shortpurify.com/tools/youtube-keyword-tool",
            "description": "Generate a primary keyword, video tags, and real search phrases for your YouTube video instantly with AI.",
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
          __html: JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"What is a YouTube keyword tool used for?","acceptedAnswer":{"@type":"Answer","text":"A YouTube keyword tool helps you find the words and phrases viewers actually search for, so you can use them in your video's title, tags, and description. This makes your video easier for YouTube's algorithm and search to match with people looking for that content."}},{"@type":"Question","name":"Where do I put YouTube keywords once I have them?","acceptedAnswer":{"@type":"Answer","text":"Use your primary keyword in the video title and the first line of the description. Add the tags in YouTube Studio's tags field when uploading. Work the description keywords naturally into your full description text — avoid keyword stuffing."}},{"@type":"Question","name":"How many tags should a YouTube video have?","acceptedAnswer":{"@type":"Answer","text":"YouTube allows up to 500 characters of tags total. 15-20 well-chosen, relevant tags is typically enough — mixing broad terms with more specific long-tail phrases covers more search variations without diluting relevance."}},{"@type":"Question","name":"Do YouTube tags still matter for SEO?","acceptedAnswer":{"@type":"Answer","text":"Tags carry less weight than they used to, but they still help YouTube understand context, especially for misspellings or closely related topics. Title, thumbnail, and description keywords matter more, but tags are still a free, easy addition worth doing."}}]}),
        }}
      />
      <div className="min-h-screen bg-[#FAFAF8]">
        {children}
        <div className="max-w-3xl mx-auto px-4 pb-14">
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <h2 className="text-foreground font-extrabold text-xl">How to do YouTube keyword research for free</h2>
            <p>Describe your video topic, and this tool generates a primary keyword to build your title around, a set of tags for YouTube Studio, real search phrases viewers type in, and supporting keywords for your description — all in one pass.</p>
            <h3 className="text-foreground font-bold">Where each keyword type goes</h3>
            <ul>
              <li><strong>Primary keyword:</strong> your video title and the opening line of your description</li>
              <li><strong>Tags:</strong> the tags field in YouTube Studio when you upload</li>
              <li><strong>Search queries:</strong> use these to sanity-check your title matches how people actually search</li>
              <li><strong>Description keywords:</strong> weave these naturally into your full video description</li>
            </ul>
            <h3 className="text-foreground font-bold">Other free tools you might like</h3>
            <ul>
              <li><Link href="/tools/youtube-shorts-title-generator" className="text-primary">YouTube Shorts Title Generator</Link> — 10 click-worthy titles instantly</li>
              <li><Link href="/tools/hashtag-generator" className="text-primary">Hashtag Generator</Link> — hashtags for Instagram, TikTok, and YouTube Shorts</li>
              <li><Link href="/tools/youtube-shorts-script-generator" className="text-primary">YouTube Shorts Script Generator</Link> — full hook-body-CTA script</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
