"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Beaker, CheckCircle2, HelpCircle, Users } from "lucide-react";
import ToolsBreadcrumb from "@/components/tools-breadcrumb";
import ToolsCta from "@/components/tools-cta";

const QUESTIONS = [
  "Is this a new format, topic, hook, or editing style for your account?",
  "Would low performance from this Reel confuse your regular followers?",
  "Do you want feedback from non-followers before sharing broadly?",
  "Can the Reel stand alone without context from your existing audience?",
];

export default function InstagramTrialReelsGuide() {
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const score = useMemo(
    () => QUESTIONS.reduce((total, _question, index) => total + (answers[index] ? 1 : 0), 0),
    [answers],
  );
  const recommendation = score >= 3
    ? "Use Trial Reels first"
    : score >= 2
      ? "Trial Reels could help"
      : "Post normally";

  return (
    <main className="max-w-3xl mx-auto px-4 py-14">
        <ToolsBreadcrumb toolName="Instagram Trial Reels Guide" toolHref="/tools/instagram-trial-reels-guide" />

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-pink-50 text-pink-600 border border-pink-100 px-3 py-1 rounded-full text-xs font-semibold mb-4">
            <Image src="/icons/instagram.png" alt="Instagram" width={14} height={14} /> Free Guide
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">What Are Trial Reels on Instagram?</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Decide whether to test a Reel with non-followers before showing it to your main audience.
          </p>
        </div>

        <div className="bg-white border border-border rounded-3xl p-6 shadow-sm mb-8">
          <h2 className="font-extrabold text-lg mb-4 flex items-center gap-2"><Beaker size={18} className="text-pink-600" /> Trial Reels decision tool</h2>
          <div className="space-y-3">
            {QUESTIONS.map((question, index) => (
              <label key={question} className="flex gap-3 rounded-2xl border border-border p-4 hover:bg-pink-50/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(answers[index])}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [index]: e.target.checked }))}
                  className="mt-1 accent-pink-600"
                />
                <span className="text-sm text-muted-foreground">{question}</span>
              </label>
            ))}
          </div>
          <div className="mt-5 bg-pink-50 border border-pink-100 rounded-2xl p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-pink-600/70 mb-1">Recommendation</p>
            <p className="text-3xl font-black text-pink-700">{recommendation}</p>
            <p className="text-sm text-pink-700/80 mt-1">Score: {score}/{QUESTIONS.length}</p>
          </div>
        </div>

        <div className="grid gap-4 mb-8">
          {[
            ["What Trial Reels do", "They let creators test a Reel with people who do not follow them before deciding whether to share it more broadly."],
            ["When to use them", "Use Trial Reels for new topics, different editing styles, experimental hooks, or clips that may not fit your current audience."],
            ["When to skip them", "Skip the trial when the Reel is timely, announcement-based, or already proven with your audience."],
          ].map(([title, text], index) => {
            const Icon = index === 0 ? Users : index === 1 ? HelpCircle : CheckCircle2;
            return (
              <div key={title} className="bg-white border border-border rounded-2xl p-5 shadow-sm flex gap-4">
                <div className="size-10 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center shrink-0"><Icon size={19} /></div>
                <div>
                  <h3 className="font-extrabold">{title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{text}</p>
                </div>
              </div>
            );
          })}
        </div>

        <ToolsCta
          headerText="Testing new Reels ideas?"
          subText="ShortPurify helps you create more short clips from every long video, so you can test formats without editing from scratch."
        />

      </main>
  );
}
