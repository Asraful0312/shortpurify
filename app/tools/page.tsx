import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { TOOL_CATEGORIES, TOOLS } from "@/lib/tools";
import ToolsCta from "@/components/tools-cta";

export const metadata: Metadata = {
  title: "Free Video Creator Tools",
  description: "Free AI-powered tools for video creators — generate YouTube Shorts titles, write viral TikTok captions, calculate video ratios, and plan Instagram Reels.",
  keywords: ["free video tools", "YouTube Shorts tools", "TikTok tools", "Instagram Reels tools", "video creator tools", "aspect ratio calculator", "caption generator"],
  alternates: { canonical: "https://shortpurify.com/tools" },
  openGraph: {
    title: "Free Video Creator Tools – ShortPurify",
    description: "Free AI-powered tools for creators: YouTube Shorts, TikTok, Instagram Reels, hashtags, posting times, and video size calculators.",
    url: "https://shortpurify.com/tools",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Video Creator Tools – ShortPurify",
    description: "Free AI-powered tools for creators: YouTube Shorts, TikTok, Instagram Reels, hashtags, posting times, and video size calculators.",
  },
};

export default function ToolsPage() {
  const groupedTools = TOOL_CATEGORIES.map((category) => ({
    ...category,
    tools: TOOLS.filter((tool) => tool.category === category.name),
  })).filter((category) => category.tools.length > 0);

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Nav */}

      <main className="max-w-5xl mx-auto px-4 py-14">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-secondary text-muted-foreground border border-border px-3 py-1 rounded-full text-xs font-semibold mb-4">
            Free · No sign-up required
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">
            Free Video Creator Tools
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            AI-powered tools to help you create better content, faster. All free no account needed.
          </p>
        </div>

        {/* Tool cards */}
        <div className="flex flex-col gap-12 mb-14">
          {groupedTools.map((group) => (
            <section key={group.name}>
              <div className="mb-5">
                <h2 className="text-2xl font-extrabold tracking-tight">{group.title}</h2>
                <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                  {group.description}
                </p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {group.tools.map((tool) => (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className="group bg-white border border-border rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-primary/20 transition-all flex flex-col gap-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-secondary/60 flex items-center justify-center shrink-0">
                        {tool.icon}
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${tool.badgeColor}`}>
                        {tool.badge}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-extrabold text-base mb-1.5 group-hover:text-primary transition-colors">
                        {tool.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {tool.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-sm font-bold text-primary">
                      {tool.cta} <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* CTA */}
        <ToolsCta headerText="Ready to go beyond the basics?" subText=" Paste Youtube video URL, ShortPurify turns your long videos into viral short clips automatically with AI captions, smart crop, and one-click publishing to TikTok, YouTube Shorts, and Instagram Reels."/>
       
      </main>
    </div>
  );
}
