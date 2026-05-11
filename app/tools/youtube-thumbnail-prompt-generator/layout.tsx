import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "YouTube Thumbnail Prompt Generator | Free AI Tool",
  description: "Generate optimized AI image prompts for YouTube thumbnails instantly. Get Midjourney, DALL-E 3, and Stable Diffusion prompts tailored to your video topic. Free, no sign-up.",
  keywords: [
    "YouTube thumbnail prompt generator",
    "AI YouTube thumbnail",
    "Midjourney YouTube thumbnail prompt",
    "DALL-E thumbnail prompt",
    "YouTube thumbnail generator",
    "AI thumbnail prompt",
    "YouTube thumbnail ideas",
    "thumbnail prompt generator",
  ],
  alternates: { canonical: "https://shortpurify.com/tools/youtube-thumbnail-prompt-generator" },
  openGraph: {
    title: "YouTube Thumbnail Prompt Generator | Free AI Tool",
    description: "Generate optimized AI image prompts for YouTube thumbnails. Get Midjourney, DALL-E 3, and Stable Diffusion prompts for your video. Free, no sign-up.",
    url: "https://shortpurify.com/tools/youtube-thumbnail-prompt-generator",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "YouTube Thumbnail Prompt Generator | Free AI Tool",
    description: "Generate optimized AI image prompts for YouTube thumbnails. Get Midjourney, DALL-E 3, and Stable Diffusion prompts for your video. Free, no sign-up.",
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
            "name": "YouTube Thumbnail Prompt Generator",
            "url": "https://shortpurify.com/tools/youtube-thumbnail-prompt-generator",
            "description": "Generate optimized AI image prompts for YouTube thumbnails instantly. Get Midjourney, DALL-E 3, and Stable Diffusion prompts tailored to your video topic.",
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
          __html: JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"What is the best AI tool for YouTube thumbnails?","acceptedAnswer":{"@type":"Answer","text":"Midjourney produces the most cinematic, high-quality thumbnails with exceptional lighting. DALL-E 3 (via ChatGPT) follows detailed instructions more reliably and is accessible without a subscription. Stable Diffusion via ComfyUI offers the most control for advanced users. Leonardo.ai has a generous free tier."}},{"@type":"Question","name":"What size should a YouTube thumbnail be?","acceptedAnswer":{"@type":"Answer","text":"YouTube thumbnails should be 1280 x 720 pixels (16:9 aspect ratio). The maximum file size is 2MB. Use JPEG, PNG, GIF, or BMP format. YouTube displays thumbnails at 320x180px in search results, so text must be large enough to read at that size."}},{"@type":"Question","name":"What makes a YouTube thumbnail get more clicks?","acceptedAnswer":{"@type":"Answer","text":"High-CTR thumbnails use: bold contrasting colors (especially red, yellow, and bright blue), an expressive human face showing emotion, minimal text (3–4 words maximum, large font), a clear single focal point, and high contrast against YouTube's white background. Avoid clutter and small text."}},{"@type":"Question","name":"How do I write a Midjourney prompt for YouTube thumbnails?","acceptedAnswer":{"@type":"Answer","text":"Effective Midjourney prompts for thumbnails include: the main subject and expression ('shocked person looking at camera'), visual style ('cinematic, dramatic lighting'), color palette ('bright red and yellow background'), composition ('rule of thirds, close-up face'), quality flags ('--ar 16:9 --q 2 --v 6'). Use our generator to get optimized prompts automatically."}},{"@type":"Question","name":"Does a better thumbnail increase YouTube views?","acceptedAnswer":{"@type":"Answer","text":"Yes. Thumbnails directly affect click-through rate (CTR), which is one of YouTube's most important ranking signals. Improving CTR from 3% to 6% can double your video's traffic from the same impressions. YouTube's A/B testing tool (for eligible channels) lets you test multiple thumbnails to find the best performer."}}]}),
        }}
      />
      <div className="min-h-screen bg-[#FAFAF8]">
        {children}
        <div className="max-w-3xl mx-auto px-4 pb-14">
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <h2 className="text-foreground font-extrabold text-xl">How to create the perfect YouTube thumbnail with AI</h2>
            <p>A great YouTube thumbnail is responsible for up to 90% of your click-through rate. AI image generators like Midjourney and DALL·E 3 can create professional thumbnails in seconds but only if you give them the right prompt.</p>
            <h3 className="text-foreground font-bold">What makes a high-CTR YouTube thumbnail?</h3>
            <ul>
              <li><strong>Bold contrast</strong> use colors that pop against YouTube&apos;s white background (red, yellow, bright blue)</li>
              <li><strong>Expressive face</strong> thumbnails with a surprised or excited face get significantly more clicks</li>
              <li><strong>Minimal text</strong> 3-4 words maximum, large enough to read on mobile</li>
              <li><strong>Clear focal point</strong> one main subject, no clutter</li>
              <li><strong>16:9 ratio</strong> always design at 1280×720 pixels</li>
            </ul>
            <h3 className="text-foreground font-bold">Midjourney vs DALL·E 3 for YouTube thumbnails</h3>
            <p>Midjourney produces more cinematic, stylized results and handles lighting exceptionally well. DALL·E 3 (via ChatGPT) is better at following detailed text instructions and is more accessible without a subscription. Stable Diffusion gives you the most control via tools like ComfyUI, and Leonardo.ai offers a free tier with good quality.</p>
            <h3 className="text-foreground font-bold">Other free tools you might like</h3>
            <ul>
              <li><Link href="/tools/youtube-shorts-title-generator" className="text-primary underline">YouTube Shorts Title Generator</Link> 10 click-worthy titles instantly</li>
              <li><Link href="/tools/hashtag-generator" className="text-primary underline">Hashtag Generator</Link> Instagram, TikTok &amp; YouTube hashtags</li>
              <li><Link href="/tools/tiktok-caption-generator" className="text-primary underline">TikTok Caption Generator</Link> viral captions + hashtags</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
