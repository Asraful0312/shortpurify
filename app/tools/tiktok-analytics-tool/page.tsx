"use client";

import { useMemo, useState } from "react";
import { BarChart3, Heart, MessageCircle, Share2, TrendingUp, Users } from "lucide-react";
import ToolsBreadcrumb from "@/components/tools-breadcrumb";
import ToolsCta from "@/components/tools-cta";

function toNumber(value: string): number {
  const n = Number(value.replace(/,/g, ""));
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

type Mode = "views" | "followers";

function rateLabel(rate: number, mode: Mode): { label: string; color: string } {
  const thresholds = mode === "views"
    ? [10, 6, 3]
    : [8, 4, 2];
  if (rate >= thresholds[0]) return { label: "Excellent", color: "text-emerald-700" };
  if (rate >= thresholds[1]) return { label: "Good", color: "text-blue-700" };
  if (rate >= thresholds[2]) return { label: "Average", color: "text-amber-700" };
  return { label: "Below average", color: "text-red-700" };
}

export default function TikTokAnalyticsTool() {
  const [mode, setMode] = useState<Mode>("views");
  const [views, setViews] = useState("10000");
  const [followers, setFollowers] = useState("5000");
  const [likes, setLikes] = useState("800");
  const [comments, setComments] = useState("40");
  const [shares, setShares] = useState("60");

  const stats = useMemo(() => {
    const v = toNumber(views);
    const f = toNumber(followers);
    const l = toNumber(likes);
    const c = toNumber(comments);
    const s = toNumber(shares);
    const denominator = mode === "views" ? v : f;
    const engagementRate = denominator > 0 ? ((l + c + s) / denominator) * 100 : 0;
    const likeRate = denominator > 0 ? (l / denominator) * 100 : 0;
    const commentRate = denominator > 0 ? (c / denominator) * 100 : 0;
    const shareRate = denominator > 0 ? (s / denominator) * 100 : 0;
    return { engagementRate, likeRate, commentRate, shareRate, denominator };
  }, [mode, views, followers, likes, comments, shares]);

  const rating = rateLabel(stats.engagementRate, mode);

  return (
    <main className="max-w-3xl mx-auto px-4 py-14">
      <ToolsBreadcrumb toolName="TikTok Analytics Tool" toolHref="/tools/tiktok-analytics-tool" />

      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-pink-50 text-pink-600 border border-pink-100 px-3 py-1 rounded-full text-xs font-semibold mb-4">
          {/* eslint-disable-next-line @next/next-image */}
          <img src="/icons/tik-tok.png" alt="TikTok" className="w-3.5 h-3.5 object-contain" /> Free Tool
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-3">TikTok Analytics Tool</h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Calculate your TikTok engagement rate from a video&apos;s stats and see how it compares to industry benchmarks.
        </p>
      </div>

      <div className="bg-white border border-border rounded-3xl p-6 shadow-sm mb-8">
        <div className="flex bg-secondary/50 p-1 rounded-2xl w-full max-w-md mx-auto mb-6">
          <button
            onClick={() => setMode("views")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${mode === "views" ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            <BarChart3 size={16} /> By Views
          </button>
          <button
            onClick={() => setMode("followers")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${mode === "followers" ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Users size={16} /> By Followers
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1.5">
              {mode === "views" ? "Video views" : "Total followers"}
            </label>
            <input
              value={mode === "views" ? views : followers}
              onChange={(e) => (mode === "views" ? setViews(e.target.value) : setFollowers(e.target.value))}
              inputMode="numeric"
              className="w-full border border-border rounded-xl px-4 py-3 bg-secondary/30 focus:outline-none focus:ring-2 focus:ring-pink-200"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1.5 flex items-center gap-1"><Heart size={12} /> Likes</label>
            <input value={likes} onChange={(e) => setLikes(e.target.value)} inputMode="numeric" className="w-full border border-border rounded-xl px-4 py-3 bg-secondary/30 focus:outline-none focus:ring-2 focus:ring-pink-200" />
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1.5 flex items-center gap-1"><MessageCircle size={12} /> Comments</label>
            <input value={comments} onChange={(e) => setComments(e.target.value)} inputMode="numeric" className="w-full border border-border rounded-xl px-4 py-3 bg-secondary/30 focus:outline-none focus:ring-2 focus:ring-pink-200" />
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1.5 flex items-center gap-1"><Share2 size={12} /> Shares</label>
            <input value={shares} onChange={(e) => setShares(e.target.value)} inputMode="numeric" className="w-full border border-border rounded-xl px-4 py-3 bg-secondary/30 focus:outline-none focus:ring-2 focus:ring-pink-200" />
          </div>
        </div>

        <div className="bg-pink-50 border border-pink-100 rounded-2xl p-5 mb-4">
          <p className="text-xs font-bold uppercase tracking-widest text-pink-600/70 mb-1 flex items-center gap-1.5"><TrendingUp size={13} /> Engagement rate (by {mode})</p>
          <p className="text-4xl font-black text-pink-700">{stats.engagementRate.toFixed(2)}%</p>
          <p className={`text-sm font-bold mt-1 ${rating.color}`}>{rating.label}</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-secondary/30 rounded-xl p-3 text-center">
            <p className="text-xs font-bold text-muted-foreground">Like rate</p>
            <p className="text-lg font-black">{stats.likeRate.toFixed(2)}%</p>
          </div>
          <div className="bg-secondary/30 rounded-xl p-3 text-center">
            <p className="text-xs font-bold text-muted-foreground">Comment rate</p>
            <p className="text-lg font-black">{stats.commentRate.toFixed(2)}%</p>
          </div>
          <div className="bg-secondary/30 rounded-xl p-3 text-center">
            <p className="text-xs font-bold text-muted-foreground">Share rate</p>
            <p className="text-lg font-black">{stats.shareRate.toFixed(2)}%</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-border rounded-2xl p-5 shadow-sm mb-8">
        <h2 className="font-extrabold mb-2">Rough benchmark guide</h2>
        <p className="text-sm text-muted-foreground">
          These are general industry rules of thumb, not official TikTok figures — actual benchmarks vary a lot by niche and account size.
          {" "}{mode === "views"
            ? "By views: 10%+ excellent, 6-10% good, 3-6% average, under 3% below average."
            : "By followers: 8%+ excellent, 4-8% good, 2-4% average, under 2% below average."}
        </p>
      </div>

      <ToolsCta
        headerText="Want your next video to hit those numbers?"
        subText="ShortPurify turns long videos into short, high-retention TikTok clips with AI captions and smart crop, built to maximize watch time and shares."
      />
    </main>
  );
}
