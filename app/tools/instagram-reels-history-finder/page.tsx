"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Heart, Pause, Search, Wrench } from "lucide-react";
import ToolsBreadcrumb from "@/components/tools-breadcrumb";
import ToolsCta from "@/components/tools-cta";

const TABS = {
  watched: {
    label: "Recently watched",
    icon: Search,
    steps: [
      "Instagram does not provide a full public recently watched Reels history.",
      "Open Search and type the creator, caption words, hashtag, location, or audio you remember.",
      "Check Reels you liked, saved, shared, or commented on because those are tracked in Your activity.",
      "If you watched it from a profile, revisit that creator and open their Reels tab.",
    ],
  },
  liked: {
    label: "Liked Reels",
    icon: Heart,
    steps: [
      "Go to your Instagram profile.",
      "Tap the menu icon, then Your activity.",
      "Tap Interactions, then Likes.",
      "Filter or scroll to find the Reel you liked.",
    ],
  },
  pause: {
    label: "Pause Reels",
    icon: Pause,
    steps: [
      "Tap and hold on a Reel to pause playback.",
      "Release your finger to resume playback.",
      "On some app versions, a single tap may mute audio instead of pausing.",
      "Update Instagram if pause behavior is not working as expected.",
    ],
  },
  fix: {
    label: "Reels not working",
    icon: Wrench,
    steps: [
      "Update Instagram from the App Store or Google Play.",
      "Switch between Wi-Fi and mobile data.",
      "Clear app cache on Android or reinstall the app on iPhone.",
      "Check whether Instagram is down before changing account settings.",
    ],
  },
};

type TabKey = keyof typeof TABS;

export default function InstagramReelsHistoryFinder() {
  const [active, setActive] = useState<TabKey>("watched");
  const current = TABS[active];
  const Icon = current.icon;

  return (
    <main className="max-w-3xl mx-auto px-4 py-14">
        <ToolsBreadcrumb toolName="Instagram Reels History Finder" toolHref="/tools/instagram-reels-history-finder" />

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-pink-50 text-pink-600 border border-pink-100 px-3 py-1 rounded-full text-xs font-semibold mb-4">
            <Image src="/icons/instagram.png" alt="Instagram" width={14} height={14} /> Free Guide
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">How to See Recently Watched Reels on Instagram</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Find watched, liked, saved, or paused Reels with step-by-step Instagram shortcuts.
          </p>
        </div>

        <div className="bg-white border border-border rounded-3xl p-6 shadow-sm mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
            {(Object.keys(TABS) as TabKey[]).map((key) => {
              const tab = TABS[key];
              const TabIcon = tab.icon;
              return (
                <button
                  key={key}
                  onClick={() => setActive(key)}
                  className={`rounded-2xl border px-3 py-3 text-xs font-bold flex flex-col items-center gap-1 transition-colors ${
                    active === key ? "bg-pink-600 text-white border-pink-600" : "bg-secondary/30 text-muted-foreground border-transparent hover:bg-secondary/60"
                  }`}
                >
                  <TabIcon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <h2 className="font-extrabold text-lg mb-4 flex items-center gap-2"><Icon size={18} className="text-pink-600" /> {current.label}</h2>
          <div className="space-y-3">
            {current.steps.map((step, index) => (
              <div key={step} className="flex gap-3 rounded-2xl bg-secondary/25 p-4">
                <div className="size-7 rounded-full bg-white border border-border flex items-center justify-center text-xs font-black shrink-0">{index + 1}</div>
                <p className="text-sm text-muted-foreground">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-border rounded-3xl p-6 shadow-sm mb-8">
          <h2 className="font-extrabold text-lg mb-4">What Instagram actually saves</h2>
          <ul className="space-y-3">
            {[
              "Likes, comments, story replies, reviews, and some interaction history live under Your activity.",
              "Saved Reels are available from your profile menu under Saved.",
              "A complete watch-history page for every Reel you viewed is not currently available in Instagram.",
            ].map((item) => (
              <li key={item} className="flex gap-3 text-sm text-muted-foreground">
                <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <ToolsCta
          headerText="Make Reels people want to save."
          subText="ShortPurify turns long videos into short, captioned clips designed for Instagram Reels, TikTok, and YouTube Shorts."
        />

      </main>
  );
}
