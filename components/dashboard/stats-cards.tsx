"use client";

import { Clapperboard, Scissors, Send, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface Stats {
  totalProjects: number;
  clipsGenerated: number;
  published: number;
  projectsUsed: number;
  projectsLimit: number;
  minutesUsed: number;
  minutesLimit: number;
}

const cards = (stats: Stats) => [
  {
    label: "Total Projects",
    value: stats.totalProjects,
    icon: Clapperboard,
    color: "bg-primary/10 text-primary",
    sub: "All time",
  },
  {
    label: "Clips Generated",
    value: stats.clipsGenerated,
    icon: Scissors,
    color: "bg-accent/15 text-accent",
    sub: "AI-extracted shorts",
  },
  {
    label: "Published",
    value: stats.published,
    icon: Send,
    color: "bg-green-100 text-green-700",
    sub: "Across platforms",
  },
];

export function StatsCards({ stats, className }: { stats: Stats; className?: string }) {
  const projectsPct = Math.min((stats.projectsUsed / stats.projectsLimit) * 100, 100);
  const minutesPct = stats.minutesLimit === Infinity ? 0 : Math.min((stats.minutesUsed / stats.minutesLimit) * 100, 100);

  const projectsNearLimit = projectsPct >= 80 && projectsPct < 100;
  const projectsAtLimit = stats.projectsUsed >= stats.projectsLimit;
  const minutesNearLimit = minutesPct >= 80 && minutesPct < 100;

  return (
    <div className={cn("grid sm:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {cards(stats).map(({ label, value, icon: Icon, color, sub }) => (
        <div
          key={label}
          className="bg-white border border-border rounded-2xl p-5 flex items-start gap-4 shadow-sm"
        >
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", color)}>
            <Icon size={20} />
          </div>
          <div>
            <p className="text-2xl font-extrabold leading-tight">{value}</p>
            <p className="text-sm font-semibold text-foreground">{label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
          </div>
        </div>
      ))}

      {/* Usage card — projects + minutes */}
      <div className="bg-white border border-border rounded-2xl p-5 shadow-sm flex flex-col gap-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Zap size={20} />
          </div>
          <div>
            <p className="text-sm font-extrabold text-foreground">Monthly Usage</p>
            <p className="text-xs text-muted-foreground">Resets on the 1st</p>
          </div>
        </div>

        {/* Projects bar */}
        <div>
          <div className="flex justify-between mb-1">
            <p className="text-xs font-semibold">Projects</p>
            <p className={cn("text-xs font-bold", projectsAtLimit ? "text-red-500" : projectsNearLimit ? "text-amber-500" : "text-muted-foreground")}>
              {stats.projectsUsed} / {stats.projectsLimit === Infinity ? "∞" : stats.projectsLimit}
            </p>
          </div>
          <Progress
            value={projectsPct}
            className={cn("h-1.5", projectsAtLimit ? "[&>div]:bg-red-500" : projectsNearLimit ? "[&>div]:bg-amber-400" : "")}
          />
        </div>

        {/* Minutes bar */}
        <div>
          <div className="flex justify-between mb-1">
            <p className="text-xs font-semibold">Video Minutes</p>
            <p className={cn("text-xs font-bold", minutesNearLimit ? "text-amber-500" : "text-muted-foreground")}>
              {stats.minutesUsed} / {stats.minutesLimit === Infinity ? "∞" : `${stats.minutesLimit} min`}
            </p>
          </div>
          <Progress
            value={minutesPct}
            className={cn("h-1.5", minutesNearLimit ? "[&>div]:bg-amber-400" : "")}
          />
        </div>

        <a href="/dashboard/billing" className="text-xs font-bold text-primary hover:underline">
          {projectsAtLimit ? "Limit reached — upgrade →" : "Upgrade for more →"}
        </a>
      </div>
    </div>
  );
}
