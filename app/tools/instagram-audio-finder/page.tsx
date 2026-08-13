"use client";

import { useState } from "react";
import Image from "next/image";
import { Disc3, MessageCircle, Mic2, Search, Sparkles } from "lucide-react";
import ToolsBreadcrumb from "@/components/tools-breadcrumb";
import ToolsCta from "@/components/tools-cta";

type Situation = "have-link" | "only-remember";

const METHODS: {
  id: Situation | "any";
  icon: typeof Disc3;
  title: string;
  steps: string[];
  bestFor: Situation[];
}[] = [
  {
    id: "have-link",
    icon: Disc3,
    title: "Tap the audio name (fastest, official)",
    bestFor: ["have-link"],
    steps: [
      "Open the Reel and look at the bottom-left corner for the spinning record icon and scrolling audio name.",
      "Tap the audio name or the record icon.",
      "Instagram opens the audio page, showing the song title, artist, and every other Reel using it.",
      "Tap the bookmark icon there to save it to your own audio library for later.",
    ],
  },
  {
    id: "any",
    icon: Mic2,
    title: "Screen record and use Shazam or SoundHound",
    bestFor: ["have-link", "only-remember"],
    steps: [
      "Play the Reel (or hum/replay the sound from memory) with your phone's screen recording or another device nearby.",
      "Open Shazam or SoundHound and let it listen while the clip plays.",
      "This works even when Instagram doesn't show a tappable audio name — for example when the creator used original audio, added a voiceover, or the sound was muted from a licensed track.",
    ],
  },
  {
    id: "only-remember",
    icon: Search,
    title: "Search Instagram or Google with what you remember",
    bestFor: ["only-remember"],
    steps: [
      "Type any lyrics you remember into Instagram's search bar, or add \"instagram reels\" to a Google search.",
      "Check the creator's profile — captions or pinned comments often name the song.",
      "If you saw the Reel reposted elsewhere (TikTok, X), search there too — captions on reposts often credit the original audio.",
    ],
  },
  {
    id: "only-remember",
    icon: MessageCircle,
    title: "Ask in the comments",
    bestFor: ["only-remember", "have-link"],
    steps: [
      "Comment something like \"song name?\" on the Reel — creators and other viewers often reply with the exact title.",
      "Check existing comments first; it's frequently already been asked and answered, sometimes pinned by the creator.",
    ],
  },
];

export default function InstagramAudioFinder() {
  const [situation, setSituation] = useState<Situation | null>(null);

  const visibleMethods = situation
    ? METHODS.filter((m) => m.bestFor.includes(situation))
    : METHODS;

  return (
    <main className="max-w-3xl mx-auto px-4 py-14">
      <ToolsBreadcrumb toolName="Instagram Audio Finder" toolHref="/tools/instagram-audio-finder" />

      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-pink-50 text-pink-600 border border-pink-100 px-3 py-1 rounded-full text-xs font-semibold mb-4">
          <Image src="/icons/instagram.png" alt="Instagram" width={14} height={14} /> Free Tool
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-3">Instagram Audio Finder</h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Find the name of any song or sound used in an Instagram Reel — pick your situation for the fastest method.
        </p>
      </div>

      <div className="bg-white border border-border rounded-3xl p-6 shadow-sm mb-8">
        <h2 className="font-extrabold text-lg mb-4 flex items-center gap-2">
          <Sparkles size={18} className="text-pink-600" /> What&apos;s your situation?
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <button
            onClick={() => setSituation("have-link")}
            className={`text-left rounded-2xl border p-4 transition-colors ${
              situation === "have-link" ? "border-pink-300 bg-pink-50" : "border-border hover:bg-secondary/40"
            }`}
          >
            <span className="block text-sm font-bold">I have the Reel open right now</span>
            <span className="block text-xs text-muted-foreground mt-1">You&apos;ve got the link or it&apos;s on your screen</span>
          </button>
          <button
            onClick={() => setSituation("only-remember")}
            className={`text-left rounded-2xl border p-4 transition-colors ${
              situation === "only-remember" ? "border-pink-300 bg-pink-50" : "border-border hover:bg-secondary/40"
            }`}
          >
            <span className="block text-sm font-bold">I only remember hearing it</span>
            <span className="block text-xs text-muted-foreground mt-1">Lost the Reel, or heard it somewhere else</span>
          </button>
        </div>
        {situation && (
          <button onClick={() => setSituation(null)} className="mt-3 text-xs font-semibold text-muted-foreground hover:text-foreground underline">
            Show all methods instead
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4 mb-8">
        {visibleMethods.map((method, index) => {
          const Icon = method.icon;
          return (
            <div key={method.title} className="bg-white border border-border rounded-2xl p-5 shadow-sm">
              <h3 className="font-extrabold flex items-center gap-2 mb-3">
                <span className="size-8 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center font-black shrink-0 text-sm">{index + 1}</span>
                <Icon size={16} className="text-pink-600" /> {method.title}
              </h3>
              <ol className="space-y-2 pl-11">
                {method.steps.map((step) => (
                  <li key={step} className="text-sm text-muted-foreground list-disc">{step}</li>
                ))}
              </ol>
            </div>
          );
        })}
      </div>

      <ToolsCta
        headerText="Found the sound? Now build the Reel."
        subText="ShortPurify turns long videos into short Instagram Reels so you can pair them with the perfect audio in minutes."
      />
    </main>
  );
}
