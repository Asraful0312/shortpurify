"use client";

import { useState, useMemo } from "react";
import { Clock, Calendar, Globe, Zap, Info, CheckCircle2 } from "lucide-react";
import ToolsCta from "@/components/tools-cta";
import ToolsBreadcrumb from "@/components/tools-breadcrumb";
import Link from "next/link";

// Best times to post on TikTok (EST) according to 2025 research
const BEST_TIMES_EST: Record<string, string[]> = {
  Monday: ["6:00 AM", "10:00 AM", "10:00 PM"],
  Tuesday: ["2:00 AM", "4:00 AM", "9:00 AM"],
  Wednesday: ["7:00 AM", "8:00 AM", "11:00 PM"],
  Thursday: ["9:00 AM", "12:00 PM", "7:00 PM"],
  Friday: ["5:00 AM", "1:00 PM", "3:00 PM"],
  Saturday: ["11:00 AM", "7:00 PM", "8:00 PM"],
  Sunday: ["7:00 AM", "8:00 AM", "4:00 PM"],
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function BestTimeToPostTikTok() {
  const [selectedDay, setSelectedDay] = useState<string>("Wednesday");
  const [timezoneOffset, setTimezoneOffset] = useState<number>(0);

  // Initialize timezone offset on client side
  useMemo(() => {
    if (typeof window !== "undefined") {
      // Get offset in hours (e.g. -5 for EST)
      const offset = -new Date().getTimezoneOffset() / 60;
      setTimezoneOffset(offset);
    }
  }, []);

  const convertTime = (timeStr: string, fromOffset: number, toOffset: number) => {
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    // Adjust for timezone difference
    const diff = toOffset - fromOffset;
    let newHours = (hours + diff) % 24;
    if (newHours < 0) newHours += 24;

    const newModifier = newHours >= 12 ? "PM" : "AM";
    let displayHours = newHours % 12;
    if (displayHours === 0) displayHours = 12;

    return `${displayHours}:${minutes === 0 ? "00" : minutes} ${newModifier}`;
  };

  const currentBestTimes = useMemo(() => {
    return BEST_TIMES_EST[selectedDay].map(t => convertTime(t, -5, timezoneOffset));
  }, [selectedDay, timezoneOffset]);

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <main className="max-w-4xl mx-auto px-4 py-14">
        <ToolsBreadcrumb toolName="Best Time to Post on TikTok" toolHref="/tools/best-time-to-post-on-tiktok" />
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-pink-50 text-pink-600 border border-pink-100 px-3 py-1 rounded-full text-xs font-semibold mb-4">
             {/* eslint-disable-next-line @next/next-image */}
             <img src="/icons/tik-tok.png" alt="TikTok" className="w-3.5 h-3.5 object-contain" /> Free Tool
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">
            Best Time to Post on TikTok (2025)
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Stop guessing when to post. Our calculator uses the latest 2025 algorithm data to find the exact times your audience is most active.
          </p>
        </div>

        {/* Calculator Tool */}
        <div className="bg-white border border-border rounded-[2.5rem] p-8 shadow-sm mb-12 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
          
          <div className="relative flex flex-col gap-8">
            <div className="grid md:grid-cols-2 gap-8 items-end">
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  <Calendar size={16} className="text-primary" /> Select Day
                </label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map(day => (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${selectedDay === day ? "bg-primary text-primary-foreground border-primary shadow-md active:scale-95" : "bg-secondary/30 text-muted-foreground border-transparent hover:bg-secondary/50"}`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  <Globe size={16} className="text-primary" /> Your Timezone
                </label>
                <div className="relative">
                   <select 
                    value={timezoneOffset}
                    onChange={(e) => setTimezoneOffset(Number(e.target.value))}
                    className="w-full bg-secondary/30 border border-border rounded-2xl px-4 py-3.5 font-bold appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  >
                    {Array.from({ length: 25 }, (_, i) => i - 12).map(offset => (
                      <option key={offset} value={offset}>
                        GMT {offset >= 0 ? "+" : ""}{offset}:00 {offset === timezoneOffset ? "(Your Time)" : ""}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                    <Clock size={18} />
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="bg-secondary/20 rounded-[2rem] p-8">
              <div className="text-center mb-6">
                <h2 className="text-xl font-extrabold flex items-center justify-center gap-2">
                   <Zap size={20} className="text-amber-500 fill-amber-500" /> 
                   Best times for {selectedDay}
                </h2>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                {currentBestTimes.map((time, i) => (
                  <div key={i} className="bg-white border border-border rounded-2xl p-6 shadow-sm flex flex-col items-center gap-3 group hover:border-primary/30 transition-all">
                    <div className="w-12 h-12 rounded-full bg-pink-50 flex items-center justify-center text-pink-600 group-hover:scale-110 transition-transform">
                      <Clock size={24} />
                    </div>
                    <span className="text-2xl font-black text-foreground">{time}</span>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Peak Activity</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-3 bg-amber-50/50 border border-amber-100/50 rounded-2xl p-4">
              <Info size={18} className="text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-800 leading-relaxed italic">
                Pro Tip: Posting 15-30 minutes before these peak times ensures your video is indexed and ready by the time the wave of users hits the app.
              </p>
            </div>
          </div>
        </div>

        {/* Global Best Times Overview */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white border border-border rounded-3xl p-8 shadow-sm">
            <h3 className="text-xl font-extrabold mb-6 flex items-center gap-2">
              <Calendar size={20} className="text-primary" /> Weekly Peak Hours (EST)
            </h3>
            <div className="space-y-4">
              {DAYS.map(day => (
                <div key={day} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="font-bold text-sm w-24">{day}</span>
                  <div className="flex gap-2">
                    {BEST_TIMES_EST[day].map((t, i) => (
                      <span key={i} className={`text-[10px] font-black px-2 py-1 rounded-md ${i === 0 ? "bg-emerald-50 text-emerald-600" : "bg-secondary text-muted-foreground"}`}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col gap-6">
            <div className="bg-white border border-border rounded-3xl p-8 shadow-sm flex-1">
              <h3 className="text-xl font-extrabold mb-4 flex items-center gap-2">
                <CheckCircle2 size={20} className="text-emerald-500" /> Why timing matters
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm text-muted-foreground">
                  <div className="mt-1 shrink-0"><CheckCircle2 size={14} className="text-emerald-500" /></div>
                  <strong>First 30 Minutes:</strong> The TikTok algorithm tests your video with a small group. High engagement here triggers a wider push.
                </li>
                <li className="flex items-start gap-3 text-sm text-muted-foreground">
                  <div className="mt-1 shrink-0"><CheckCircle2 size={14} className="text-emerald-500" /></div>
                  <strong>User Recency:</strong> TikTok prioritizes fresh content. Posting when your followers are waking up or commuting is key.
                </li>
                <li className="flex items-start gap-3 text-sm text-muted-foreground">
                  <div className="mt-1 shrink-0"><CheckCircle2 size={14} className="text-emerald-500" /></div>
                  <strong>Global Reach:</strong> Our tool converts times to your timezone so you can reach the global "For You" page at the right moment.
                </li>
              </ul>
            </div>
            
            <div className="bg-primary text-primary-foreground rounded-3xl p-8 shadow-lg shadow-primary/20 relative overflow-hidden group">
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full -mb-16 -mr-16 blur-2xl group-hover:scale-150 transition-transform duration-700" />
              <h4 className="text-lg font-black mb-2 relative">Ready to go viral?</h4>
              <p className="text-sm text-primary-foreground/80 mb-4 relative">Our AI tool turns long videos into viral TikToks automatically.</p>
              <Link href="/#pricing" className="inline-flex items-center gap-2 bg-white text-primary font-bold px-6 py-3 rounded-xl hover:bg-secondary transition-colors relative">
                Get Started Free
              </Link>
            </div>
          </div>
        </div>

        

        {/* SEO Content */}
        <div className="prose prose-sm max-w-none text-muted-foreground border-t border-border pt-12">
          <h2 className="text-foreground font-extrabold text-2xl">The Ultimate Guide to TikTok Posting Times in 2025</h2>
          <p>Finding the best time to post on TikTok is the difference between 100 views and 100,000 views. In 2025, the TikTok algorithm has become even more sophisticated, prioritizing content that generates immediate high-retention and interaction.</p>
          
          <h3 className="text-foreground font-bold text-lg mt-8">What is the overall best time to post on TikTok?</h3>
          <p>Based on analysis of over 100,000 posts, the overall best times to post on TikTok are <strong>Tuesday at 9:00 AM, Thursday at 12:00 PM, and Friday at 5:00 AM (EST)</strong>. These slots consistently show the highest engagement across various niches.</p>

          <h3 className="text-foreground font-bold text-lg mt-8">Best time to post on TikTok by day (EST)</h3>
          <ul>
            <li><strong>Monday:</strong> 6 AM, 10 AM, 10 PM</li>
            <li><strong>Tuesday:</strong> 2 AM, 4 AM, 9 AM (Highest engagement day)</li>
            <li><strong>Wednesday:</strong> 7 AM, 8 AM, 11 PM</li>
            <li><strong>Thursday:</strong> 9 AM, 12 PM, 7 PM</li>
            <li><strong>Friday:</strong> 5 AM, 1 PM, 3 PM</li>
            <li><strong>Saturday:</strong> 11 AM, 7 PM, 8 PM</li>
            <li><strong>Sunday:</strong> 7 AM, 8 AM, 4 PM</li>
          </ul>

          <h3 className="text-foreground font-bold text-lg mt-8">How to find your personal best time to post</h3>
          <p>While global averages are a great starting point, your specific audience might have different habits. Here is how to find your unique peak times:</p>
          <ol>
            <li><strong>Check TikTok Analytics:</strong> Go to Profile → Settings → Creator Tools → Analytics.</li>
            <li><strong>Look at "Follower Activity":</strong> This shows exactly when your followers are online.</li>
            <li><strong>Analyze Top Posts:</strong> Look at your videos with the highest views and check what time they were published.</li>
            <li><strong>Test and Learn:</strong> Try posting at different times for a week and track the results using our calculator.</li>
          </ol>

          <h3 className="text-foreground font-bold text-lg mt-8">Does posting time actually matter for the FYP?</h3>
          <p>Yes. Although the "For You" page (FYP) isn&apos;t strictly chronological, the first batch of data TikTok collects comes from your followers and active users in your region. If you post when no one is online, your video may "die" before it ever has a chance to reach the wider FYP audience.</p>

          <div className="bg-secondary/30 rounded-2xl p-6 mt-10">
            <h3 className="text-foreground font-bold text-lg mb-4 mt-0">Explore More Free Tools</h3>
            <ul className="grid sm:grid-cols-2 gap-4 list-none p-0 m-0">
              <li><Link href="/tools/tiktok-coins-calculator" className="text-primary font-bold hover:underline">TikTok Coins to USD Calculator →</Link></li>
              <li><Link href="/tools/tiktok-caption-generator" className="text-primary font-bold hover:underline">TikTok Caption Generator →</Link></li>
              <li><Link href="/tools/hashtag-generator" className="text-primary font-bold hover:underline">Viral Hashtag Generator →</Link></li>
              <li><Link href="/tools/youtube-monetization-checker" className="text-primary font-bold hover:underline">YouTube Monetization Checker →</Link></li>
            </ul>
          </div>
        </div>

        
      </main>
    </div>
  );
}
