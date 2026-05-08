import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How to See Recently Watched Reels on Instagram | Free Guide",
  description: "Learn how to find recently watched Reels, liked Reels, pause Instagram Reels, and manage Reels history with this free Instagram guide.",
  keywords: [
    "how to see recently watched reels on instagram",
    "how to see your liked reels on instagram",
    "how to pause instagram reels",
    "can you disable reels on instagram",
    "instagram reels history",
    "instagram reels not working",
  ],
  alternates: { canonical: "https://shortpurify.com/tools/instagram-reels-history-finder" },
  openGraph: {
    title: "How to See Recently Watched Reels on Instagram | Free Guide",
    description: "Find recently watched Reels, liked Reels, and Reels controls on Instagram.",
    url: "https://shortpurify.com/tools/instagram-reels-history-finder",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "How to See Recently Watched Reels on Instagram | Free Guide",
    description: "Find recently watched Reels, liked Reels, and Reels controls on Instagram.",
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
            "@type": "HowTo",
            "name": "How to See Recently Watched Reels on Instagram",
            "description": "Learn how to find recently watched Reels, liked Reels, and Reels controls on Instagram.",
            "totalTime": "PT2M",
            "step": [
              { "@type": "HowToStep", "name": "Check liked Reels", "text": "Open Your activity, then Interactions, then Likes." },
              { "@type": "HowToStep", "name": "Check saved Reels", "text": "Open your profile menu, then Saved, then Reels or All posts." },
              { "@type": "HowToStep", "name": "Use search and activity clues", "text": "Search the creator, audio, hashtag, or caption keywords you remember." }
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
