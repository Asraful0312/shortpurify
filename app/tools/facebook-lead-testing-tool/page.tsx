"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ClipboardCheck, Database, MonitorSmartphone, Trash2, type LucideIcon } from "lucide-react";
import ToolsBreadcrumb from "@/components/tools-breadcrumb";
import ToolsCta from "@/components/tools-cta";

const QUESTIONS = [
  "Have you previewed the form on both mobile and desktop before publishing?",
  "Did a test submission successfully appear in your CRM, webhook, or the Leads Center download?",
  "Does the thank-you screen or website redirect work the way you expect?",
  "Have you deleted or flagged your test leads so they don't get treated as real ones?",
];

export default function FacebookLeadTestingTool() {
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const score = useMemo(
    () => QUESTIONS.reduce((total, _q, i) => total + (answers[i] ? 1 : 0), 0),
    [answers],
  );
  const recommendation = score === QUESTIONS.length
    ? "Ready to launch"
    : score >= 2
      ? "Almost ready — finish the rest first"
      : "Not ready yet";

  return (
    <main className="max-w-3xl mx-auto px-4 py-14">
      <ToolsBreadcrumb toolName="Facebook Lead Testing Tool" toolHref="/tools/facebook-lead-testing-tool" />

      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1 rounded-full text-xs font-semibold mb-4">
          <Image src="/icons/facebook.png" alt="Facebook" width={14} height={14} className="object-contain" /> Free Guide
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-3">Facebook Lead Testing Tool</h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          A pre-launch checklist for testing your Facebook lead form before it goes live.
        </p>
      </div>

      <div className="bg-white border border-border rounded-3xl p-6 shadow-sm mb-8">
        <h2 className="font-extrabold text-lg mb-4 flex items-center gap-2">
          <ClipboardCheck size={18} className="text-blue-600" /> Pre-launch checklist
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
            [MonitorSmartphone, "Where to find the testing tool", "In Meta Business Suite or Ads Manager, open Publishing Tools → Forms Library, select your lead form, and use the Preview option to test it exactly as a visitor would see it on both mobile and desktop."],
            [Database, "Confirm your integration actually receives leads", "Submit a real test entry, then check that it shows up in your CRM, Zapier/webhook destination, or the manual Leads Center download. A form that previews fine can still fail silently if the integration isn't connected correctly."],
            [ClipboardCheck, "Check the follow-up experience", "Verify the thank-you screen text and any website redirect work as intended — this is often the last thing tested and the easiest to get wrong."],
            [Trash2, "Clean up before going live", "Test submissions land in the same Leads Center as real ones. Delete or clearly tag them before launch so your sales team doesn't chase fake leads."],
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
        headerText="Lead form tested? Now build the video that drives clicks to it."
        subText="ShortPurify turns long videos into short, high-retention clips for Facebook and Instagram — great top-of-funnel content to point at your lead ad."
      />
    </main>
  );
}
