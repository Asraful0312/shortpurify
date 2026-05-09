"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Plus, Video, Sparkles, Clapperboard, Send, Zap, Loader2 } from "lucide-react";
import { ProjectCard } from "@/components/project-card";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { FeatureAnnouncement } from "@/components/dashboard/feature-announcement";
import { useWorkspace } from "@/components/workspace-context";
import { useUser } from "@clerk/clerk-react";

const PAGE_SIZE = 12;

export default function DashboardPage() {
  const { activeOrgId, activeOrg, isLoading: workspaceLoading } = useWorkspace();

  const isPersonalView = !activeOrgId;

    const user = useUser()

  console.log("user", user)

  const {
    results: personalResults,
    status: personalStatus,
    loadMore: loadMorePersonal,
  } = usePaginatedQuery(
    api.projects.listUserProjectsPaginated,
    {},
    { initialNumItems: PAGE_SIZE },
  );

  const {
    results: workspaceResults,
    status: workspaceStatus,
    loadMore: loadMoreWorkspace,
  } = usePaginatedQuery(
    api.projects.listWorkspaceProjectsPaginated,
    activeOrgId ? { workspaceId: activeOrgId } : "skip",
    { initialNumItems: PAGE_SIZE },
  );

  const workspaceId = activeOrgId ?? undefined;
  const aggregateStats = useQuery(api.analytics.getDashboardStats, { workspaceId });
  const usageData = useQuery(api.usage.getUsage, { workspaceId: activeOrgId ?? undefined });

  const projects = isPersonalView ? personalResults : workspaceResults;
  const status = isPersonalView ? personalStatus : workspaceStatus;
  const loadMore = isPersonalView ? loadMorePersonal : loadMoreWorkspace;

  const isLoading = workspaceLoading || status === "LoadingFirstPage";
  const isLoadingMore = status === "LoadingMore";
  const canLoadMore = status === "CanLoadMore";

  const totalProjects = aggregateStats?.totalProjects ?? projects.length ?? 0;
  const stats = {
    totalProjects,
    clipsGenerated: aggregateStats?.clipsGenerated ?? 0,
    published: aggregateStats?.published ?? 0,
    projectsUsed: usageData?.usage.projectsUsed ?? 0,
    projectsLimit: usageData !== undefined ? (usageData?.limits.projects ?? Infinity) : 5,
    minutesUsed: usageData?.usage.minutesUsed ?? 0,
    minutesLimit: usageData !== undefined ? (usageData?.limits.minutes ?? 60) : 60,
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full min-h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {isPersonalView ? "Your Projects" : `${activeOrg?.name ?? "Workspace"} Projects`}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isPersonalView
              ? "Manage all your generated viral clips in one place."
              : "Shared projects in this workspace."}
          </p>
        </div>
        <Link
          href="/dashboard/upload"
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all active:scale-95 flex items-center gap-2"
        >
          <Plus size={18} /> New Project
        </Link>
      </div>

      {/* Stats */}
      <StatsCards stats={stats} className="mb-8" />

      {/* Feature announcement */}
      <FeatureAnnouncement />

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link
          href="/dashboard/publish"
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-white hover:bg-secondary transition-colors text-sm font-semibold text-foreground shadow-sm"
        >
          <Send size={15} className="text-primary" /> Publish Hub
        </Link>
        <Link
          href="/dashboard/analytics"
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-white hover:bg-secondary transition-colors text-sm font-semibold text-foreground shadow-sm"
        >
          <Zap size={15} className="text-accent" /> Analytics
        </Link>
        <Link
          href="/dashboard/upload"
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-white hover:bg-secondary transition-colors text-sm font-semibold text-foreground shadow-sm"
        >
          <Clapperboard size={15} className="text-muted-foreground" /> Upload Video
        </Link>
      </div>

      {/* Loading skeletons */}
      {isLoading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl border border-border overflow-hidden shadow-sm animate-pulse"
            >
              <div className="aspect-video bg-secondary/60" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-secondary rounded-lg w-3/4" />
                <div className="h-3 bg-secondary rounded-lg w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && projects.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border/60 rounded-[2rem] bg-white/50 p-10 text-center min-h-[400px]">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6 shadow-sm">
            <Video size={32} />
          </div>
          <h3 className="text-2xl font-bold mb-2">No projects yet</h3>
          <p className="text-muted-foreground max-w-sm mb-8">
            {isPersonalView
              ? "Upload your first raw video to let AI extract the most viral moments."
              : "No one in this workspace has created a project yet."}
          </p>
          <Link
            href="/dashboard/upload"
            className="bg-foreground text-background font-bold px-6 py-3 rounded-full shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl active:scale-95 flex items-center gap-2"
          >
            <Sparkles size={18} className="text-accent" />
            Create First Project
          </Link>
        </div>
      )}

      {/* Projects grid */}
      {!isLoading && projects.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Recent Projects</h2>
            <span className="text-sm text-muted-foreground font-medium">
              {projects.length} project{projects.length !== 1 ? "s" : ""}{canLoadMore || isLoadingMore ? "+" : ""}
            </span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project._id}
                project={{
                  id: project._id,
                  title: project.title,
                  status: project.status,
                  createdAt: project.createdAt,
                  clipsCount: project.clipsCount,
                  thumbnailUrl: project.thumbnailUrl,
                }}
              />
            ))}
          </div>

          {/* Load more */}
          {(canLoadMore || isLoadingMore) && (
            <div className="flex justify-center mt-8">
              <button
                type="button"
                onClick={() => loadMore(PAGE_SIZE)}
                disabled={isLoadingMore}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-border bg-white hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-semibold shadow-sm"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Loading…
                  </>
                ) : (
                  "Load more"
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
