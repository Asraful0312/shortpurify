"use client";

import { useEffect, useState } from "react";
import { Send, Calendar, CheckCircle2, X, Loader2, AlertCircle, Link2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Image from "next/image";

const PLATFORM_META: Record<string, { name: string; image: string }> = {
  facebook:  { name: "Facebook Page",    image: "/icons/facebook.png" },
  instagram: { name: "Instagram Reels",  image: "/icons/instagram.png" },
  youtube:   { name: "YouTube Shorts",   image: "/icons/youtube.png" },
  x:         { name: "X / Twitter",      image: "/icons/x.png" },
  tiktok:    { name: "TikTok",           image: "/icons/tik-tok.png" },
  linkedin:  { name: "LinkedIn",         image: "/icons/linkedin.png" },
  threads:   { name: "Threads",          image: "/icons/threads.png" },
  bluesky:   { name: "Bluesky",          image: "/icons/bluesky-icon.png" },
};

type SafeToken = {
  id: Id<"socialTokens">;
  platform: string;
  accountId: string;
  accountName: string;
  accountPicture?: string;
  isExpired: boolean;
};

interface PublishModalProps {
  open: boolean;
  onClose: () => void;
  /** Pre-loaded from useQuery(api.socialTokens.getAllTokens) in the parent */
  accounts: SafeToken[];
  clipTitle?: string;
  clipUrl?: string;
  clipKey?: string;
  outputId?: string;
  defaultCaption?: string;
  /** Per-platform AI captions keyed by platform id */
  captions?: Record<string, string>;
}

type PublishState = "idle" | "publishing" | "success" | "error";

type PublishResult = { accountName: string; postId?: string; error?: string };

/** Pick the best caption for the currently selected accounts */
function pickCaption(
  selectedIds: string[],
  accounts: SafeToken[],
  captions?: Record<string, string>,
  fallback?: string,
): string {
  if (!captions) return fallback ?? "";
  for (const id of selectedIds) {
    const acc = accounts.find((a) => a.accountId === id);
    if (acc && captions[acc.platform]) return captions[acc.platform];
  }
  return fallback ?? Object.values(captions)[0] ?? "";
}

export function PublishModal({
  open,
  onClose,
  accounts,
  clipTitle,
  clipUrl,
  clipKey,
  outputId,
  defaultCaption,
  captions,
}: PublishModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [caption, setCaption] = useState(defaultCaption ?? "");
  const [mode, setMode] = useState<"now" | "schedule">("now");
  const [scheduledDate, setScheduledDate] = useState("");
  const [state, setState] = useState<PublishState>("idle");
  const [error, setError] = useState("");
  const [results, setResults] = useState<PublishResult[]>([]);

  const publishFacebook = useAction(api.facebookActions.publishClip);
  const publishYouTube  = useAction(api.youtubeActions.publishClip);
  const publishTikTok   = useAction(api.tiktokActions.publishClip);
  const publishX        = useAction(api.xActions.publishClip);
  const publishThreads  = useAction(api.threadsActions.publishClip);
  const publishBluesky  = useAction(api.blueskyActions.publishClip);

  // Auto-select all non-expired accounts when modal opens
  useEffect(() => {
    if (!open) return;
    const ids = accounts.filter((a) => !a.isExpired).map((a) => a.accountId);
    setSelectedIds(ids);
    setCaption(pickCaption(ids, accounts, captions, defaultCaption));
    setState("idle");
    setError("");
    setResults([]);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = (accountId: string) => {
    setSelectedIds((prev) => {
      const next = prev.includes(accountId)
        ? prev.filter((id) => id !== accountId)
        : [...prev, accountId];
      setCaption(pickCaption(next, accounts, captions, defaultCaption));
      return next;
    });
  };

  const handlePublish = async () => {
    if (!clipUrl || !outputId) {
      setError("No clip selected. Open a clip and tap the Publish button.");
      setState("error");
      return;
    }
    if (selectedIds.length === 0) return;

    setState("publishing");
    setError("");

    const scheduled = mode === "schedule" && scheduledDate
      ? new Date(scheduledDate).toISOString()
      : undefined;

    const publishResults: PublishResult[] = [];

    for (const accountId of selectedIds) {
      const acc = accounts.find((a) => a.accountId === accountId);
      if (!acc) continue;

      try {
        if (acc.platform === "facebook") {
          const res = await publishFacebook({
            outputId: outputId as Id<"outputs">,
            accountId,
            clipUrl,
            clipKey,
            caption,
            scheduledDate: scheduled,
          });
          publishResults.push({ accountName: acc.accountName, postId: res.postId });
        } else if (acc.platform === "youtube") {
          const res = await publishYouTube({
            outputId: outputId as Id<"outputs">,
            accountId,
            clipUrl,
            clipKey,
            caption,
            title: clipTitle ?? "Short Clip",
          });
          publishResults.push({ accountName: acc.accountName, postId: res.videoId });
        } else if (acc.platform === "tiktok") {
          const res = await publishTikTok({
            outputId: outputId as Id<"outputs">,
            accountId,
            clipUrl,
            clipKey,
            caption,
            title: clipTitle ?? "Short Clip",
          });
          publishResults.push({ accountName: acc.accountName, postId: res.publishId });
        } else if (acc.platform === "x") {
          const res = await publishX({
            outputId: outputId as Id<"outputs">,
            accountId,
            clipUrl,
            clipKey,
            caption,
            title: clipTitle ?? "Short Clip",
          });
          publishResults.push({ accountName: acc.accountName, postId: res.tweetId });
        } else if (acc.platform === "bluesky") {
          const res = await publishBluesky({
            outputId: outputId as Id<"outputs">,
            accountId,
            clipUrl,
            clipKey,
            caption,
            title: clipTitle ?? "Short Clip",
          });
          publishResults.push({ accountName: acc.accountName, postId: res.postId });
        } else if (acc.platform === "threads") {
          const res = await publishThreads({
            outputId: outputId as Id<"outputs">,
            accountId,
            clipUrl,
            clipKey,
            caption,
            title: clipTitle ?? "Short Clip",
          });
          publishResults.push({ accountName: acc.accountName, postId: res.postId });
        } else {
          publishResults.push({ accountName: acc.accountName, error: `${acc.platform} publishing coming soon` });
        }
      } catch (err) {
        publishResults.push({
          accountName: acc.accountName,
          error: err instanceof Error ? err.message : "Failed",
        });
      }
    }

    setResults(publishResults);
    const anySuccess = publishResults.some((r) => !r.error);
    setState(anySuccess ? "success" : "error");
    if (!anySuccess) setError(publishResults[0]?.error ?? "Publishing failed");
  };

  const handleClose = () => {
    setState("idle");
    setError("");
    setResults([]);
    setSelectedIds([]);
    onClose();
  };

  if (!open) return null;

  const activeAccounts = accounts.filter((a) => !a.isExpired);
  const successCount = results.filter((r) => !r.error).length;

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-border overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div>
            <h2 className="text-lg font-extrabold">Publish Clip</h2>
            {clipTitle && <p className="text-sm text-muted-foreground mt-0.5 truncate max-w-xs">{clipTitle}</p>}
          </div>
          <button onClick={handleClose} className="p-2 rounded-xl hover:bg-secondary transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Success */}
        {state === "success" && (
          <div className="flex flex-col items-center justify-center py-12 gap-4 px-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 size={32} className="text-green-600" />
            </div>
            <p className="font-extrabold text-xl">
              {mode === "schedule" ? "Scheduled!" : "Published!"}
            </p>
            <div className="w-full flex flex-col gap-2">
              {results.map((r, i) => (
                <div key={i} className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-xl text-sm",
                  r.error ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700",
                )}>
                  {r.error
                    ? <AlertCircle size={14} className="shrink-0" />
                    : <CheckCircle2 size={14} className="shrink-0" />}
                  <span className="font-semibold truncate">{r.accountName}</span>
                  {r.error
                    ? <span className="text-xs ml-auto shrink-0">Failed</span>
                    : <span className="text-xs ml-auto shrink-0 font-mono">{r.postId?.slice(0, 10)}…</span>}
                </div>
              ))}
            </div>
            {successCount > 0 && (
              <p className="text-muted-foreground text-xs text-center">
                Posted to {successCount} account{successCount !== 1 ? "s" : ""}. It may take a few minutes to appear.
              </p>
            )}
            <button onClick={handleClose} className="mt-1 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors">
              Done
            </button>
          </div>
        )}

        {/* Error (all failed) */}
        {state === "error" && (
          <div className="p-6 flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle size={24} className="text-red-600" />
            </div>
            <p className="font-bold text-center text-sm text-red-700">{error}</p>
            <button onClick={() => setState("idle")} className="px-5 py-2 rounded-xl border border-border text-sm font-semibold hover:bg-secondary transition-colors">
              Try Again
            </button>
          </div>
        )}

        {/* No accounts */}
        {(state === "idle" || state === "publishing") && activeAccounts.length === 0 && (
          <div className="p-8 flex flex-col items-center gap-4 text-center">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <AlertCircle size={24} className="text-amber-600" />
            </div>
            <div>
              <p className="font-extrabold text-base">No accounts connected</p>
              <p className="text-sm text-muted-foreground mt-1">Connect your Facebook pages in the Publish Hub first.</p>
            </div>
            <a href="/dashboard/publish" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors">
              <Link2 size={14} /> Go to Publish Hub
            </a>
          </div>
        )}

        {/* Form */}
        {(state === "idle" || state === "publishing") && activeAccounts.length > 0 && (
          <div className="p-6 space-y-5">

            {/* Account selector */}
            <div>
              <p className="text-sm font-bold mb-1">Post to</p>
              <p className="text-xs text-muted-foreground mb-3">Select which accounts to publish to.</p>
              <div className="flex flex-col gap-2">
                {activeAccounts.map((acc) => {
                  const meta = PLATFORM_META[acc.platform] ?? { name: acc.platform, emoji: "📱" };
                  const isSelected = selectedIds.includes(acc.accountId);
                  const hasCap = captions?.[acc.platform];
                  return (
                    <button
                      key={acc.accountId}
                      onClick={() => toggle(acc.accountId)}
                      disabled={state === "publishing"}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all text-left",
                        isSelected ? "border-primary bg-primary/5" : "border-border text-muted-foreground hover:border-primary/30",
                        state === "publishing" && "opacity-60 cursor-not-allowed",
                      )}
                    >
                      <div className="relative shrink-0 w-7 h-7">
                        <Image src={meta.image} alt={meta.name} width={24} height={24} className="rounded-full" />
                        {acc.accountPicture && (
                          // eslint-disable-next-line @next/next-image
                          <img src={acc.accountPicture} alt="" className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border border-white object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="block truncate">{acc.accountName}</span>
                        <span className="text-[10px] text-muted-foreground font-normal">
                          {meta.name}
                          {hasCap && <span className="text-green-600 font-semibold ml-1">· AI caption ready</span>}
                        </span>
                      </div>
                      {isSelected && <CheckCircle2 size={15} className="shrink-0 text-primary" />}
                    </button>
                  );
                })}
              </div>
              {selectedIds.length === 0 && (
                <p className="text-xs text-red-500 mt-2 font-medium">Select at least one account.</p>
              )}
            </div>

            {/* Caption */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold">Caption</p>
                {(() => {
                  const firstAcc = accounts.find((a) => selectedIds.includes(a.accountId));
                  return firstAcc && captions?.[firstAcc.platform] ? (
                    <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      AI-generated for {PLATFORM_META[firstAcc.platform]?.name ?? firstAcc.platform}
                    </span>
                  ) : null;
                })()}
              </div>
              <Textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={4}
                disabled={state === "publishing"}
                maxLength={500}
                className="resize-none text-sm rounded-xl"
                placeholder="Write your caption…"
              />
              <p className="text-xs text-muted-foreground mt-1 text-right">{caption.length}/500</p>
            </div>

            {/* When */}
            <div>
              <p className="text-sm font-bold mb-2">When</p>
              <div className="flex gap-2">
                {(["now", "schedule"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    disabled={state === "publishing"}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all",
                      mode === m ? "border-primary bg-primary/5" : "border-border text-muted-foreground hover:border-primary/30",
                    )}
                  >
                    {m === "now" ? <><Send size={14} /> Publish Now</> : <><Calendar size={14} /> Schedule</>}
                  </button>
                ))}
              </div>
              {mode === "schedule" && (
                <input
                  type="datetime-local"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="mt-2 w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              )}
            </div>

            {/* Publish button */}
            <button
              onClick={handlePublish}
              disabled={selectedIds.length === 0 || state === "publishing" || (mode === "schedule" && !scheduledDate)}
              className="w-full bg-primary text-primary-foreground font-extrabold py-3 rounded-xl shadow-md hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {state === "publishing" ? (
                <><Loader2 size={16} className="animate-spin" /> Publishing…</>
              ) : (
                <><Send size={16} />
                  {mode === "now"
                    ? `Publish to ${selectedIds.length} Account${selectedIds.length !== 1 ? "s" : ""}`
                    : "Schedule Post"}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
