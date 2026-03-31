"use client";

import { useMutation } from "convex/react";
import { usePaginatedQuery } from "convex/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { cn, friendlyError } from "@/lib/utils";
import Image from "next/image";
import {
  AlertCircle, Calendar, CheckCircle2, Clock, Loader2, X, Lock, Trash2, AlertTriangle,
} from "lucide-react";
import { useState } from "react";
import { useWorkspace } from "@/components/workspace-context";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from "@/components/ui/dialog";

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

type Post = {
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

type ConfirmDialog =
  | { type: "cancel";        id: string; title: string }
  | { type: "delete-single"; id: string; title: string }
  | { type: "delete-all" };

function StatusBadge({ status }: { status: string }) {
  if (status === "pending")   return <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200"><Clock size={11} /> Scheduled</span>;
  if (status === "published") return <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200"><CheckCircle2 size={11} /> Published</span>;
  if (status === "failed")    return <span className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200"><AlertCircle size={11} /> Failed</span>;
  if (status === "cancelled") return <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground bg-secondary px-2 py-0.5 rounded-full"><X size={11} /> Cancelled</span>;
  return null;
}

const PAGE_SIZE = 20;

export default function ScheduledPage() {
  const { activeOrgId } = useWorkspace();
  const usage = useQuery(api.usage.getUsage, { workspaceId: activeOrgId ?? undefined });

  const cancelPost    = useMutation(api.scheduledPublish.cancelScheduledPost);
  const deletePost    = useMutation(api.scheduledPublish.deleteScheduledPost);
  const deleteAllPosts = useMutation(api.scheduledPublish.deleteAllScheduledPosts);

  const [actionPending, setActionPending] = useState<string | null>(null);
  const [deleteAllPending, setDeleteAllPending] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog | null>(null);
  const [dialogError, setDialogError] = useState("");

  const { results, status, loadMore } = usePaginatedQuery(
    api.scheduledPublish.getScheduledPostsPaginated,
    {},
    { initialNumItems: PAGE_SIZE },
  );

  const canSchedule = usage?.limits.scheduledPublishing ?? true;
  const isLoading = status === "LoadingFirstPage";
  const isLoadingMore = status === "LoadingMore";
  const canLoadMore = status === "CanLoadMore";

  const upcoming = results.filter((p) => p.status === "pending");
  const past     = results.filter((p) => p.status !== "pending");

  const closeDialog = () => { setConfirmDialog(null); setDialogError(""); };

  const handleConfirm = async () => {
    if (!confirmDialog) return;
    setDialogError("");

    if (confirmDialog.type === "cancel") {
      setActionPending(confirmDialog.id);
      try {
        await cancelPost({ scheduledPostId: confirmDialog.id as Id<"scheduledPosts"> });
        closeDialog();
      } catch (err) {
        setDialogError(friendlyError(err, "Failed to cancel"));
      } finally {
        setActionPending(null);
      }
    } else if (confirmDialog.type === "delete-single") {
      setActionPending(confirmDialog.id);
      try {
        await deletePost({ scheduledPostId: confirmDialog.id as Id<"scheduledPosts"> });
        closeDialog();
      } catch (err) {
        setDialogError(friendlyError(err, "Failed to delete"));
      } finally {
        setActionPending(null);
      }
    } else if (confirmDialog.type === "delete-all") {
      setDeleteAllPending(true);
      try {
        await deleteAllPosts({});
        closeDialog();
      } catch (err) {
        setDialogError(friendlyError(err, "Failed to delete all posts"));
      } finally {
        setDeleteAllPending(false);
      }
    }
  };

  const isConfirmPending =
    (confirmDialog?.type === "delete-all" && deleteAllPending) ||
    (confirmDialog?.type !== "delete-all" && confirmDialog != null && actionPending === confirmDialog.id);

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto w-full min-h-full flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Scheduled Posts</h1>
          <p className="text-muted-foreground mt-1">Manage your upcoming and past scheduled publications.</p>
        </div>
        {results.length > 0 && (
          <button
            type="button"
            onClick={() => setConfirmDialog({ type: "delete-all" })}
            className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold transition-colors"
          >
            <Trash2 size={14} />
            Delete All
          </button>
        )}
      </div>

      {/* Upgrade banner */}
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
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white border border-border rounded-2xl p-4 flex items-start gap-4 shadow-sm animate-pulse">
              <div className="w-7 h-7 rounded-lg bg-secondary shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-3.5 bg-secondary rounded w-24" />
                  <div className="h-3.5 bg-secondary rounded w-16" />
                  <div className="h-5 bg-secondary rounded-full w-20" />
                </div>
                <div className="h-3.5 bg-secondary rounded w-2/3" />
                <div className="h-3 bg-secondary rounded w-1/2" />
                <div className="h-3 bg-secondary rounded w-32 mt-1" />
              </div>
              <div className="h-7 w-16 bg-secondary rounded-lg shrink-0" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && results.length === 0 && (
        <div className="bg-secondary/40 rounded-2xl p-10 flex flex-col items-center gap-3 text-center">
          <Calendar size={32} className="text-muted-foreground/50" />
          <p className="font-extrabold text-base">No scheduled posts yet</p>
          <p className="text-sm text-muted-foreground">Use the Schedule option when publishing a clip to queue it for a future time.</p>
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <section>
          <h2 className="font-extrabold text-base mb-3">Upcoming ({upcoming.length}{canLoadMore || isLoadingMore ? "+" : ""})</h2>
          <div className="flex flex-col gap-2">
            {upcoming.map((post) => (
              <PostRow
                key={post.id}
                post={post}
                onCancel={() => setConfirmDialog({ type: "cancel", id: post.id, title: post.clipTitle })}
                onDelete={() => setConfirmDialog({ type: "delete-single", id: post.id, title: post.clipTitle })}
                actionPending={actionPending === post.id}
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
              <PostRow
                key={post.id}
                post={post}
                onDelete={() => setConfirmDialog({ type: "delete-single", id: post.id, title: post.clipTitle })}
                actionPending={actionPending === post.id}
              />
            ))}
          </div>
        </section>
      )}

      {/* Load more */}
      {(canLoadMore || isLoadingMore) && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => loadMore(PAGE_SIZE)}
            disabled={isLoadingMore}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-border bg-white hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-semibold shadow-sm"
          >
            {isLoadingMore ? <><Loader2 size={15} className="animate-spin" /> Loading…</> : "Load more"}
          </button>
        </div>
      )}

      {/* Confirm dialog */}
      <Dialog open={confirmDialog !== null} onOpenChange={(open) => { if (!open) closeDialog(); }}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} className="text-red-600" />
              </div>
              <DialogTitle className="text-base font-extrabold">
                {confirmDialog?.type === "delete-all"
                  ? "Delete all posts?"
                  : confirmDialog?.type === "delete-single"
                  ? "Delete this post?"
                  : "Cancel this post?"}
              </DialogTitle>
            </div>
            <DialogDescription>
              {confirmDialog?.type === "delete-all"
                ? "This will permanently delete all scheduled posts. Any pending ones will be cancelled. This cannot be undone."
                : confirmDialog?.type === "delete-single"
                ? <>Permanently delete <span className="font-semibold text-foreground">&ldquo;{confirmDialog.title}&rdquo;</span>? This cannot be undone.</>
                : <>Cancel the scheduled post for <span className="font-semibold text-foreground">&ldquo;{confirmDialog?.title}&rdquo;</span>? It won&apos;t be published.</>}
            </DialogDescription>
          </DialogHeader>

          {dialogError && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs font-medium">
              <AlertCircle size={13} className="shrink-0" />
              {dialogError}
            </div>
          )}

          <DialogFooter>
            <DialogClose
              render={
                <button
                  type="button"
                  disabled={isConfirmPending}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-border bg-white hover:bg-secondary text-sm font-semibold transition-colors disabled:opacity-50"
                />
              }
            >
              Cancel
            </DialogClose>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isConfirmPending}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {isConfirmPending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              {confirmDialog?.type === "delete-all"
                ? "Delete All"
                : confirmDialog?.type === "delete-single"
                ? "Delete"
                : "Cancel Post"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PostRow({
  post,
  onCancel,
  onDelete,
  actionPending,
}: {
  post: Post;
  onCancel?: () => void;
  onDelete?: () => void;
  actionPending?: boolean;
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

      {/* Actions */}
      <div className="shrink-0 flex items-center gap-1.5">
        {post.status === "pending" && onCancel && (
          <button
            onClick={onCancel}
            disabled={actionPending}
            className="text-xs font-semibold text-muted-foreground hover:text-amber-600 transition-colors border border-border hover:border-amber-200 px-2.5 py-1.5 rounded-lg disabled:opacity-50"
          >
            {actionPending ? <Loader2 size={12} className="animate-spin" /> : "Cancel"}
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            disabled={actionPending}
            className="text-xs font-semibold text-muted-foreground hover:text-red-500 transition-colors border border-border hover:border-red-200 p-1.5 rounded-lg disabled:opacity-50"
            title="Delete"
          >
            {actionPending ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={13} />}
          </button>
        )}
      </div>
    </div>
  );
}
