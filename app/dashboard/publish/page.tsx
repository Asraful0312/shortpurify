"use client";

import { useEffect, useRef, useState } from "react";
import { Send, CheckCircle2, AlertCircle, Loader2, Link2, X, ShieldAlert, RefreshCw, Crown } from "lucide-react";
import { PublishModal } from "@/components/dashboard/publish-modal";
import { BlueskyConnectModal } from "@/components/dashboard/bluesky-connect-modal";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn, friendlyError } from "@/lib/utils";
import Image from "next/image";
import { useWorkspace } from "@/components/workspace-context";

/** Native platforms — available to all users. */
const NATIVE_PLATFORMS = [
  { id: "youtube", name: "YouTube Shorts", image: "/icons/youtube-short.png" },
  { id: "bluesky", name: "Bluesky",        image: "/icons/bluesky-icon.png"  },
];

/** Platforms accessible via Zernio — Pro/Agency only. */
const ZERNIO_PLATFORMS = [
  { id: "tiktok",    name: "TikTok",          image: "/icons/tik-tok.png"   },
  { id: "instagram", name: "Instagram Reels", image: "/icons/instagram.png" },
  { id: "linkedin",  name: "LinkedIn",        image: "/icons/linkedin.png"  },
  { id: "facebook",  name: "Facebook",        image: "/icons/facebook.png"  },
  { id: "threads",   name: "Threads",         image: "/icons/threads.png"   },
  { id: "twitter",   name: "X (Twitter)",     image: "/icons/twitter.png"   },
];

