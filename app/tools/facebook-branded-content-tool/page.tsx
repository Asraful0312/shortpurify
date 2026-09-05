"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Briefcase, CheckCircle2, FileText, Handshake, ShieldCheck, type LucideIcon } from "lucide-react";
import ToolsBreadcrumb from "@/components/tools-breadcrumb";
import ToolsCta from "@/components/tools-cta";

const QUESTIONS = [
  "Do you post from a Facebook Page or a professional (creator/business) account, not just a personal profile?",
  "Is your account in good standing, with no recent Community Standards strikes?",
  "Are you and your brand partner both based in a country where the Branded Content Tool is supported?",
  "Does the partnership avoid restricted categories (alcohol, gambling, weight loss, etc.) that need extra approval?",
];

export default function FacebookBrandedContentTool() {
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const score = useMemo(
    () => QUESTIONS.reduce((total, _q, i) => total + (answers[i] ? 1 : 0), 0),
    [answers],
  );
  const recommendation = score === QUESTIONS.length
    ? "Likely eligible — go ahead and enable it"
    : score >= 2
      ? "Probably eligible, but review the unchecked items"
      : "Fix these first before requesting access";

  return (
    <main className="max-w-3xl mx-auto px-4 py-14">
      <ToolsBreadcrumb toolName="Facebook Branded Content Tool" toolHref="/tools/facebook-branded-content-tool" />

      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1 rounded-full text-xs font-semibold mb-4">
          <Image src="/icons/facebook.png" alt="Facebook" width={14} height={14} className="object-contain" /> Free Guide
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-3">Facebook Branded Content Tool</h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Check your eligibility, then learn how to tag a paid partnership on Facebook the right way.
        </p>
      </div>

      <div className="bg-white border border-border rounded-3xl p-6 shadow-sm mb-8">
        <h2 className="font-extrabold text-lg mb-4 flex items-center gap-2">
          <ShieldCheck size={18} className="text-blue-600" /> Eligibility check
        </h2>
        <div className="space-y-3">
          {QUESTIONS.map((question, index) => (
            <label key={question} className="flex gap-3 rounded-2xl border border-border p-4 hover:bg-blue-50/50 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(answers[index])}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [index]: e.target.checked }))}
                className="mt-1 accent-blue-600"
              />
              <span className="text-sm text-muted-foreground">{question}</span>
            </label>
          ))}
        </div>
        <div className="mt-5 bg-blue-50 border border-blue-100 rounded-2xl p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600/70 mb-1">Result</p>
          <p className="text-2xl font-black text-blue-700">{recommendation}</p>
          <p className="text-sm text-blue-700/80 mt-1">Score: {score}/{QUESTIONS.length}</p>
        </div>
      </div>

      <div className="grid gap-4 mb-8">
        {(
          [
            [Briefcase, "What the Branded Content Tool does", "It lets creators and Pages formally tag a business partner on a post, Reel, or Live video, adding a \"Paid partnership with [Page]\" label. The partner gets visibility into the post's performance too."],
            [FileText, "How to turn it on", "Go to your Page or professional account settings, find Creator Tools (or Branded Content under Business Suite), and request access if it isn't already enabled. Approval is usually automatic once your account meets the requirements above."],
            [Handshake, "How to tag a partner on a post", "When publishing, tap the \"...\" or \"Advanced settings\" menu, choose Branded Content Tool, then search for and add your partner's Page. They'll get a notification and must accept the tag before it appears publicly."],
            [CheckCircle2, "If your request gets denied", "Denials are almost always tied to account standing (recent violations) or an unsupported region/category. Fix the flagged issue, wait a few days, and try requesting access again."],
          ] as [LucideIcon, string, string][]
        ).map(([Icon, title, text]) => (
          <div key={title} className="bg-white border border-border rounded-2xl p-5 shadow-sm flex gap-4">
            <div className="size-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Icon size={19} />
            </div>
            <div>
              <h3 className="font-extrabold">{title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{text}</p>
            </div>
          </div>
        ))}
      </div>

      <ToolsCta
        headerText="Tagged your partner? Now make the content."
        subText="ShortPurify turns long videos into short, publish-ready clips for Facebook, Instagram Reels, and TikTok — perfect for sponsored content deliverables."
      />
    </main>
  );
}
