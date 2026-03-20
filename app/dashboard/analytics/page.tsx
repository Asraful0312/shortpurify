"use client";

import { BarChart3, TrendingUp, Send, Scissors, Eye, ThumbsUp, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const PLATFORM_STATS = [
  { name: "TikTok", emoji: "🎵", clips: 14, views: "48.2K", engagement: "8.4%", color: "bg-black" },
  { name: "Instagram Reels", emoji: "📸", clips: 11, views: "31.7K", engagement: "6.1%", color: "bg-gradient-to-br from-purple-500 to-pink-500" },
  { name: "YouTube Shorts", emoji: "▶️", clips: 9, views: "22.5K", engagement: "4.8%", color: "bg-red-500" },
  { name: "LinkedIn", emoji: "💼", clips: 5, views: "8.3K", engagement: "9.2%", color: "bg-blue-600" },
];

const TOP_CLIPS = [
  { title: "The Ultimate Framework Hook", platform: "TikTok", views: "12.4K", viralScore: 98, growth: "+24%" },
  { title: "Why Most Startups Fail Early", platform: "Instagram", views: "8.9K", viralScore: 92, growth: "+18%" },
  { title: "The #1 Secret to Scaling APIs", platform: "YouTube", views: "6.2K", viralScore: 85, growth: "+11%" },
  { title: "100k Subs Q&A Highlight", platform: "TikTok", views: "5.1K", viralScore: 79, growth: "+8%" },
];

const WEEKLY_DATA = [
  { day: "Mon", clips: 3, published: 2 },
  { day: "Tue", clips: 5, published: 4 },
  { day: "Wed", clips: 2, published: 2 },
  { day: "Thu", clips: 8, published: 6 },
  { day: "Fri", clips: 6, published: 5 },
  { day: "Sat", clips: 4, published: 3 },
  { day: "Sun", clips: 1, published: 1 },
];

const maxClips = Math.max(...WEEKLY_DATA.map((d) => d.clips));

export default function AnalyticsPage() {
  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full min-h-full flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-extrabold tracking-tight">Analytics</h1>
            <Badge variant="secondary" className="text-[10px] font-extrabold uppercase tracking-widest">Phase 2</Badge>
          </div>
          <p className="text-muted-foreground">Track performance across all published clips & platforms.</p>
        </div>
        <select className="border border-border rounded-xl px-4 py-2 text-sm font-semibold bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>Last 90 days</option>
        </select>
      </div>

      {/* Overview Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Views", value: "110.7K", icon: Eye, trend: "+32%", color: "bg-primary/10 text-primary" },
          { label: "Clips Published", value: "39", icon: Send, trend: "+12", color: "bg-green-100 text-green-700" },
          { label: "Clips Generated", value: "87", icon: Scissors, trend: "+25", color: "bg-accent/15 text-accent" },
          { label: "Avg. Engagement", value: "7.1%", icon: ThumbsUp, trend: "+1.4%", color: "bg-amber-100 text-amber-600" },
        ].map(({ label, value, icon: Icon, trend, color }) => (
          <div key={label} className="bg-white border border-border rounded-2xl p-5 shadow-sm flex items-start gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
              <Icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-extrabold leading-tight">{value}</p>
              <p className="text-sm font-semibold text-foreground">{label}</p>
              <p className="text-xs text-green-600 font-bold mt-0.5 flex items-center gap-0.5">
                <ArrowUpRight size={11} /> {trend} this week
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Weekly Activity Chart */}
      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
        <h2 className="font-extrabold text-base mb-6">Weekly Activity</h2>
        <div className="flex items-end gap-3 h-40">
          {WEEKLY_DATA.map(({ day, clips, published }) => (
            <div key={day} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex flex-col gap-0.5 justify-end" style={{ height: "120px" }}>
                {/* Clips generated bar */}
                <div
                  className="w-full bg-primary/15 rounded-t-lg transition-all"
                  style={{ height: `${(clips / maxClips) * 100}px` }}
                  title={`${clips} clips generated`}
                />
                {/* Published overlay */}
                <div
                  className="w-full bg-primary rounded-t-lg -mt-1 transition-all"
                  style={{ height: `${(published / maxClips) * 100}px` }}
                  title={`${published} published`}
                />
              </div>
              <span className="text-[11px] font-bold text-muted-foreground">{day}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-4 text-xs font-semibold text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-primary/15" /> Clips Generated
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-primary" /> Published
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Platform Breakdown */}
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="font-extrabold text-base mb-5">Platform Breakdown</h2>
          <div className="flex flex-col gap-5">
            {PLATFORM_STATS.map((p) => (
              <div key={p.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{p.emoji}</span>
                    <span className="text-sm font-bold">{p.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground font-semibold">
                    <span>{p.clips} clips</span>
                    <span className="text-foreground font-bold">{p.views} views</span>
                    <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200">{p.engagement}</span>
                  </div>
                </div>
                <Progress value={(parseInt(p.views) / 50000) * 100} />
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing Clips */}
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="font-extrabold text-base mb-5">Top Clips</h2>
          <div className="flex flex-col gap-3">
            {TOP_CLIPS.map((clip, i) => (
              <div
                key={clip.title}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors"
              >
                <span className="text-sm font-extrabold text-muted-foreground w-5 text-center">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{clip.title}</p>
                  <p className="text-xs text-muted-foreground">{clip.platform}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-extrabold">{clip.views}</p>
                  <p className="text-xs text-green-600 font-bold">{clip.growth}</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-extrabold text-amber-600">{clip.viralScore}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
