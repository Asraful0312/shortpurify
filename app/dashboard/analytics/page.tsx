"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useWorkspace } from "@/components/workspace-context";
import { BarChart3, TrendingUp, Send, Scissors, Eye, ThumbsUp, ArrowUpRight, Star } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

const PLATFORM_META: Record<string, { label: string; color: string }> = {
  youtube:   { label: "YouTube",          color: "bg-red-500" },
  tiktok:    { label: "TikTok",           color: "bg-black" },
  instagram: { label: "Instagram",        color: "bg-gradient-to-br from-purple-500 to-pink-500" },
  x:         { label: "X / Twitter",      color: "bg-neutral-800" },
  bluesky:   { label: "Bluesky",          color: "bg-sky-500" },
  facebook:  { label: "Facebook",         color: "bg-blue-600" },
  linkedin:  { label: "LinkedIn",         color: "bg-blue-700" },
};

const PERIOD_OPTIONS = [
  { label: "Last 7 days",  days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
];

const chartConfig = {
  clipsGenerated: { label: "Clips Generated", color: "hsl(var(--chart-1))" },
  published:      { label: "Published",        color: "hsl(var(--chart-2))" },
};

export default function AnalyticsPage() {
  const [days, setDays] = useState(7);
  const { activeOrgId } = useWorkspace();
  const workspaceId = activeOrgId ?? undefined;

  const stats           = useQuery(api.analytics.getDashboardStats, { workspaceId });
  const weeklyActivity  = useQuery(api.analytics.getWeeklyActivity, { days, workspaceId });
  const platformBreak   = useQuery(api.analytics.getPublishedByPlatform, { workspaceId });
  const topClips        = useQuery(api.analytics.getTopClips, { limit: 5, workspaceId });

  const totalPublished   = stats?.published ?? 0;
  const totalGenerated   = stats?.clipsGenerated ?? 0;
  const totalProjects    = stats?.totalProjects ?? 0;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full min-h-full flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-extrabold tracking-tight">Analytics</h1>
          </div>
          <p className="text-muted-foreground">Track performance across all published clips & platforms.</p>
        </div>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="border border-border rounded-xl px-4 py-2 text-sm font-semibold bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          {PERIOD_OPTIONS.map((o) => (
            <option key={o.days} value={o.days}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Overview Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Projects",    value: totalProjects,  icon: Eye,       color: "bg-primary/10 text-primary" },
          { label: "Clips Published",   value: totalPublished, icon: Send,      color: "bg-green-100 text-green-700" },
          { label: "Clips Generated",   value: totalGenerated, icon: Scissors,  color: "bg-accent/15 text-accent" },
          { label: "Platforms Active",  value: platformBreak?.length ?? 0, icon: ThumbsUp, color: "bg-amber-100 text-amber-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-border rounded-2xl p-5 shadow-sm flex items-start gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
              <Icon size={20} />
            </div>
            <div>
              {stats === undefined ? (
                <div className="h-7 w-16 bg-secondary animate-pulse rounded-lg mb-1" />
              ) : (
                <p className="text-2xl font-extrabold leading-tight">{value.toLocaleString()}</p>
              )}
              <p className="text-sm font-semibold text-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Weekly Activity Chart */}
      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 size={18} className="text-primary" />
          <h2 className="font-extrabold text-base">Activity — Last {days} Days</h2>
        </div>

        {weeklyActivity === undefined ? (
          <div className="h-48 bg-secondary/30 animate-pulse rounded-xl" />
        ) : weeklyActivity.every((d) => d.clipsGenerated === 0 && d.published === 0) ? (
          <div className="h-48 flex items-center justify-center text-muted-foreground text-sm font-medium">
            No activity in the last {days} days
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-48 w-full">
            <BarChart data={weeklyActivity} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11, fontWeight: 600 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="clipsGenerated" fill="#1e3a2b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="published"      fill="#1e3a2b"      radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        )}

        <div className="flex items-center gap-4 mt-4 text-xs font-semibold text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: "hsl(var(--chart-1))" }} /> Clips Generated
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: "hsl(var(--chart-2))" }} /> Published
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Breakdown */}
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={16} className="text-primary" />
            <h2 className="font-extrabold text-base">Platform Breakdown</h2>
          </div>

          {platformBreak === undefined ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 bg-secondary animate-pulse rounded-xl" />
              ))}
            </div>
          ) : platformBreak.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No clips published yet</p>
          ) : (
            <div className="flex flex-col gap-4">
              {platformBreak.map((p) => {
                const meta = PLATFORM_META[p.platform] ?? { label: p.platform, color: "bg-primary" };
                const maxCount = platformBreak[0].count;
                return (
                  <div key={p.platform}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-sm ${meta.color}`} />
                        <span className="text-sm font-bold">{meta.label}</span>
                      </div>
                      <span className="text-sm font-extrabold text-foreground">
                        {p.count} clip{p.count !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${(p.count / maxCount) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Performing Clips */}
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Star size={16} className="text-accent" />
            <h2 className="font-extrabold text-base">Top Clips by Viral Score</h2>
          </div>

          {topClips === undefined ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-secondary animate-pulse rounded-xl" />
              ))}
            </div>
          ) : topClips.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No clips generated yet</p>
          ) : (
            <div className="flex flex-col gap-2">
              {topClips.map((clip, i) => (
                <div
                  key={clip.id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors"
                >
                  <span className="text-sm font-extrabold text-muted-foreground w-5 text-center shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{clip.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{clip.projectTitle}</p>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <span className="text-[10px] font-bold text-muted-foreground capitalize">
                      {PLATFORM_META[clip.platform]?.label ?? clip.platform}
                    </span>
                    <div className="w-9 h-9 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center">
                      <span className="text-[10px] font-extrabold text-amber-600">{clip.viralScore}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
