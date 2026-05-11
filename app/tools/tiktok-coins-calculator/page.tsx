"use client";

import { useState, useEffect } from "react";
import { Coins, DollarSign, Info, ArrowRightLeft, TrendingUp, Wallet } from "lucide-react";
import ToolsNavBar from "@/components/tools-nav-bar";
import ToolsCta from "@/components/tools-cta";
import ToolsBreadcrumb from "@/components/tools-breadcrumb";

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

      </main>
  );
}
