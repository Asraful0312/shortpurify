"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { cn, friendlyError } from "@/lib/utils";
import Image from "next/image";
import { AlertCircle, Calendar, CheckCircle2, Clock, Loader2, X, Lock } from "lucide-react";
import { useState } from "react";
import { useWorkspace } from "@/components/workspace-context";

const PLATFORM_META: Record<string, { name: string; image: string }> = {
  youtube:   { name: "YouTube Shorts",  image: "/icons/youtube-short.png" },
  x:         { name: "X / Twitter",     image: "/icons/twitter.png" },
  tiktok:    { name: "TikTok",          image: "/icons/tik-tok.png" },
  bluesky:   { name: "Bluesky",         image: "/icons/bluesky-icon.png" },
  facebook:  { name: "Facebook",        image: "/icons/facebook.png" },
  instagram: { name: "Instagram",       image: "/icons/instagram.png" },
  threads:   { name: "Threads",         image: "/icons/threads.png" },
  linkedin:  { name: "LinkedIn",        image: "/icons/linkedin.png" },
};

function StatusBadge({ status }: { status: string }) {
  if (status === "pending")   return <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200"><Clock size={11} /> Scheduled</span>;
  if (status === "published") return <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200"><CheckCircle2 size={11} /> Published</span>;
  if (status === "failed")    return <span className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200"><AlertCircle size={11} /> Failed</span>;
  if (status === "cancelled") return <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground bg-secondary px-2 py-0.5 rounded-full"><X size={11} /> Cancelled</span>;
  return null;
}

export default function ScheduledPage() {
  const { activeOrgId } = useWorkspace();
  const posts = useQuery(api.scheduledPublish.getScheduledPosts);
  const cancelPost = useMutation(api.scheduledPublish.cancelScheduledPost);
  const usage = useQuery(api.usage.getUsage, { workspaceId: activeOrgId ?? undefined });
  const [cancelling, setCancelling] = useState<string | null>(null);

  const canSchedule = usage?.limits.scheduledPublishing ?? true; // default true while loading
  const isLoading = posts === undefined;

  const upcoming = (posts ?? []).filter((p) => p.status === "pending");
  const past     = (posts ?? []).filter((p) => p.status !== "pending");

  const handleCancel = async (id: string) => {
    if (!confirm("Cancel this scheduled post?")) return;
    setCancelling(id);
    try {
      await cancelPost({ scheduledPostId: id as Id<"scheduledPosts"> });
    } catch (err) {
      alert(friendlyError(err, "Failed to cancel"));
    } finally {
      setCancelling(null);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto w-full min-h-full flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Scheduled Posts</h1>
        <p className="text-muted-foreground mt-1">Manage your upcoming and past scheduled publications.</p>
      </div>

      {/* Upgrade banner for Starter users */}
      {!canSchedule && usage !== undefined && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <Lock size={18} className="text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="font-extrabold text-amber-900">Scheduled publishing requires Pro</p>
            <p className="text-sm text-amber-700 mt-0.5">
              Upgrade to Pro Creator to schedule posts in advance across all your connected accounts.
            </p>
          </div>
          <a
            href="/dashboard/billing"
            className="shrink-0 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-extrabold hover:bg-primary/90 transition-all"
          >
            Upgrade
          </a>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 size={16} className="animate-spin" /> Loading…
        </div>
      )}

      {!isLoading && posts!.length === 0 && (
        <div className="bg-secondary/40 rounded-2xl p-10 flex flex-col items-center gap-3 text-center">
          <Calendar size={32} className="text-muted-foreground/50" />
          <p className="font-extrabold text-base">No scheduled posts yet</p>
          <p className="text-sm text-muted-foreground">Use the Schedule option when publishing a clip to queue it for a future time.</p>
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <section>
          <h2 className="font-extrabold text-base mb-3">Upcoming ({upcoming.length})</h2>
          <div className="flex flex-col gap-2">
            {upcoming.map((post) => (
              <PostRow
                key={post.id}
                post={post}
                onCancel={() => handleCancel(post.id)}
                cancelling={cancelling === post.id}
              />
            ))}
          </div>
        </section>
      )}

      {/* Past */}
      {past.length > 0 && (
        <section>
          <h2 className="font-extrabold text-base mb-3">Past</h2>
          <div className="flex flex-col gap-2">
            {past.map((post) => (
              <PostRow key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function PostRow({
  post,
  onCancel,
  cancelling,
}: {
  post: {
    id: string;
    platform: string;
    accountName: string;
    accountPicture?: string;
    clipTitle: string;
    caption: string;
    scheduledAt: number;
    status: string;
    error?: string;
    postId?: string;
  };
  onCancel?: () => void;
  cancelling?: boolean;
}) {
  const meta = PLATFORM_META[post.platform] ?? { name: post.platform, image: "" };
  const scheduledDate = new Date(post.scheduledAt);
  const isPast = post.scheduledAt < Date.now();

  return (
    <div className={cn(
      "bg-white border rounded-2xl p-4 flex items-start gap-4 shadow-sm",
      post.status === "failed" ? "border-red-200" : "border-border",
    )}>
      {/* Platform icon */}
      <div className="shrink-0 mt-0.5">
        {meta.image && <Image src={meta.image} alt={meta.name} width={28} height={28} className="rounded-lg" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-sm">{meta.name}</span>
          <span className="text-muted-foreground text-xs">·</span>
          {post.accountPicture ? (
            // eslint-disable-next-line @next/next-image
            <img src={post.accountPicture} alt="" className="w-4 h-4 rounded-full object-cover" />
          ) : null}
          <span className="text-sm text-muted-foreground truncate">{post.accountName}</span>
          <StatusBadge status={post.status} />
        </div>

        <p className="text-sm font-semibold mt-1 truncate">{post.clipTitle}</p>
        {post.caption && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{post.caption}</p>
        )}

        <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
          <Calendar size={11} />
          <span className={cn(post.status === "pending" && !isPast ? "text-amber-600 font-semibold" : "")}>
            {scheduledDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
            {" at "}
            {scheduledDate.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>

        {post.status === "failed" && post.error && (
          <p className="text-xs text-red-600 mt-1 font-medium">{post.error}</p>
        )}
        {post.status === "published" && post.postId && (
          <p className="text-xs text-green-600 mt-1 font-mono">ID: {post.postId.slice(0, 20)}…</p>
        )}
      </div>

      {/* Cancel button */}
      {post.status === "pending" && onCancel && (
        <button
          onClick={onCancel}
          disabled={cancelling}
          className="shrink-0 text-xs font-semibold text-muted-foreground hover:text-red-500 transition-colors border border-border hover:border-red-200 px-2.5 py-1.5 rounded-lg disabled:opacity-50"
        >
          {cancelling ? <Loader2 size={12} className="animate-spin" /> : "Cancel"}
        </button>
      )}
    </div>
  );
}
