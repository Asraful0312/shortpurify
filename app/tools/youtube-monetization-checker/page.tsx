"use client";

import { useState } from "react";
import { Loader2, Search, CheckCircle2, XCircle, AlertCircle, Users, Video, Eye, ExternalLink } from "lucide-react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import ToolsNavBar from "@/components/tools-nav-bar";
import ToolsCta from "@/components/tools-cta";
import ToolsBreadcrumb from "@/components/tools-breadcrumb";
import { getToolError } from "@/lib/getToolError";

function getClientId() {
  if (typeof window === "undefined") return "ssr";
  let id = localStorage.getItem("sp_tool_client_id");
  if (!id) { id = crypto.randomUUID(); localStorage.setItem("sp_tool_client_id", id); }
  return id;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

interface ChannelData {
  id: string;
  name: string;
  handle: string | null;
  thumbnail: string | null;
  subscribers: number;
  subscribersHidden: boolean;
  videoCount: number;
  viewCount: number;
}

type Status = "met" | "not_met" | "unknown";

interface Requirement {
  label: string;
  status: Status;
  detail: string;
  canVerify: boolean;
}

function getRequirements(channel: ChannelData): {
  earlyAccess: Requirement[];
  standard: Requirement[];
  earlyEligible: boolean | null;
  standardEligible: boolean | null;
} {
  const sub500  = channel.subscribersHidden ? null : channel.subscribers >= 500;
  const sub1000 = channel.subscribersHidden ? null : channel.subscribers >= 1000;
  const hasVideos = channel.videoCount >= 3;

  const earlyAccess: Requirement[] = [
    {
      label: "500 subscribers",
      status: sub500 === null ? "unknown" : sub500 ? "met" : "not_met",
      detail: channel.subscribersHidden
        ? "Subscriber count is hidden by this channel"
        : `${formatCount(channel.subscribers)} subscribers`,
      canVerify: !channel.subscribersHidden,
    },
    {
      label: "3+ public videos",
      status: hasVideos ? "met" : "not_met",
      detail: `${channel.videoCount} total public videos`,
      canVerify: true,
    },
    {
      label: "3,000 watch hours (12 mo) OR 3M Shorts views (90 days)",
      status: "unknown",
      detail: "Only visible in YouTube Studio → Analytics",
      canVerify: false,
    },
  ];

  const standard: Requirement[] = [
    {
      label: "1,000 subscribers",
      status: sub1000 === null ? "unknown" : sub1000 ? "met" : "not_met",
      detail: channel.subscribersHidden
        ? "Subscriber count is hidden by this channel"
        : `${formatCount(channel.subscribers)} subscribers`,
      canVerify: !channel.subscribersHidden,
    },
    {
      label: "4,000 watch hours (12 mo) OR 10M Shorts views (90 days)",
      status: "unknown",
      detail: "Only visible in YouTube Studio → Analytics",
      canVerify: false,
    },
  ];

  const earlyVerifiable = earlyAccess.filter((r) => r.canVerify);
  const earlyMet = earlyVerifiable.every((r) => r.status === "met");
  const earlyFailed = earlyVerifiable.some((r) => r.status === "not_met");

  const stdVerifiable = standard.filter((r) => r.canVerify);
  const stdMet = stdVerifiable.every((r) => r.status === "met");
  const stdFailed = stdVerifiable.some((r) => r.status === "not_met");

  return {
    earlyAccess,
    standard,
    earlyEligible: earlyFailed ? false : earlyMet ? null : null,
    standardEligible: stdFailed ? false : stdMet ? null : null,
  };
}

function RequirementRow({ req }: { req: Requirement }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className="mt-0.5 shrink-0">
        {req.status === "met" && <CheckCircle2 size={16} className="text-emerald-500" />}
        {req.status === "not_met" && <XCircle size={16} className="text-red-500" />}
        {req.status === "unknown" && <AlertCircle size={16} className="text-amber-400" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-tight">{req.label}</p>
        <p className={`text-xs mt-0.5 ${req.status === "not_met" ? "text-red-500" : req.status === "unknown" ? "text-amber-600" : "text-muted-foreground"}`}>
          {req.detail}
        </p>
      </div>
    </div>
  );
}

export default function YouTubeMonetizationChecker() {
  const [input, setInput] = useState("");
  const [channel, setChannel] = useState<ChannelData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const checkChannel = useAction(api.toolsActions.checkYouTubeChannel);

  const check = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError("");
    setChannel(null);
    try {
      const data = await checkChannel({ channelInput: input.trim(), clientId: getClientId() });
      setChannel(data);
    } catch (err) {
      setError(getToolError(err));
    } finally {
      setLoading(false);
    }
  };

  const reqs = channel ? getRequirements(channel) : null;

  return (
    <main className="max-w-3xl mx-auto px-4 py-14">
        {/* Header */}
        <ToolsBreadcrumb toolName="YouTube Monetization Checker" toolHref="/tools/youtube-monetization-checker" />
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 border border-red-100 px-3 py-1 rounded-full text-xs font-semibold mb-4">
            {/* eslint-disable-next-line @next/next-image */}
            <img src="/icons/youtube.png" alt="YouTube" className="w-3.5 h-3.5 object-contain" /> Free Tool
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">
            YouTube Monetization Checker
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Check if a YouTube channel meets the YouTube Partner Program requirements. Enter any channel URL or @handle.
          </p>
        </div>

        {/* Input card */}
        <div className="bg-white border border-border rounded-3xl p-6 shadow-sm mb-6">
          <label className="block text-sm font-bold mb-2">YouTube channel URL or @handle</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !loading) void check(); }}
              placeholder="e.g. @MrBeast or youtube.com/@channelname"
              className="flex-1 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-secondary/30"
            />
            <button
              onClick={() => void check()}
              disabled={loading || !input.trim()}
              className="flex items-center gap-2 bg-primary text-primary-foreground font-bold px-5 py-3 rounded-xl hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              Check
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Works with @handles, full YouTube URLs, or channel IDs starting with UC</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Results */}
        {channel && reqs && (
          <div className="flex flex-col gap-4 mb-8">
            {/* Channel card */}
            <div className="bg-white border border-border rounded-3xl p-5 shadow-sm">
              <div className="flex items-center gap-4">
                {channel.thumbnail ? (
                  // eslint-disable-next-line @next/next-image
                  <img src={channel.thumbnail} alt={channel.name} className="w-14 h-14 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center text-xl font-extrabold text-muted-foreground shrink-0">
                    {channel.name[0]}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-base truncate">{channel.name}</p>
                  {channel.handle && <p className="text-sm text-muted-foreground">{channel.handle}</p>}
                </div>
                <a
                  href={`https://youtube.com/channel/${channel.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground border border-border rounded-lg px-2.5 py-1.5 hover:bg-secondary/40 transition-colors shrink-0"
                >
                  View <ExternalLink size={10} />
                </a>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-border">
                <div className="text-center">
                  <Users size={14} className="mx-auto mb-1 text-muted-foreground" />
                  <p className="font-extrabold text-lg">
                    {channel.subscribersHidden ? "Hidden" : formatCount(channel.subscribers)}
                  </p>
                  <p className="text-xs text-muted-foreground">Subscribers</p>
                </div>
                <div className="text-center">
                  <Video size={14} className="mx-auto mb-1 text-muted-foreground" />
                  <p className="font-extrabold text-lg">{formatCount(channel.videoCount)}</p>
                  <p className="text-xs text-muted-foreground">Videos</p>
                </div>
                <div className="text-center">
                  <Eye size={14} className="mx-auto mb-1 text-muted-foreground" />
                  <p className="font-extrabold text-lg">{formatCount(channel.viewCount)}</p>
                  <p className="text-xs text-muted-foreground">Total views</p>
                </div>
              </div>
            </div>

            {/* Standard YPP */}
            <div className="bg-white border border-border rounded-3xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <p className="font-extrabold text-base">Standard Monetization (YPP)</p>
                {reqs.standardEligible === false && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-100">Not eligible yet</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-3">Ad revenue, channel memberships, Super Chat</p>
              <div className="divide-y divide-border">
                {reqs.standard.map((req, i) => <RequirementRow key={i} req={req} />)}
              </div>
            </div>

            {/* Early Access YPP */}
            <div className="bg-white border border-border rounded-3xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <p className="font-extrabold text-base">Early Access YPP</p>
                {reqs.earlyEligible === false && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-100">Not eligible yet</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-3">Fan funding, Super Thanks, channel memberships (lower threshold)</p>
              <div className="divide-y divide-border">
                {reqs.earlyAccess.map((req, i) => <RequirementRow key={i} req={req} />)}
              </div>
            </div>

            {/* Watch hours notice */}
            <div className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4 flex items-start gap-3">
              <AlertCircle size={16} className="text-amber-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-bold text-amber-900">Watch hours &amp; Shorts views must be verified manually</p>
                <p className="text-xs text-amber-700 mt-1">YouTube does not make this data public. Open <strong>YouTube Studio → Analytics → Revenue</strong> to see your watch hours and Shorts views.</p>
              </div>
            </div>
          </div>
        )}

        {/* CTA */}
        <ToolsCta
          headerText="Close to monetization? Grow faster with Shorts."
          subText="Paste Youtube video URL, ShortPurify turns your long videos into viral short clips automatically helping you hit watch hours and Shorts views faster with zero editing effort."
        />

      </main>
  );
}
