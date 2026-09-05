"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { AlertTriangle, CheckCircle2, ShieldAlert, ShieldCheck, XCircle } from "lucide-react";
import ToolsBreadcrumb from "@/components/tools-breadcrumb";
import ToolsCta from "@/components/tools-cta";

const RED_FLAGS = [
  "Asks for your Instagram password instead of Meta's official login",
  "Promises guaranteed follower growth or \"real, active\" followers fast",
  "Auto-likes, auto-follows/unfollows, or auto-comments on your behalf",
  "Sends automated DMs without you reviewing them first",
  "Not listed as a Meta Business Partner or doesn't mention official API access",
];

const SAFE_EXAMPLES = [
  "Scheduling and publishing posts/Reels at set times",
  "AI-generated captions, hashtags, or video edits you review before posting",
  "Auto-clipping and auto-captioning long videos into short-form content",
  "Analytics and reporting tools that only read your own data",
];

const RISKY_EXAMPLES = [
  "Auto-following and auto-unfollowing accounts to farm followers",
  "Auto-liking or auto-commenting on posts at scale",
  "Bulk automated DMs to strangers or new followers",
  "\"Growth services\" that log into your account directly",
];

export default function InstagramAutomationTool() {
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const flagCount = useMemo(() => Object.values(checked).filter(Boolean).length, [checked]);

  return (
    <main className="max-w-3xl mx-auto px-4 py-14">
      <ToolsBreadcrumb toolName="Instagram Automation Tool" toolHref="/tools/instagram-automation-tool" />

      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-pink-50 text-pink-600 border border-pink-100 px-3 py-1 rounded-full text-xs font-semibold mb-4">
          <Image src="/icons/instagram.png" alt="Instagram" width={14} height={14} /> Free Guide
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-3">Instagram Automation Tool: Safe vs Risky</h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Not all &quot;Instagram automation&quot; is the same — some saves you time, some gets your account banned. Check which kind you&apos;re looking at.
        </p>
      </div>

      <div className="bg-white border border-border rounded-3xl p-6 shadow-sm mb-8">
        <h2 className="font-extrabold text-lg mb-4 flex items-center gap-2">
          <ShieldAlert size={18} className="text-pink-600" /> Red flag checker
        </h2>
        <p className="text-sm text-muted-foreground mb-4">Check any that apply to a tool you&apos;re considering:</p>
        <div className="space-y-3">
          {RED_FLAGS.map((flag, index) => (
            <label key={flag} className="flex gap-3 rounded-2xl border border-border p-4 hover:bg-red-50/50 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(checked[index])}
                onChange={(e) => setChecked((prev) => ({ ...prev, [index]: e.target.checked }))}
                className="mt-1 accent-red-600"
              />
              <span className="text-sm text-muted-foreground">{flag}</span>
            </label>
          ))}
        </div>
        <div className={`mt-5 rounded-2xl p-5 border ${flagCount > 0 ? "bg-red-50 border-red-200" : "bg-emerald-50 border-emerald-200"}`}>
          {flagCount > 0 ? (
            <div className="flex gap-3">
              <XCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-800">Risky — {flagCount} red flag{flagCount > 1 ? "s" : ""} found</p>
                <p className="text-sm text-red-700/80 mt-1">This likely violates Instagram&apos;s Terms of Service and could get your account restricted or permanently banned. Avoid it.</p>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-emerald-800">No red flags checked</p>
                <p className="text-sm text-emerald-700/80 mt-1">Still verify independently before connecting any third-party tool to your account.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-white border border-emerald-200 rounded-2xl p-5 shadow-sm">
          <h3 className="font-extrabold flex items-center gap-2 text-emerald-700 mb-3"><ShieldCheck size={18} /> Safe automation</h3>
          <ul className="space-y-2">
            {SAFE_EXAMPLES.map((item) => (
              <li key={item} className="text-sm text-muted-foreground flex gap-2"><CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" /> {item}</li>
            ))}
          </ul>
        </div>
        <div className="bg-white border border-red-200 rounded-2xl p-5 shadow-sm">
          <h3 className="font-extrabold flex items-center gap-2 text-red-700 mb-3"><AlertTriangle size={18} /> Risky automation</h3>
          <ul className="space-y-2">
            {RISKY_EXAMPLES.map((item) => (
              <li key={item} className="text-sm text-muted-foreground flex gap-2"><XCircle size={14} className="text-red-600 shrink-0 mt-0.5" /> {item}</li>
            ))}
          </ul>
        </div>
      </div>

      <ToolsCta
        headerText="Want the safe kind of automation?"
        subText="ShortPurify auto-clips long videos, adds AI captions, and publishes to Instagram Reels, TikTok, and YouTube Shorts — no bots, no bans, just less manual editing."
      />
    </main>
  );
}
