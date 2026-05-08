"use client";

import { useState, useEffect } from "react";
import { Coins, DollarSign, Info, ArrowRightLeft, TrendingUp, Wallet } from "lucide-react";
import ToolsNavBar from "@/components/tools-nav-bar";
import ToolsCta from "@/components/tools-cta";
import ToolsBreadcrumb from "@/components/tools-breadcrumb";
import Link from "next/link";

// Average TikTok Coin rates (buying)
// 65 coins = $0.99
// 330 coins = $4.99
// 1 Coin ≈ $0.0152
const BUYING_RATE = 0.0152;
const PAYOUT_RATE = 0.005; // $0.01 per diamond, 2 diamonds = 1 coin payout approx, or 50% cut. 
// Actually TikTok gives $0.01 per diamond. 1 diamond = 1 coin from viewer. 
// So 1 coin viewer sends = 1 diamond for creator = $0.005 for creator (TikTok takes 50%).

export default function TikTokCoinsCalculator() {
  const [coins, setCoins] = useState<string>("1000");
  const [usd, setUsd] = useState<number>(0);
  const [mode, setMode] = useState<"buying" | "payout">("buying");

  useEffect(() => {
    const amount = parseFloat(coins) || 0;
    const rate = mode === "buying" ? BUYING_RATE : PAYOUT_RATE;
    setUsd(amount * rate);
  }, [coins, mode]);

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <main className="max-w-3xl mx-auto px-4 py-14">
        <ToolsBreadcrumb toolName="TikTok Coins to USD Calculator" toolHref="/tools/tiktok-coins-calculator" />
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-pink-50 text-pink-600 border border-pink-100 px-3 py-1 rounded-full text-xs font-semibold mb-4">
             {/* eslint-disable-next-line @next/next-image */}
             <img src="/icons/tik-tok.png" alt="TikTok" className="w-3.5 h-3.5 object-contain" /> Free Tool
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">
            TikTok Coins to USD Calculator
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Convert TikTok coins to real money instantly. Calculate how much coins cost to buy or how much a creator receives in USD.
          </p>
        </div>

        {/* Calculator Card */}
        <div className="bg-white border border-border rounded-3xl p-8 shadow-sm mb-8">
          <div className="flex flex-col gap-6">
            {/* Mode Switcher */}
            <div className="flex bg-secondary/50 p-1 rounded-2xl w-full max-w-md mx-auto">
              <button 
                onClick={() => setMode("buying")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${mode === "buying" ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                <TrendingUp size={16} /> Buying Value
              </button>
              <button 
                onClick={() => setMode("payout")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${mode === "payout" ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Wallet size={16} /> Creator Payout
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <label className="block text-sm font-bold text-muted-foreground uppercase tracking-wider">Amount of Coins</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500">
                    <Coins size={24} />
                  </div>
                  <input
                    type="number"
                    value={coins}
                    onChange={(e) => setCoins(e.target.value)}
                    placeholder="Enter coins..."
                    className="w-full bg-secondary/30 border border-border rounded-2xl pl-14 pr-4 py-5 text-2xl font-extrabold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              <div className="hidden md:flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
                  <ArrowRightLeft size={20} />
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-bold text-muted-foreground uppercase tracking-wider">Value in USD</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500">
                    <DollarSign size={24} />
                  </div>
                  <div className="w-full bg-emerald-50/50 border border-emerald-100 rounded-2xl pl-14 pr-4 py-5 text-2xl font-extrabold text-emerald-700">
                    {usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3 items-start">
              <Info size={18} className="text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-800 leading-relaxed">
                {mode === "buying" 
                  ? "Estimated cost when buying coins through the TikTok app. Prices vary slightly by region and platform (Apple/Google fees)." 
                  : "Estimated payout for creators. TikTok takes a ~50% commission on gifts. 1 diamond = $0.005 USD payout."}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Reference Table */}
        <div className="grid sm:grid-cols-2 gap-6 mb-12">
          <div className="bg-white border border-border rounded-3xl p-6 shadow-sm">
            <h3 className="font-extrabold text-lg mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-primary" /> Popular Buying Values
            </h3>
            <div className="space-y-3">
              {[100, 500, 1000, 5000, 10000].map(val => (
                <div key={val} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                  <span className="text-sm font-medium flex items-center gap-2"><Coins size={14} className="text-amber-500" /> {val.toLocaleString()}</span>
                  <span className="text-sm font-bold text-foreground">${(val * BUYING_RATE).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white border border-border rounded-3xl p-6 shadow-sm">
            <h3 className="font-extrabold text-lg mb-4 flex items-center gap-2">
              <Wallet size={18} className="text-emerald-500" /> Creator Earnings
            </h3>
            <div className="space-y-3">
              {[100, 500, 1000, 5000, 10000].map(val => (
                <div key={val} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                  <span className="text-sm font-medium flex items-center gap-2"><Coins size={14} className="text-amber-500" /> {val.toLocaleString()}</span>
                  <span className="text-sm font-bold text-emerald-600">${(val * PAYOUT_RATE).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

         <div className="mt-12">
          <ToolsCta 
            headerText="Turn your TikToks into long-term growth."
            subText="ShortPurify helps you repurpose your TikTok videos for YouTube Shorts and Instagram Reels automatically. Get more views with zero extra effort."
          />
        </div>

        {/* SEO Content */}
        <div className="prose prose-sm max-w-none text-muted-foreground border-t border-border pt-12">
          <h2 className="text-foreground font-extrabold text-2xl">TikTok Coins to USD: Everything You Need to Know</h2>
          <p>TikTok coins are the virtual currency used on the platform to support your favorite creators. Whether you&apos;re looking to send a Rose, a Galaxy, or the famous TikTok Universe gift, understanding the conversion rate is essential.</p>
          
          <h3 className="text-foreground font-bold text-lg mt-6">How much is 1 TikTok coin worth?</h3>
          <p>The value of a TikTok coin depends on whether you are buying it or receiving it as a creator:</p>
          <ul>
            <li><strong>Buying:</strong> 1 TikTok coin costs approximately <strong>$0.015 USD</strong> (1.5 cents). Prices are usually cheaper if you buy through the TikTok website instead of the mobile app to avoid Apple/Google platform fees.</li>
            <li><strong>Payout:</strong> For creators, 1 coin sent by a viewer is converted into 1 Diamond. TikTok takes a 50% cut, meaning 1 Diamond is worth <strong>$0.005 USD</strong> (0.5 cents).</li>
          </ul>

          <h3 className="text-foreground font-bold text-lg mt-6">TikTok Gift Values in USD (2025)</h3>
          <p>Here are some of the most popular TikTok gifts and their estimated real-world value:</p>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 font-bold">Gift Name</th>
                  <th className="py-2 font-bold">Coins</th>
                  <th className="py-2 font-bold">Cost to Buy</th>
                  <th className="py-2 font-bold">Creator Receives</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr><td className="py-2">Rose</td><td className="py-2">1</td><td className="py-2">$0.01</td><td className="py-2">$0.005</td></tr>
                <tr><td className="py-2">Finger Heart</td><td className="py-2">5</td><td className="py-2">$0.07</td><td className="py-2">$0.025</td></tr>
                <tr><td className="py-2">Galaxy</td><td className="py-2">1,000</td><td className="py-2">$15.20</td><td className="py-2">$5.00</td></tr>
                <tr><td className="py-2">Lion</td><td className="py-2">29,999</td><td className="py-2">$455.98</td><td className="py-2">$149.99</td></tr>
                <tr><td className="py-2">TikTok Universe</td><td className="py-2">34,999</td><td className="py-2">$531.98</td><td className="py-2">$174.99</td></tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-foreground font-bold text-lg mt-6">How to get TikTok coins for cheaper</h3>
          <p>To save money on TikTok coins, avoid buying them through the iOS or Android app. TikTok charges a premium on mobile devices to cover the 30% commission taken by Apple and Google. Instead, go to <strong>tiktok.com/coin</strong> on a web browser to purchase coins at the direct rate, which can save you up to 31%.</p>
          
          <h3 className="text-foreground font-bold text-lg mt-6">Other free creator tools</h3>
          <p>Boost your TikTok growth with our other free AI tools:</p>
          <ul className="grid sm:grid-cols-2 gap-2 list-none p-0">
            <li><Link href="/tools/tiktok-caption-generator" className="text-primary hover:underline">TikTok Caption Generator →</Link></li>
            <li><Link href="/tools/hashtag-generator" className="text-primary hover:underline">Viral Hashtag Generator →</Link></li>
            <li><Link href="/tools/video-aspect-ratio-calculator" className="text-primary hover:underline">Aspect Ratio Calculator →</Link></li>
          </ul>
        </div>

       
      </main>
    </div>
  );
}
