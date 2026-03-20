"use client";

import { useState } from "react";
import { Send, Plus, CheckCircle2, Clock, AlertCircle, ExternalLink, Unlink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PublishModal } from "@/components/dashboard/publish-modal";

const CONNECTED_ACCOUNTS = [
  { id: "tiktok", name: "TikTok", emoji: "🎵", handle: "@shortpurify_demo", connected: true, posts: 14 },
  { id: "instagram", name: "Instagram Reels", emoji: "📸", handle: "@shortpurify", connected: true, posts: 11 },
  { id: "youtube", name: "YouTube Shorts", emoji: "▶️", handle: "ShortPurify Channel", connected: false, posts: 0 },
  { id: "linkedin", name: "LinkedIn", emoji: "💼", handle: "Not connected", connected: false, posts: 0 },
  { id: "twitter", name: "X / Twitter", emoji: "🐦", handle: "@shortpurify", connected: true, posts: 8 },
  { id: "snapchat", name: "Snapchat Spotlight", emoji: "👻", handle: "Not connected", connected: false, posts: 0 },
];

const PUBLISH_QUEUE = [
  {
    id: "q1",
    title: "The Ultimate Framework Hook",
    platforms: ["TikTok", "Instagram"],
    scheduledFor: "Today, 6:00 PM",
    status: "scheduled",
  },
  {
    id: "q2",
    title: "Why Most Startups Fail Early",
    platforms: ["TikTok"],
    scheduledFor: "Tomorrow, 9:00 AM",
    status: "scheduled",
  },
  {
    id: "q3",
    title: "The #1 Secret to Scaling APIs",
    platforms: ["YouTube", "LinkedIn"],
    scheduledFor: "Published 2h ago",
    status: "published",
  },
  {
    id: "q4",
    title: "Podcast Ep Highlight",
    platforms: ["Instagram"],
    scheduledFor: "Failed · 1d ago",
    status: "failed",
  },
];

const STATUS_ICON: Record<string, React.ReactNode> = {
  scheduled: <Clock size={14} className="text-amber-500" />,
  published: <CheckCircle2 size={14} className="text-green-600" />,
  failed: <AlertCircle size={14} className="text-red-500" />,
};

const STATUS_BADGE: Record<string, "secondary" | "default" | "destructive"> = {
  scheduled: "secondary",
  published: "default",
  failed: "destructive",
};

export default function PublishPage() {
  const [publishOpen, setPublishOpen] = useState(false);
  const [accounts, setAccounts] = useState(CONNECTED_ACCOUNTS);

  const toggleConnect = (id: string) => {
    setAccounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, connected: !a.connected } : a))
    );
  };

  const connectedCount = accounts.filter((a) => a.connected).length;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full min-h-full flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-extrabold tracking-tight">Publish Hub</h1>
            <Badge variant="secondary" className="text-[10px] font-extrabold uppercase tracking-widest">Phase 2</Badge>
          </div>
          <p className="text-muted-foreground">
            Connect accounts & schedule clips to go live across all platforms.
          </p>
        </div>
        <button
          onClick={() => setPublishOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all active:scale-95 flex items-center gap-2"
        >
          <Send size={16} /> Publish Clip
        </button>
      </div>

      {/* Connected Accounts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-extrabold text-lg">Connected Accounts</h2>
          <span className="text-sm text-muted-foreground font-medium">
            {connectedCount}/{accounts.length} connected
          </span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="bg-white border border-border rounded-2xl p-5 shadow-sm flex flex-col gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">{account.emoji}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm">{account.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{account.handle}</p>
                </div>
                {account.connected && (
                  <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200 shrink-0">Live</span>
                )}
              </div>

              {account.connected && (
                <p className="text-xs text-muted-foreground font-medium">
                  {account.posts} clips published
                </p>
              )}

              <div className="flex gap-2 mt-auto">
                {account.connected ? (
                  <>
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-border text-xs font-bold hover:bg-secondary transition-colors text-muted-foreground">
                      <ExternalLink size={12} /> View
                    </button>
                    <button
                      onClick={() => toggleConnect(account.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-red-200 text-xs font-bold hover:bg-red-50 transition-colors text-red-600"
                    >
                      <Unlink size={12} /> Disconnect
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => toggleConnect(account.id)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/20 text-xs font-extrabold text-primary transition-colors"
                  >
                    <Plus size={12} /> Connect Account
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Publish Queue */}
      <div>
        <h2 className="font-extrabold text-lg mb-4">Publish Queue</h2>
        <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
          {PUBLISH_QUEUE.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground text-sm">
              No scheduled posts yet.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/40">
                  <th className="text-left px-5 py-3 text-xs font-extrabold uppercase tracking-wide text-muted-foreground">Clip</th>
                  <th className="text-left px-5 py-3 text-xs font-extrabold uppercase tracking-wide text-muted-foreground">Platforms</th>
                  <th className="text-left px-5 py-3 text-xs font-extrabold uppercase tracking-wide text-muted-foreground">Scheduled</th>
                  <th className="text-left px-5 py-3 text-xs font-extrabold uppercase tracking-wide text-muted-foreground">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {PUBLISH_QUEUE.map((item) => (
                  <tr key={item.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-5 py-4 font-semibold truncate max-w-[200px]">{item.title}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {item.platforms.map((p) => (
                          <span key={p} className="text-[10px] font-bold bg-secondary text-foreground px-2 py-0.5 rounded-full border border-border">
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground text-xs font-medium">{item.scheduledFor}</td>
                    <td className="px-5 py-4">
                      <Badge variant={STATUS_BADGE[item.status]} className="flex items-center gap-1 w-fit text-[10px] capitalize font-bold">
                        {STATUS_ICON[item.status]}
                        {item.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {item.status === "scheduled" && (
                        <button className="text-xs text-red-500 font-bold hover:underline">Cancel</button>
                      )}
                      {item.status === "failed" && (
                        <button className="text-xs text-primary font-bold hover:underline">Retry</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <PublishModal open={publishOpen} onClose={() => setPublishOpen(false)} />
    </div>
  );
}
