"use client";

import { useEffect, useState } from "react";
import { Send, Calendar, CheckCircle2, X, Loader2, AlertCircle, Link2, Clock } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Image from "next/image";

const PLATFORM_META: Record<string, { name: string; image: string }> = {
  facebook:  { name: "Facebook",        image: "/icons/facebook.png" },
  instagram: { name: "Instagram Reels", image: "/icons/instagram.png" },
  youtube:   { name: "YouTube Shorts",  image: "/icons/youtube.png" },
  x:         { name: "X / Twitter",     image: "/icons/twitter.png" },
  tiktok:    { name: "TikTok",          image: "/icons/tik-tok.png" },
  linkedin:  { name: "LinkedIn",        image: "/icons/linkedin.png" },
  threads:   { name: "Threads",         image: "/icons/threads.png" },
  bluesky:   { name: "Bluesky",         image: "/icons/bluesky-icon.png" },
};

type SafeToken = {
  id: Id<"socialTokens">;
  platform: string;
  accountId: string;
  accountName: string;
  accountPicture?: string;
  isExpired: boolean;
};

type AccountStatus = {
  phase: "idle" | "publishing" | "success" | "error";
  postId?: string;
  error?: string;
};

interface PublishModalProps {
  open: boolean;
  onClose: () => void;
  accounts: SafeToken[];
  isLoadingAccounts?: boolean;
  clipTitle?: string;
  clipUrl?: string;
  clipKey?: string;
  outputId?: string;
  defaultCaption?: string;
  /** Per-platform AI captions keyed by platform id */
  captions?: Record<string, string>;
  onPublished?: (successCount: number) => void;
}

