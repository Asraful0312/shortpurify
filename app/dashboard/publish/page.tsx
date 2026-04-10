"use client";

import { useEffect, useState } from "react";
import { Send, CheckCircle2, AlertCircle, Loader2, Link2, X, ShieldAlert, Lock } from "lucide-react";
import { PublishModal } from "@/components/dashboard/publish-modal";
import { BlueskyConnectModal } from "@/components/dashboard/bluesky-connect-modal";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn, friendlyError } from "@/lib/utils";
import Image from "next/image";
import { useWorkspace } from "@/components/workspace-context";

/** Platforms available on the Starter (Free) plan. All others require Pro+. */
// Platforms that are live vs coming soon
const PLATFORMS = [
  { id: "youtube",   name: "YouTube Shorts",  image: "/icons/youtube-short.png",  live: true },
  { id: "bluesky",   name: "Bluesky",         image: "/icons/bluesky-icon.png", live: true },
  { id: "tiktok",    name: "TikTok",          image: "/icons/tik-tok.png", live: true },
  { id: "facebook",  name: "Facebook Pages",  image: "/icons/facebook.png", live: false },
  { id: "instagram", name: "Instagram Reels", image: "/icons/instagram.png", live: false },
  { id: "linkedin",  name: "LinkedIn",        image: "/icons/linkedin.png", live: false },
  { id: "threads",   name: "Threads",         image: "/icons/threads.png", live: false },
];

