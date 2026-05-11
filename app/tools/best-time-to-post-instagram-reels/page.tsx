"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, CheckCircle2, Clock, Globe, Info } from "lucide-react";
import ToolsBreadcrumb from "@/components/tools-breadcrumb";
import ToolsCta from "@/components/tools-cta";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const BEST_TIMES_EST: Record<string, string[]> = {
  Monday: ["11:00 AM", "1:00 PM", "7:00 PM"],
  Tuesday: ["10:00 AM", "2:00 PM", "8:00 PM"],
  Wednesday: ["11:00 AM", "3:00 PM", "9:00 PM"],
  Thursday: ["12:00 PM", "4:00 PM", "8:00 PM"],
  Friday: ["10:00 AM", "1:00 PM", "6:00 PM"],
  Saturday: ["9:00 AM", "12:00 PM", "7:00 PM"],
  Sunday: ["10:00 AM", "2:00 PM", "6:00 PM"],
};

function convertTime(timeStr: string, fromOffset: number, toOffset: number) {
  const [time, modifier] = timeStr.split(" ");
  const [rawHours, minutesValue] = time.split(":").map(Number);
  let hours = rawHours;
  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;

  const diff = toOffset - fromOffset;
  let newHours = (hours + diff) % 24;
  if (newHours < 0) newHours += 24;

  const newModifier = newHours >= 12 ? "PM" : "AM";
  const displayHours = newHours % 12 || 12;
  return `${displayHours}:${minutesValue === 0 ? "00" : minutesValue} ${newModifier}`;
}

export default function BestTimeToPostInstagramReels() {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const [selectedDay, setSelectedDay] = useState(DAYS.includes(today) ? today : "Wednesday");
  const [timezoneOffset, setTimezoneOffset] = useState(() => {
    if (typeof window === "undefined") return 0;
    return -new Date().getTimezoneOffset() / 60;
  });

  const currentBestTimes = useMemo(
    () => BEST_TIMES_EST[selectedDay].map((time) => convertTime(time, -5, timezoneOffset)),
    [selectedDay, timezoneOffset],
  );

  return (
    <main className="max-w-4xl mx-auto px-4 py-14">
        <ToolsBreadcrumb toolName="Best Time to Post Instagram Reels" toolHref="/tools/best-time-to-post-instagram-reels" />

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-pink-50 text-pink-600 border border-pink-100 px-3 py-1 rounded-full text-xs font-semibold mb-4">
            <Image src="/icons/instagram.png" alt="Instagram" width={14} height={14} /> Free Tool
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">Best Time to Post Instagram Reels Today</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Choose a day and timezone to get practical Reels posting windows for stronger first-hour engagement.
          </p>
        </div>

        <div className="bg-white border border-border rounded-[2rem] p-6 sm:p-8 shadow-sm mb-10">
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
                <Calendar size={16} className="text-pink-600" /> Day
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-7 md:grid-cols-4 gap-2">
                {DAYS.map((day) => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`px-3 py-2 rounded-xl text-sm font-bold border transition-colors ${
                      selectedDay === day
                        ? "bg-pink-600 text-white border-pink-600"
                        : "bg-secondary/30 text-muted-foreground border-transparent hover:bg-secondary/60"
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
                <Globe size={16} className="text-pink-600" /> Timezone
              </label>
              <select
                value={timezoneOffset}
                onChange={(e) => setTimezoneOffset(Number(e.target.value))}
                className="w-full bg-secondary/30 border border-border rounded-2xl px-4 py-3.5 font-bold focus:outline-none focus:ring-2 focus:ring-pink-200"
              >
                {Array.from({ length: 25 }, (_, i) => i - 12).map((offset) => (
                  <option key={offset} value={offset}>
                    GMT {offset >= 0 ? "+" : ""}{offset}:00
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {currentBestTimes.map((time, index) => (
              <div key={time} className="bg-pink-50 border border-pink-100 rounded-2xl p-5 text-center">
                <div className="mx-auto mb-3 size-11 rounded-full bg-white flex items-center justify-center text-pink-600">
                  <Clock size={22} />
                </div>
                <p className="text-2xl font-black text-pink-700">{time}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-pink-600/70 mt-1">
                  {index === 0 ? "Strongest window" : "Backup window"}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-2xl p-4">
            <Info size={18} className="text-amber-600 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-900">
              Post 15-30 minutes before a peak window, then reply to comments quickly. Reels often get their first distribution test soon after publishing.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white border border-border rounded-3xl p-6 shadow-sm">
            <h2 className="font-extrabold text-lg mb-4">Weekly Instagram Reels times (EST)</h2>
            <div className="space-y-3">
              {DAYS.map((day) => (
                <div key={day} className="flex items-center justify-between border-b border-border last:border-0 pb-3 last:pb-0">
                  <span className="text-sm font-bold">{day}</span>
                  <span className="text-xs text-muted-foreground font-semibold">{BEST_TIMES_EST[day].join(" · ")}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-border rounded-3xl p-6 shadow-sm">
            <h2 className="font-extrabold text-lg mb-4">How to validate your best time</h2>
            <ul className="space-y-3">
              {[
                "Open Instagram Insights and compare reach by publish hour.",
                "Track saves, shares, and average watch time for each time slot.",
                "Repeat your top two windows for two weeks before changing schedule.",
                "Use the same Reels size, hook quality, and caption style during tests.",
              ].map((item) => (
                <li key={item} className="flex gap-3 text-sm text-muted-foreground">
                  <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <ToolsCta
          headerText="Found your posting window? Fill it with better clips."
          subText="ShortPurify turns long videos into Instagram Reels with smart crop, captions, and ready-to-post short clips."
        />

      </main>
  );
}
