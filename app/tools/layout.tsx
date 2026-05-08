import Footer from '@/components/shared/footer';
import ToolsNavBar from '@/components/tools-nav-bar'
import { TOOLS } from '@/lib/tools';
import { Metadata } from 'next';
import { ReactNode } from 'react'

export const metadata: Metadata = {
  title: "Free Video Marketing Tools",
  description: "Free AI-powered tools for video creators — YouTube Shorts title generator, TikTok caption generator, video aspect ratio calculator, and more.",
  alternates: { canonical: "https://shortpurify.com/tools" },
  openGraph: {
    title: "Free Video Marketing Tools – ShortPurify",
    description: "Free AI-powered tools for creators: generate YouTube Shorts titles, TikTok captions, and calculate video aspect ratios instantly.",
    url: "https://shortpurify.com/tools",
  },
};



const layout = ({ children }: { children: ReactNode }) => {
  return (
    <div>
        <ToolsNavBar/>
        {children}

         {/* Schema for tools index */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              "name": "Free Video Creator Tools by ShortPurify",
              "description": "AI-powered free tools for video creators",
              "itemListElement": TOOLS.map((t, i) => ({
                "@type": "ListItem",
                "position": i + 1,
                "name": t.title,
                "url": `https://shortpurify.com${t.href}`,
              })),
            }),
          }}
        />

        <Footer/>
    </div>
  )
}

export default layout