export function PublishModal({
  open,
  onClose,
  accounts,
  isLoadingAccounts,
  clipTitle,
  clipUrl,
  clipKey,
  outputId,
  defaultCaption,
  captions,
  onPublished,
}: PublishModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [platformCaptions, setPlatformCaptions] = useState<Record<string, string>>({});
  const [accountStatuses, setAccountStatuses] = useState<Record<string, AccountStatus>>({});
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [mode, setMode] = useState<"now" | "schedule">("now");
  const [scheduledDate, setScheduledDate] = useState("");

  const publishYouTube  = useAction(api.youtubeActions.publishClip);
  const publishTikTok   = useAction(api.tiktokActions.publishClip);
  const publishX        = useAction(api.xActions.publishClip);
  const publishBluesky  = useAction(api.blueskyActions.publishClip);
  const publishFacebook = useAction(api.facebookActions.publishClip);
  const schedulePost    = useMutation(api.scheduledPublish.schedulePost);

  // Show all accounts — publishing actions handle token refresh automatically.
  // Expired tokens are shown with a warning but remain selectable.
  const activeAccounts = accounts;

  // Group by platform
  const byPlatform: Record<string, SafeToken[]> = {};
  for (const acc of activeAccounts) {
    if (!byPlatform[acc.platform]) byPlatform[acc.platform] = [];
    byPlatform[acc.platform].push(acc);
  }
  const platforms = Object.keys(byPlatform);

  // Initialize state when modal opens AND accounts have loaded.
  // Depends on both `open` and `isLoadingAccounts` so it re-runs once
  // accounts arrive (common when modal opens before query resolves).
  useEffect(() => {
    if (!open || isLoadingAccounts) return;
    setSelectedIds(new Set(activeAccounts.map((a) => a.accountId)));
    const caps: Record<string, string> = {};
    for (const acc of activeAccounts) {
      if (!(acc.platform in caps)) {
        caps[acc.platform] = captions?.[acc.platform] ?? defaultCaption ?? "";
      }
    }
    setPlatformCaptions(caps);
    setAccountStatuses({});
    setIsPublishing(false);
    setIsDone(false);
  }, [open, isLoadingAccounts]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleAccount = (accountId: string) => {
    if (isPublishing) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(accountId) ? next.delete(accountId) : next.add(accountId);
      return next;
    });
  };

  const togglePlatform = (platform: string) => {
    if (isPublishing) return;
    const accs = byPlatform[platform] ?? [];
    const allSelected = accs.every((a) => selectedIds.has(a.accountId));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      accs.forEach((a) => (allSelected ? next.delete(a.accountId) : next.add(a.accountId)));
      return next;
    });
  };

  const handlePublish = async () => {
    if (!outputId) return;
    const selected = activeAccounts.filter((a) => selectedIds.has(a.accountId));
    if (selected.length === 0) return;

    // ── Schedule mode: queue each account via Convex scheduler ──────────────
    if (mode === "schedule" && scheduledDate) {
      const scheduledAt = new Date(scheduledDate).getTime();
      if (scheduledAt < Date.now() + 5 * 60 * 1000) return; // past-time guard
      setIsPublishing(true);
      setAccountStatuses(
        Object.fromEntries(selected.map((a) => [a.accountId, { phase: "publishing" as const }]))
      );
      let successCount = 0;
      await Promise.allSettled(
        selected.map(async (acc) => {
          const caption = platformCaptions[acc.platform] ?? "";
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (schedulePost as any)({
              outputId,
              platform: acc.platform,
              accountId: acc.accountId,
              caption,
              scheduledAt,
              clipTitle: clipTitle ?? "Short Clip",
            });
            successCount++;
            setAccountStatuses((prev) => ({
              ...prev,
              [acc.accountId]: { phase: "success", postId: "scheduled" },
            }));
          } catch (err) {
            setAccountStatuses((prev) => ({
              ...prev,
              [acc.accountId]: { phase: "error", error: err instanceof Error ? err.message : "Failed" },
            }));
          }
        })
      );
      setIsPublishing(false);
      setIsDone(true);
      onPublished?.(successCount);
      return;
    }

    // ── Publish now mode ─────────────────────────────────────────────────────
    setIsPublishing(true);
    setAccountStatuses(
      Object.fromEntries(selected.map((a) => [a.accountId, { phase: "publishing" as const }]))
    );

    let successCount = 0;

    await Promise.allSettled(
      selected.map(async (acc) => {
        const caption = platformCaptions[acc.platform] ?? "";
        try {
          let postId: string | undefined;

          if (acc.platform === "youtube") {
            const r = await publishYouTube({
              outputId: outputId as Id<"outputs">,
              accountId: acc.accountId,
              clipUrl: clipUrl ?? "",
              clipKey,
              caption,
              title: clipTitle ?? "Short Clip",
            });
            postId = r.videoId;
          } else if (acc.platform === "tiktok") {
            const r = await publishTikTok({
              outputId: outputId as Id<"outputs">,
              accountId: acc.accountId,
              clipUrl: clipUrl ?? "",
              clipKey,
              caption,
              title: clipTitle ?? "Short Clip",
            });
            postId = r.publishId;
          } else if (acc.platform === "x") {
            const r = await publishX({
              outputId: outputId as Id<"outputs">,
              accountId: acc.accountId,
              clipUrl: clipUrl ?? "",
              clipKey,
              caption,
              title: clipTitle ?? "Short Clip",
            });
            postId = r.tweetId;
          } else if (acc.platform === "bluesky") {
            const r = await publishBluesky({
              outputId: outputId as Id<"outputs">,
              accountId: acc.accountId,
              clipUrl: clipUrl ?? "",
              clipKey,
              caption,
              title: clipTitle ?? "Short Clip",
            });
            postId = r.postId;
          } else if (acc.platform === "facebook") {
            const r = await publishFacebook({
              outputId: outputId as Id<"outputs">,
              accountId: acc.accountId,
              clipUrl: clipUrl ?? "",
              clipKey,
              caption,
            });
            postId = r.postId;
          } else {
            throw new Error(
              `${PLATFORM_META[acc.platform]?.name ?? acc.platform} is not available yet`
            );
          }

          successCount++;
          setAccountStatuses((prev) => ({
            ...prev,
            [acc.accountId]: { phase: "success", postId },
          }));
        } catch (err) {
          setAccountStatuses((prev) => ({
            ...prev,
            [acc.accountId]: {
              phase: "error",
              error: err instanceof Error ? err.message : "Failed",
            },
          }));
        }
      })
    );

    setIsPublishing(false);
    setIsDone(true);
    onPublished?.(successCount);
  };

  const handleClose = () => {
    if (isPublishing) return;
    setSelectedIds(new Set());
    setAccountStatuses({});
    setIsPublishing(false);
    setIsDone(false);
    onClose();
  };

  const selectedCount = activeAccounts.filter((a) => selectedIds.has(a.accountId)).length;
  const successCount = Object.values(accountStatuses).filter((s) => s.phase === "success").length;
  const errorCount = Object.values(accountStatuses).filter((s) => s.phase === "error").length;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-border flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border shrink-0">
          <div>
            <h2 className="text-lg font-extrabold">Publish Clip</h2>
            {clipTitle && (
              <p className="text-sm text-muted-foreground mt-0.5 truncate max-w-xs">{clipTitle}</p>
            )}
          </div>
          <button
            onClick={handleClose}
            disabled={isPublishing}
            className="p-2 rounded-xl hover:bg-secondary transition-colors disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1">

          {/* Loading accounts */}
          {isLoadingAccounts && (
            <div className="p-10 flex flex-col items-center gap-3 text-muted-foreground">
              <Loader2 size={22} className="animate-spin" />
              <p className="text-sm">Loading connected accounts…</p>
            </div>
          )}

          {/* No accounts */}
          {!isLoadingAccounts && activeAccounts.length === 0 && (
            <div className="p-8 flex flex-col items-center gap-4 text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <AlertCircle size={24} className="text-amber-600" />
              </div>
              <div>
                <p className="font-extrabold text-base">No accounts connected</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Connect your social accounts in the Publish Hub first.
                </p>
              </div>
              <a
                href="/dashboard/publish"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors"
              >
                <Link2 size={14} /> Go to Publish Hub
              </a>
            </div>
          )}

          {/* Done summary */}
          {isDone && (
            <div className="p-6 flex flex-col gap-3">
              <div className="flex items-center gap-2 mb-1">
                {errorCount === 0 ? (
                  <CheckCircle2 size={20} className="text-green-600" />
                ) : successCount > 0 ? (
                  <AlertCircle size={20} className="text-amber-500" />
                ) : (
                  <AlertCircle size={20} className="text-red-500" />
                )}
                <p className="font-extrabold text-base">
                  {errorCount === 0
                    ? mode === "schedule"
                      ? `Scheduled for ${successCount} account${successCount !== 1 ? "s" : ""}!`
                      : `Published to ${successCount} account${successCount !== 1 ? "s" : ""}!`
                    : successCount > 0
                    ? `${successCount} succeeded, ${errorCount} failed`
                    : mode === "schedule" ? "Scheduling failed" : "Publishing failed"}
                </p>
              </div>
              {platforms.map((platform) => {
                const accs = (byPlatform[platform] ?? []).filter(
                  (a) => accountStatuses[a.accountId]
                );
                if (accs.length === 0) return null;
                const meta = PLATFORM_META[platform] ?? { name: platform, image: "" };
                return (
                  <div key={platform} className="space-y-1">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
                      <Image src={meta.image} alt={meta.name} width={13} height={13} className="opacity-60" />
                      {meta.name}
                    </div>
                    {accs.map((acc) => {
                      const st = accountStatuses[acc.accountId];
                      return (
                        <div
                          key={acc.accountId}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-xl text-sm",
                            st?.phase === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                          )}
                        >
                          {st?.phase === "success" ? (
                            <CheckCircle2 size={14} className="shrink-0" />
                          ) : (
                            <AlertCircle size={14} className="shrink-0" />
                          )}
                          <span className="font-semibold truncate flex-1">{acc.accountName}</span>
                          {st?.phase === "error" ? (
                            <span className="text-xs shrink-0">Failed</span>
                          ) : (
                            <span className="text-xs font-mono shrink-0">{st?.postId?.slice(0, 12)}…</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
              <button
                onClick={handleClose}
                className="mt-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors self-center"
              >
                Done
              </button>
            </div>
          )}

          {/* Form */}
          {!isLoadingAccounts && activeAccounts.length > 0 && !isDone && (
            <div className="p-5 space-y-4">

              {/* Platform sections */}
              {platforms.map((platform) => {
                const accs = byPlatform[platform] ?? [];
                const meta = PLATFORM_META[platform] ?? { name: platform, image: "" };
                const allSelected = accs.every((a) => selectedIds.has(a.accountId));
                const hasAiCaption = !!captions?.[platform];

                return (
                  <div key={platform} className="rounded-2xl border border-border overflow-hidden">
                    {/* Platform header */}
                    <div className="flex items-center gap-2.5 px-4 py-2.5 bg-secondary/40">
                      <Image src={meta.image} alt={meta.name} className={platform === "x" ? "size-3" : ""} width={16} height={16} />
                      <span className="font-bold text-sm flex-1">{meta.name}</span>
                      {hasAiCaption && (
                        <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                          AI Caption
                        </span>
                      )}
                      <button
                        onClick={() => togglePlatform(platform)}
                        className={cn(
                          "text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors",
                          allSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                        )}
                      >
                        {allSelected ? "Deselect all" : "Select all"}
                      </button>
                    </div>

                    {/* Per-platform caption */}
                    <div className="px-4 py-3 border-b border-border bg-white">
                      <Textarea
                        value={platformCaptions[platform] ?? ""}
                        onChange={(e) =>
                          setPlatformCaptions((prev) => ({ ...prev, [platform]: e.target.value }))
                        }
                        rows={3}
                        disabled={isPublishing}
                        placeholder={`Caption for ${meta.name}…`}
                        className="resize-none text-sm rounded-xl"
                      />
                      <p className="text-xs text-muted-foreground mt-1 text-right">
                        {(platformCaptions[platform] ?? "").length} chars
                      </p>
                    </div>

                    {/* Account rows */}
                    <div className="divide-y divide-border">
                      {accs.map((acc) => {
                        const isSelected = selectedIds.has(acc.accountId);
                        const st = accountStatuses[acc.accountId];
                        return (
                          <button
                            key={acc.accountId}
                            onClick={() => toggleAccount(acc.accountId)}
                            disabled={isPublishing}
                            className={cn(
                              "flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left",
                              isSelected && !isPublishing ? "bg-primary/5" : "bg-white",
                              !isPublishing && "hover:bg-secondary/40"
                            )}
                          >
                            {acc.accountPicture ? (
                              // eslint-disable-next-line @next/next-image
                              <img
                                src={acc.accountPicture}
                                alt=""
                                className="w-7 h-7 rounded-full object-cover shrink-0"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs font-bold shrink-0">
                                {acc.accountName.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className="font-semibold flex-1 truncate">{acc.accountName}</span>
                            {acc.isExpired && !st && (
                              <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded shrink-0">
                                token expired
                              </span>
                            )}

                            {/* Per-account publish status */}
                            {st?.phase === "publishing" && (
                              <Loader2 size={15} className="animate-spin text-primary shrink-0" />
                            )}
                            {st?.phase === "success" && (
                              <CheckCircle2 size={15} className="text-green-600 shrink-0" />
                            )}
                            {st?.phase === "error" && (
                              <div className="flex items-center gap-1 text-red-500 shrink-0" title={st.error}>
                                <AlertCircle size={14} />
                                <span className="text-xs">Failed</span>
                              </div>
                            )}
                            {!st && (
                              <div
                                className={cn(
                                  "w-4 h-4 rounded border-2 shrink-0 transition-colors flex items-center justify-center",
                                  isSelected
                                    ? "border-primary bg-primary"
                                    : "border-muted-foreground/30"
                                )}
                              >
                                {isSelected && (
                                  <svg
                                    viewBox="0 0 10 8"
                                    className="w-2.5 h-2.5 fill-none stroke-white"
                                    strokeWidth={2}
                                  >
                                    <polyline points="1,4 3.5,6.5 9,1" />
                                  </svg>
                                )}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {selectedCount === 0 && (
                <p className="text-xs text-red-500 font-medium text-center">
                  Select at least one account.
                </p>
              )}

              {/* When */}
              <div>
                <p className="text-sm font-bold mb-2">When</p>
                <div className="flex gap-2">
                  {(["now", "schedule"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      disabled={isPublishing}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all",
                        mode === m
                          ? "border-primary bg-primary/5"
                          : "border-border text-muted-foreground hover:border-primary/30"
                      )}
                    >
                      {m === "now" ? (
                        <><Send size={14} /> Publish Now</>
                      ) : (
                        <><Calendar size={14} /> Schedule</>
                      )}
                    </button>
                  ))}
                </div>
                {mode === "schedule" && (
                  <SchedulePicker value={scheduledDate} onChange={setScheduledDate} />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer — Publish button (sticky at bottom) */}
        {!isLoadingAccounts && activeAccounts.length > 0 && !isDone && (
          <div className="px-5 pb-5 pt-3 shrink-0 border-t border-border">
            <button
              onClick={handlePublish}
              disabled={
                selectedCount === 0 ||
                isPublishing ||
                (mode === "schedule" && !scheduledDate) ||
                (mode === "schedule" && !!scheduledDate && new Date(scheduledDate).getTime() < Date.now() + 5 * 60 * 1000)
              }
              className="w-full bg-primary text-primary-foreground font-extrabold py-3 rounded-xl shadow-md hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPublishing ? (
                <><Loader2 size={16} className="animate-spin" /> Publishing…</>
              ) : (
                <>
                  <Send size={16} />
                  {mode === "now"
                    ? `Publish to ${selectedCount} Account${selectedCount !== 1 ? "s" : ""}`
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

// ─── Schedule Picker ──────────────────────────────────────────────────────────

function toLocal(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function SchedulePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const dateStr = value.slice(0, 10);
  const timeStr = value.slice(11, 16);

  const now = new Date();
  const minMs = Date.now() + 5 * 60 * 1000; // 5 min from now
  const todayStr = toLocal(now).slice(0, 10);
  const isToday = dateStr === todayStr;

  // Minimum time when today is selected: now + 5 min rounded up to next minute
  const minTimeForToday = (() => {
    const d = new Date(minMs);
    d.setSeconds(0, 0);
    return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  })();

  const isPast = !!value && new Date(value).getTime() < minMs;

  const setDate = (d: string) => {
    if (!d) { onChange(""); return; }
    const combined = `${d}T${timeStr || "09:00"}`;
    onChange(combined);
  };
  const setTime = (t: string) => {
    if (!dateStr) return;
    onChange(`${dateStr}T${t}`);
  };

  const preset = (fn: () => Date) => {
    const d = fn();
    d.setSeconds(0, 0);
    onChange(toLocal(d));
  };

  const presets: { label: string; fn: () => Date }[] = [
    { label: "In 1 hour",  fn: () => new Date(Date.now() + 1 * 60 * 60 * 1000) },
    { label: "In 3 hours", fn: () => new Date(Date.now() + 3 * 60 * 60 * 1000) },
    {
      label: "Tomorrow 9am",
      fn: () => { const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(9, 0); return d; },
    },
    {
      label: "Tomorrow 3pm",
      fn: () => { const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(15, 0); return d; },
    },
    {
      label: "Next week",
      fn: () => { const d = new Date(); d.setDate(d.getDate() + 7); d.setHours(9, 0); return d; },
    },
  ];

  const minDate = toLocal(new Date(minMs)).slice(0, 10);

  const formatted = value && !isPast
    ? new Date(value).toLocaleString(undefined, {
        weekday: "long",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="mt-3 space-y-3">
      {/* Quick presets */}
      <div className="flex flex-wrap gap-1.5">
        {presets.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => preset(p.fn)}
            className="text-xs font-semibold px-3 py-1.5 rounded-full border border-border bg-secondary/50 hover:bg-primary/10 hover:border-primary/40 hover:text-primary transition-colors"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Date + Time inputs */}
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest mb-1.5 block">
            Date
          </label>
          <input
            type="date"
            value={dateStr}
            min={minDate}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-border rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
          />
        </div>
        <div className="flex-1">
          <label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest mb-1.5 block">
            Time
          </label>
          <input
            type="time"
            value={timeStr}
            min={isToday ? minTimeForToday : undefined}
            onChange={(e) => setTime(e.target.value)}
            className={cn(
              "w-full border rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 bg-white",
              isPast
                ? "border-red-400 focus:ring-red-300 text-red-600"
                : "border-border focus:ring-primary/30"
            )}
          />
        </div>
      </div>

      {/* Past-time error */}
      {isPast && (
        <div className="flex items-center gap-2 px-3.5 py-2.5 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle size={13} className="text-red-500 shrink-0" />
          <span className="text-sm font-semibold text-red-600">
            Please choose a time at least 5 minutes in the future.
          </span>
        </div>
      )}

      {/* Formatted preview */}
      {formatted && (
        <div className="flex items-center gap-2 px-3.5 py-2.5 bg-primary/5 border border-primary/20 rounded-xl">
          <Clock size={13} className="text-primary shrink-0" />
          <span className="text-sm font-semibold text-primary">{formatted}</span>
        </div>
      )}
    </div>
  );
}