export default function PublishPage() {
  const { isAdmin, activeOrgId } = useWorkspace();

  const [publishOpen, setPublishOpen] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [syncingZernio, setSyncingZernio] = useState(false);
  const [blueskyConnectOpen, setBlueskyConnectOpen] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const syncInProgressRef = useRef(false);
  const autoSyncedRef = useRef(false);

  // Plan tier — use getDirectWorkspaceTier per CLAUDE.md (matches sidebar)
  const tier = useQuery(api.usage.getDirectWorkspaceTier, { workspaceId: activeOrgId ?? undefined });
  const isFreePlan = !tier || tier === "starter";
  const accountsPerPlatform = tier === "agency" ? Infinity : tier === "pro" ? 3 : 1;

  // Native accounts (socialTokens)
  const nativeAccounts = useQuery(api.socialTokens.getAllTokens);
  // Zernio accounts
  const zernioAccountsRaw = useQuery(api.zernio.getMyAccounts);

  const isLoading = nativeAccounts === undefined || zernioAccountsRaw === undefined;

  const getFacebookAuthUrl   = useAction(api.facebookActions.getAuthUrl);
  const getYouTubeAuthUrl    = useAction(api.youtubeActions.getAuthUrl);
  const getThreadsAuthUrl    = useAction(api.threadsActions.getAuthUrl);
  const disconnectFacebook   = useAction(api.facebookActions.disconnectPage);
  const disconnectYouTube    = useAction(api.youtubeActions.disconnectChannel);
  const disconnectThreads    = useAction(api.threadsActions.disconnectAccount);
  const disconnectBluesky    = useAction(api.blueskyActions.disconnectAccount);
  const getZernioConnectUrl  = useAction(api.zernioActions.getConnectUrl);
  const syncZernioAccounts   = useAction(api.zernioActions.syncAccounts);
  const disconnectZernio     = useAction(api.zernioActions.disconnectAccount);

  // Handle ?connected=... and ?error=... redirects from native OAuth callbacks
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const connected = params.get("connected");
    const error = params.get("error");
    const detail = params.get("detail");

    if (connected) {
      const name = NATIVE_PLATFORMS.find((p) => p.id === connected)?.name ?? connected;
      setToast({ type: "success", msg: `${name} connected successfully!` });
      window.history.replaceState({}, "", window.location.pathname);
    } else if (error) {
      const denied = error?.endsWith("_denied") ?? false;
      const msg = denied
        ? `Connection was cancelled.`
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

  // Silent auto-sync once tier is known — reconciles accounts if the user
  // disconnected directly from Zernio's dashboard without going through ShortPurify.
  useEffect(() => {
    if (isFreePlan || autoSyncedRef.current) return;
    autoSyncedRef.current = true;
    syncZernioAccounts({}).catch(() => {/* silent */});
  }, [isFreePlan]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Native connect ──────────────────────────────────────────────────────────
  const handleNativeConnect = async (platformId: string) => {
    setConnecting(platformId);
    try {
      let authUrl: string;
      if (platformId === "youtube")      { const r = await getYouTubeAuthUrl({});  authUrl = r.authUrl; }
      else if (platformId === "facebook"){ const r = await getFacebookAuthUrl({}); authUrl = r.authUrl; }
      else if (platformId === "threads") { const r = await getThreadsAuthUrl({});  authUrl = r.authUrl; }
      else if (platformId === "bluesky") {
        setBlueskyConnectOpen(true);
        setConnecting(null);
        return;
      } else {
        setConnecting(null);
        return;
      }
      window.location.href = authUrl;
    } catch (err) {
      setToast({ type: "error", msg: friendlyError(err, "Failed to get connect URL") });
      setConnecting(null);
    }
  };

  const handleNativeDisconnect = async (platform: string, accountId: string, name: string) => {
    if (!confirm(`Disconnect "${name}"?`)) return;
    setDisconnecting(accountId);
    try {
      if (platform === "youtube")      await disconnectYouTube({ accountId });
      else if (platform === "facebook")await disconnectFacebook({ accountId });
      else if (platform === "threads") await disconnectThreads({ accountId });
      else if (platform === "bluesky") await disconnectBluesky({ accountId });
    } catch (err) {
      setToast({ type: "error", msg: friendlyError(err, "Disconnect failed") });
    } finally {
      setDisconnecting(null);
    }
  };

  // ── Zernio connect (popup) ──────────────────────────────────────────────────
  const handleZernioConnect = async (platformId: string) => {
    setConnecting(`zernio-${platformId}`);
    try {
      const { authUrl } = await getZernioConnectUrl({ platform: platformId });
      setConnecting(null);
      const popup = window.open(authUrl, "zernio-oauth", "width=600,height=700,scrollbars=yes");
      if (!popup) {
        window.location.href = authUrl;
        return;
      }
      setToast({ type: "success", msg: "Complete the connection in the popup — your account will appear automatically in a few seconds." });
    } catch (err) {
      setToast({ type: "error", msg: friendlyError(err, "Failed to get connect URL") });
      setConnecting(null);
    }
  };

  const handleZernioDisconnect = async (accountId: string, name: string) => {
    if (!confirm(`Disconnect "${name}"?`)) return;
    setDisconnecting(accountId);
    try {
      await disconnectZernio({ accountId });
    } catch (err) {
      setToast({ type: "error", msg: friendlyError(err, "Disconnect failed") });
    } finally {
      setDisconnecting(null);
    }
  };

  const handleRefreshZernio = async () => {
    if (syncInProgressRef.current) return;
    syncInProgressRef.current = true;
    setSyncingZernio(true);
    try {
      const { synced } = await syncZernioAccounts({});
      setToast({ type: "success", msg: `${synced} account${synced !== 1 ? "s" : ""} synced.` });
    } catch (err) {
      setToast({ type: "error", msg: friendlyError(err, "Refresh failed") });
    } finally {
      setSyncingZernio(false);
      syncInProgressRef.current = false;
    }
  };

  // ── Derived data ────────────────────────────────────────────────────────────
  const nativeByPlatform: Record<string, typeof nativeAccounts> = {};
  for (const acc of (nativeAccounts ?? []).filter((a) => a.platform !== "x")) {
    if (!nativeByPlatform[acc.platform]) nativeByPlatform[acc.platform] = [];
    nativeByPlatform[acc.platform]!.push(acc);
  }

  const zernioByPlatform: Record<string, typeof zernioAccountsRaw> = {};
  for (const acc of zernioAccountsRaw ?? []) {
    if (!zernioByPlatform[acc.platform]) zernioByPlatform[acc.platform] = [];
    zernioByPlatform[acc.platform]!.push(acc);
  }

  const totalZernioAccounts = (zernioAccountsRaw ?? []).length;
  const zernioLimit = tier === "agency" ? null : tier === "pro" ? 2 : 0;
  const atZernioLimit = zernioLimit !== null && totalZernioAccounts >= zernioLimit;

  const hasAnyConnected =
    (nativeAccounts?.length ?? 0) > 0 || (zernioAccountsRaw?.length ?? 0) > 0;

  // Merged accounts list for publish modal (both native + Zernio)
  const allAccounts = [
    ...(nativeAccounts ?? []).map((a) => ({ ...a, source: "native" as const })),
    ...(zernioAccountsRaw ?? []).map((a) => ({
      id: a.id,
      platform: a.platform,
      accountId: a.accountId,
      accountName: a.accountName,
      accountPicture: a.accountPicture,
      isExpired: false,
      source: "zernio" as const,
    })),
  ];

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
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Publish Hub</h1>
        <p className="text-muted-foreground mt-1">Connect your social accounts and publish clips directly.</p>
      </div>

      {/* ── Native platforms section ─────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-extrabold text-lg">Social Accounts</h2>
          {isLoading && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 size={12} className="animate-spin" /> Loading…
            </div>
          )}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {NATIVE_PLATFORMS.map((p) => {
            const connected = nativeByPlatform[p.id] ?? [];
            const isConnecting = connecting === p.id;
            const atLimit = accountsPerPlatform !== Infinity && connected.length >= accountsPerPlatform;

            return (
              <div
                key={p.id}
                className={cn(
                  "bg-white border rounded-2xl p-4 shadow-sm flex flex-col gap-3 transition-colors",
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
                        {isAdmin && (
                          <button
                            onClick={() => handleNativeDisconnect(acc.platform, acc.accountId, acc.accountName)}
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

                {/* Connect button */}
                {isAdmin && !atLimit && (
                  <button
                    onClick={() => handleNativeConnect(p.id)}
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
                      : <><Link2 size={12} /> {connected.length > 0 ? "Add another" : "Connect"}</>}
                  </button>
                )}

                {isAdmin && atLimit && (
                  <a href="/dashboard/billing" className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-amber-300 text-amber-700 hover:bg-amber-50 transition-all">
                    Upgrade for more accounts
                  </a>
                )}

                {!isAdmin && connected.length === 0 && (
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground bg-secondary/60 rounded-xl px-3 py-1.5">
                    <ShieldAlert size={11} /> Admin required to connect
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Zernio platforms section (Pro/Agency) ───────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <h2 className="font-extrabold text-lg">Pro Platforms</h2>
            <span className="text-[10px] font-extrabold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
              <Crown size={9} /> PRO
            </span>
          </div>
          {!isFreePlan && isAdmin && (
            <button
              onClick={handleRefreshZernio}
              disabled={syncingZernio}
              className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              title="Sync accounts from Zernio"
            >
              <RefreshCw size={12} className={cn(syncingZernio && "animate-spin")} />
              {syncingZernio ? "Syncing…" : "Refresh"}
            </button>
          )}
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          {isFreePlan
            ? "Upgrade to Pro to connect TikTok, Instagram, LinkedIn, Facebook, Threads, and X."
            : `Powered by Zernio · ${zernioLimit !== null ? `${totalZernioAccounts}/${zernioLimit}` : totalZernioAccounts} account${totalZernioAccounts !== 1 ? "s" : ""} connected`}
        </p>

        {isFreePlan ? (
          <a
            href="/dashboard/billing"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-white font-bold text-sm hover:bg-amber-600 transition-colors shadow-sm"
          >
            <Crown size={14} /> Upgrade to Pro
          </a>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ZERNIO_PLATFORMS.map((p) => {
              const connected = zernioByPlatform[p.id] ?? [];
              const isConnecting = connecting === `zernio-${p.id}`;

              return (
                <div
                  key={p.id}
                  className={cn(
                    "bg-white border rounded-2xl p-4 shadow-sm flex flex-col gap-3 transition-colors",
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
                      ) : connected.length > 0 ? (
                        <p className="text-xs text-green-600 font-semibold flex items-center gap-1">
                          <CheckCircle2 size={10} />
                          {connected.length} account{connected.length !== 1 ? "s" : ""} connected
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
                          {isAdmin && (
                            <button
                              onClick={() => handleZernioDisconnect(acc.accountId, acc.accountName)}
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

                  {/* Connect / limit buttons */}
                  {isAdmin && !atZernioLimit && (
                    <button
                      onClick={() => handleZernioConnect(p.id)}
                      disabled={isConnecting || syncingZernio}
                      className={cn(
                        "flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95 disabled:opacity-50",
                        connected.length > 0
                          ? "border-green-200 text-green-700 hover:bg-green-100"
                          : "border-primary/30 text-primary hover:bg-primary/5",
                      )}
                    >
                      {isConnecting
                        ? <><Loader2 size={12} className="animate-spin" /> Opening…</>
                        : <><Link2 size={12} /> {connected.length > 0 ? "Add another" : "Connect"}</>}
                    </button>
                  )}

                  {isAdmin && atZernioLimit && connected.length === 0 && (
                    <a
                      href="/dashboard/billing"
                      className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-amber-300 text-amber-700 hover:bg-amber-50 transition-all"
                    >
                      <Crown size={11} /> Upgrade for more accounts
                    </a>
                  )}

                  {!isAdmin && connected.length === 0 && (
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground bg-secondary/60 rounded-xl px-3 py-1.5">
                      <ShieldAlert size={11} /> Admin required to connect
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Empty state */}
      {!isLoading && !hasAnyConnected && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-3">
          <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-extrabold text-amber-800">No accounts connected yet</p>
            <p className="text-sm text-amber-700 mt-0.5">
              Click <strong>Connect</strong> above to link your social accounts and start publishing clips.
            </p>
          </div>
        </div>
      )}

      <PublishModal
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        accounts={allAccounts}
        isLoadingAccounts={isLoading}
        canSchedule={tier !== "starter"}
        workspaceId={activeOrgId ?? undefined}
      />
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
