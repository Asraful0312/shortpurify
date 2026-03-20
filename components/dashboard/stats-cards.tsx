"use client";

import { Clapperboard, Scissors, Send, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface Stats {
  totalProjects: number;
  clipsGenerated: number;
  published: number;
  creditsLeft: number;
  creditsTotal: number;
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
  const usedPct = ((stats.creditsTotal - stats.creditsLeft) / stats.creditsTotal) * 100;

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

      {/* Credits card with progress */}
      <div className="bg-white border border-border rounded-2xl p-5 shadow-sm flex flex-col gap-3">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Zap size={20} />
          </div>
          <div>
            <p className="text-2xl font-extrabold leading-tight">{stats.creditsLeft}</p>
            <p className="text-sm font-semibold text-foreground">Credits Left</p>
            <p className="text-xs text-muted-foreground mt-0.5">of {stats.creditsTotal}/mo free</p>
          </div>
        </div>
        <Progress value={usedPct} className="h-1.5" />
        <a
          href="/dashboard/billing"
          className="text-xs font-bold text-primary hover:underline"
        >
          Upgrade for more →
        </a>
      </div>
    </div>
  );
}