export default function PublishPage() {
  const { isAdmin, activeOrgId } = useWorkspace();

  const [publishOpen, setPublishOpen] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [blueskyConnectOpen, setBlueskyConnectOpen] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Plan limits
  const usage = useQuery(api.usage.getUsage, { workspaceId: activeOrgId ?? undefined });
  const tier = usage?.tier ?? "starter";
  const accountsPerPlatform = tier === "agency" ? Infinity : tier === "pro" ? 3 : 1;

  // Real-time list of connected accounts from Convex
  const accounts = useQuery(api.socialTokens.getAllTokens);
  const isLoading = accounts === undefined;

  const getFacebookAuthUrl = useAction(api.facebookActions.getAuthUrl);
  const disconnectFacebookPage = useAction(api.facebookActions.disconnectPage);
  const getYouTubeAuthUrl = useAction(api.youtubeActions.getAuthUrl);
  const disconnectYouTubeChannel = useAction(api.youtubeActions.disconnectChannel);
  const getTikTokAuthUrl = useAction(api.tiktokActions.getAuthUrl);
  const disconnectTikTokAccount = useAction(api.tiktokActions.disconnectAccount);
  const getThreadsAuthUrl = useAction(api.threadsActions.getAuthUrl);
  const disconnectThreadsAccount = useAction(api.threadsActions.disconnectAccount);
  const disconnectBlueskyAccount = useAction(api.blueskyActions.disconnectAccount);

  // Handle ?connected=... and ?error=... redirects from OAuth callbacks
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const connected = params.get("connected");
    const error = params.get("error");
    const detail = params.get("detail");

    if (connected) {
      const name = PLATFORMS.find((p) => p.id === connected)?.name ?? connected;
      setToast({ type: "success", msg: `${name} connected successfully!` });
      window.history.replaceState({}, "", window.location.pathname);
    } else if (error) {
      const denied = error?.endsWith("_denied") ?? false;
      const msg = denied
        ? `${error!.split("_")[0].charAt(0).toUpperCase() + error!.split("_")[0].slice(1)} connection was cancelled.`
        : detail ?? "Failed to connect. Please try again.";
      setToast({ type: "error", msg });
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleConnect = async (platformId: string) => {
    setConnecting(platformId);
    try {
      if (platformId === "facebook") {
        const { authUrl } = await getFacebookAuthUrl({});
        window.location.href = authUrl;
      } else if (platformId === "youtube") {
        const { authUrl } = await getYouTubeAuthUrl({});
        window.location.href = authUrl;
      } else if (platformId === "tiktok") {
        const { authUrl } = await getTikTokAuthUrl({});
        window.location.href = authUrl;
      } else if (platformId === "threads") {
        const { authUrl } = await getThreadsAuthUrl({});
        window.location.href = authUrl;
      } else if (platformId === "bluesky") {
        setBlueskyConnectOpen(true);
        setConnecting(null);
        return;
      }
    } catch (err) {
      setToast({ type: "error", msg: friendlyError(err, "Failed to get connect URL") });
      setConnecting(null);
    }
  };

  const handleDisconnect = async (platform: string, accountId: string, name: string) => {
    if (!confirm(`Disconnect "${name}"?`)) return;
    setDisconnecting(accountId);
    try {
      if (platform === "facebook") {
        await disconnectFacebookPage({ accountId });
      } else if (platform === "youtube") {
        await disconnectYouTubeChannel({ accountId });
      } else if (platform === "tiktok") {
        await disconnectTikTokAccount({ accountId });
      } else if (platform === "threads") {
        await disconnectThreadsAccount({ accountId });
      } else if (platform === "bluesky") {
        await disconnectBlueskyAccount({ accountId });
      }
    } catch (err) {
      setToast({ type: "error", msg: friendlyError(err, "Disconnect failed") });
    } finally {
      setDisconnecting(null);
    }
  };

  const hasAnyConnected = (accounts?.length ?? 0) > 0;

  // Group by platform — exclude removed platforms (x)
  const byPlatform: Record<string, typeof accounts> = {};
  for (const acc of (accounts ?? []).filter((a) => a.platform !== "x")) {
    if (!byPlatform[acc.platform]) byPlatform[acc.platform] = [];
    byPlatform[acc.platform]!.push(acc);
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full min-h-full flex flex-col gap-8">

      {/* Toast */}
      {toast && (
        <div className={cn(
          "fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-lg text-sm font-semibold border animate-in slide-in-from-top-2",
          toast.type === "success"
            ? "bg-green-50 border-green-200 text-green-800"
            : "bg-red-50 border-red-200 text-red-800",
        )}>
          {toast.type === "success"
            ? <CheckCircle2 size={16} className="text-green-600 shrink-0" />
            : <AlertCircle size={16} className="text-red-500 shrink-0" />}
          {toast.msg}
          <button onClick={() => setToast(null)} className="ml-1 opacity-60 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Publish Hub</h1>
          <p className="text-muted-foreground mt-1">Connect your social accounts and publish clips directly.</p>
        </div>

      </div>

      {/* Platform grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-extrabold text-lg">Social Accounts</h2>
          {isLoading && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 size={12} className="animate-spin" /> Loading…
            </div>
          )}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PLATFORMS.map((p) => {
            const connected = byPlatform[p.id] ?? [];
            const isConnecting = connecting === p.id;
            const atLimit = accountsPerPlatform !== Infinity && connected.length >= accountsPerPlatform;
            const maintenance = (p as any).maintenance === true;

            return (
                  <div
                    key={p.id}
                    className={cn(
                      "bg-white border rounded-2xl p-4 shadow-sm flex flex-col gap-3 transition-colors",
                      (!p.live || maintenance) && "opacity-60",
                      connected.length > 0 ? "border-green-200 bg-green-50/30" : "border-border",
                    )}
                  >
                    {/* Platform header */}
                    <div className="flex items-center gap-2.5">
                      <Image className="size-5" alt={p.name} src={p.image} width={20} height={20} />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{p.name}</p>
                        {isLoading ? (
                          <div className="h-3 w-16 bg-secondary animate-pulse rounded mt-0.5" />
                        ) : !p.live ? (
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Coming soon</p>
                        ) : maintenance ? (
                          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Temporarily unavailable</p>
                        ) : connected.length > 0 ? (
                          <p className="text-xs text-green-600 font-semibold flex items-center gap-1">
                            <CheckCircle2 size={10} />
                            {connected.length}{accountsPerPlatform !== Infinity ? `/${accountsPerPlatform}` : ""} account{connected.length !== 1 ? "s" : ""} connected
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground">Not connected</p>
                        )}
                      </div>
                    </div>

                    {/* Connected account chips */}
                    {connected.length > 0 && (
                      <div className="flex flex-col gap-1">
                        {connected.map((acc) => (
                          <div key={acc.accountId} className="flex items-center gap-2 bg-white border border-green-200 rounded-lg px-2 py-1">
                            {acc.accountPicture && (
                              // eslint-disable-next-line @next/next-image
                              <img src={acc.accountPicture} alt="" className="w-5 h-5 rounded-full object-cover shrink-0" />
                            )}
                            <span className="text-xs font-semibold truncate flex-1">{acc.accountName}</span>
                            {/* Only admins/owners can disconnect */}
                            {isAdmin && (
                              <button
                                onClick={() => handleDisconnect(acc.platform, acc.accountId, acc.accountName)}
                                disabled={disconnecting === acc.accountId}
                                className="shrink-0 text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-50"
                                title="Disconnect"
                              >
                                {disconnecting === acc.accountId
                                  ? <Loader2 size={12} className="animate-spin" />
                                  : <X size={12} />}
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* TikTok public account warning */}
                    {p.id === "tiktok" && connected.length > 0 && (
                      <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 font-semibold">
                        ⚠️ TikTok only allows publishing to <strong>private accounts</strong> via the API. Make sure your TikTok account is set to private before publishing.
                      </p>
                    )}

                    {/* Maintenance notice */}
                    {maintenance && (
                      <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-center font-semibold">
                        Back soon — under maintenance
                      </p>
                    )}

                    {/* Connect button — admins/owners only, not at limit */}
                    {p.live && !maintenance && isAdmin && !atLimit && (
                      <button
                        onClick={() => handleConnect(p.id)}
                        disabled={isConnecting || isLoading}
                        className={cn(
                          "flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95 disabled:opacity-50",
                          connected.length > 0
                            ? "border-green-200 text-green-700 hover:bg-green-100"
                            : "border-primary/30 text-primary hover:bg-primary/5",
                        )}
                      >
                        {isConnecting
                          ? <><Loader2 size={12} className="animate-spin" /> Connecting…</>
                          : <><Link2 size={12} /> {connected.length > 0 ? "Add another account" : "Connect"}</>}
                      </button>
                    )}

                    {/* At account limit */}
                    {p.live && !maintenance && isAdmin && atLimit && (
                      <a
                        href="/dashboard/billing"
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-amber-300 text-amber-700 hover:bg-amber-50 transition-all"
                      >
                        <Lock size={11} /> Upgrade for more accounts
                      </a>
                    )}

                    {/* Members: show lock hint instead of connect */}
                    {p.live && !maintenance && !isAdmin && connected.length === 0 && (
                      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground bg-secondary/60 rounded-xl px-3 py-1.5">
                        <ShieldAlert size={11} /> Admin required to connect
                      </div>
                    )}
                  </div>
            );
          })}
        </div>
      </div>

      {/* Empty state */}
      {!isLoading && !hasAnyConnected && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-3">
          <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-extrabold text-amber-800">No accounts connected yet</p>
            <p className="text-sm text-amber-700 mt-0.5">
              Click <strong>Connect</strong> on YouTube Shorts above to link your Pages and start publishing clips.
            </p>
          </div>
        </div>
      )}

      <PublishModal open={publishOpen} onClose={() => setPublishOpen(false)} accounts={accounts ?? []} isLoadingAccounts={accounts === undefined} canSchedule={tier !== "starter"} />
      <BlueskyConnectModal
        open={blueskyConnectOpen}
        onClose={() => setBlueskyConnectOpen(false)}
        onConnected={(handle) => {
          setBlueskyConnectOpen(false);
          setToast({ type: "success", msg: `@${handle} connected successfully!` });
        }}
      />
    </div>
  );
}
