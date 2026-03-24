"use client";

import { useState, useEffect } from "react";
import { SignUpButton } from "@clerk/clerk-react";
import { Star, BarChart2, Heart, MessageCircle, Send, Plus, Scissors, PlayCircle } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

// Helper component for counting up numbers
const AnimatedCounter = ({ from = 0, to = 85, delay = 1000 }) => {
  const [count, setCount] = useState(from);

  useEffect(() => {
    const startDelay = setTimeout(() => {
      let current = from;
      const step = Math.max(1, Math.ceil((to - from) / 40));
      const timer = setInterval(() => {
        current += step;
        if (current >= to) {
          clearInterval(timer);
          setCount(to);
        } else {
          setCount(current);
        }
      }, 30);
      return () => clearInterval(timer);
    }, delay);

    return () => clearTimeout(startDelay);
  }, [from, to, delay]);

  return <>{count}</>;
};

// Variants for staggered stars
const starContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 1.2,
    },
  },
};

const starItem = {
  hidden: { opacity: 0, scale: 0, rotate: -45 },
  show: { opacity: 1, scale: 1, rotate: 0, transition: { type: "spring" } },
};

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white pt-32 flex flex-col items-center border-b border-border/40">
      {/* Hero Text Content (Top) */}
      <div className="container mx-auto px-4 relative z-20 flex flex-col items-center text-center mt-12 mb-10">
        <h1 className="text-5xl md:text-[5.5rem] font-bold tracking-tight max-w-5xl text-black mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 leading-[1.05]">
          Automate long videos into <br className="hidden md:block" /> viral-ready shorts
        </h1>

        <p className="text-xl text-muted-foreground mb-10 max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100 leading-relaxed font-medium">
          Upload once. ShortPurify’s AI instantly finds your best moments, clips them, writes captions, scores virality, and prepares everything for <Image className="inline size-4" src='/icons/tik-tok.png' alt="tiktok" width={20} height={20}/> <Image className="inline size-4" src='/icons/youtube-short.png' alt="youtube short" width={20} height={20}/> <Image className="inline size-4" src='/icons/linkedin.png' alt="linkedin" width={20} height={20}/> <Image className="inline size-3" src='/icons/twitter.png' alt="twitter" width={20} height={20}/> <Image className="inline size-4" src='/icons/threads.png' alt="threads" width={20} height={20}/> and more saving you 10+ hours per week.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-200">
          <SignUpButton mode="modal">
            <button className="flex items-center justify-center bg-primary text-white border border-black/20 px-8 py-3.5 rounded-full text-base font-semibold transition-all cursor-pointer">
              Get Started Free
            </button>
          </SignUpButton>
        <button className="flex flex-1 sm:flex-none items-center justify-center gap-2 bg-white text-foreground border border-border px-8 py-4 rounded-full text-lg font-medium transition-all hover:bg-secondary hover:shadow-sm">
            <PlayCircle size={20} className="text-muted-foreground" />
            See It in Action (2 min demo)
          </button>
        </div>
      </div>

      {/* Visual Showcase Centerpiece (Bottom) */}
      <div className="relative w-full max-w-[1200px] h-[550px] mx-auto z-10 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
        
        {/* Localized Orbit/Gradient Background */}
        <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none z-0 flex items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,236,184,0.5)_0%,rgba(255,245,210,0.2)_40%,transparent_70%)]" />
            <div className="absolute w-[400px] h-[400px] border border-black/4 rounded-full" />
            <div className="absolute w-[600px] h-[600px] border border-black/3 rounded-full" />
            <div className="absolute w-[800px] h-[800px] border border-black/2 rounded-full" />
        </div>

        <div className="absolute bottom-[-15%] rounded-t-full left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-linear-to-t from-[#FFE492] via-[#FFF6D6] to-white/0 z-2"></div>

        {/* Floating Card 1: Top Left (Thumbnail with scissors) */}
        <motion.div 
          initial={{ opacity: 0, x: -100, y: -50, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4, type: "spring", bounce: 0.4 }}
          className="hidden md:block absolute top-[5%] left-[5%] md:left-[16%] z-20 "
        >
          <div className="w-36 h-36 bg-[#83BBE6] rounded-[2rem] shadow-xl overflow-hidden animate-float">
            <Image src="https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&q=80&w=400"  alt="Video edit" fill className="object-cover opacity-60 mix-blend-overlay rounded-3xl" />
            <div className="absolute top-3 left-3 bg-white px-2 py-1 rounded-[0.5rem] text-[10px] font-bold shadow-sm flex items-center gap-1 ">
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: [0, -45, 0, -45, 0] }}
                transition={{ duration: 0.6, delay: 1.5, ease: "easeInOut" }}
              >
                <Scissors size={10} />
              </motion.div>
              Auto-Crop
            </div>
            <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white px-1.5 py-0.5 rounded text-[9px] font-bold">
              2:01
            </div>
          </div>
        </motion.div>

        {/* Floating Card 3: Bottom Left (Stars) */}
        <motion.div 
          initial={{ opacity: 0, x: -60, y: 60, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.8, type: "spring", bounce: 0.4 }}
          className="hidden md:flex absolute top-[40%] left-[15%] md:left-[20%] z-10"
        >
          <motion.div 
            variants={starContainer}
            initial="hidden"
            animate="show"
            className="bg-white px-4 py-2 rounded-full shadow-lg border border-black/5 flex items-center gap-1.5 animate-float"
          >
            {[1,2,3,4,5].map(i => (
              <motion.div key={i} variants={starItem as any}>
                <Star className="text-[#E767B4] fill-[#E767B4] w-3.5 h-3.5" />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Floating Card 2: Middle Left (Engagement Yellow Card) */}
        <motion.div 
          initial={{ opacity: 0, x: -120, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6, type: "spring", bounce: 0.4 }}
          className="hidden md:block absolute top-[50%] left-0 md:left-[8%] z-20 "
        >
          <div className="bg-[#FFDA6C] p-4 rounded-2xl shadow-[0_15px_40px_-15px_rgba(255,215,95,0.7)] w-52 animate-float ">
            <div className="flex items-center gap-3 mb-2">
              <BarChart2 size={24} className="text-black/80" />
              <div>
                <p className="text-[9px] uppercase font-bold text-black/50 tracking-widest">Engagement</p>
                <h4 className="text-2xl font-black text-black leading-none">
                  <AnimatedCounter from={0} to={85} delay={1200} />% <span className="text-black/40 text-xs inline-block translate-y-[-4px]">↑</span>
                </h4>
              </div>
            </div>
            <div className="w-full h-1.5 bg-black/10 rounded-full mt-2 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "85%" }}
                transition={{ duration: 1.5, delay: 1.4, ease: "easeOut" }}
                className="h-full bg-black rounded-full" 
              />
            </div>
           </div>
        </motion.div>

        {/* The Central Phone */}
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[340px] h-[750px] bg-black rounded-[3.5rem] p-3.5 shadow-2xl z-20">
          <div className="w-full h-full bg-[#1A1A1A] rounded-[2.8rem] overflow-hidden relative border border-white/10">
            {/* Dynamic Island */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[100px] h-[30px] bg-black rounded-full z-30" />
            
            {/* Phone Content / Video Placeholder */}
            <div className="absolute inset-0 bg-linear-to-tr from-yellow-400 via-pink-500 to-purple-600">
               <div className="absolute inset-0 opacity-80 mix-blend-overlay flex justify-center items-center">
                  <div className="w-40 h-40 border-16 border-white/90 rounded-[3rem] relative animate-pulse">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-16 border-white/90 rounded-full" />
                    <div className="absolute top-3 right-3 w-4 h-4 bg-white/90 rounded-full" />
                  </div>
               </div>
            </div>

            {/* Live Overlay UI top */}
            <div className="absolute top-12 left-0 w-full px-5 flex justify-between items-center z-20">
              <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md rounded-full pr-3 p-1">
                <div className="w-7 h-7 rounded-full bg-linear-to-tr from-orange-400 to-pink-500 p-[2px]">
                   <div className="w-full h-full bg-white rounded-full overflow-hidden">
                     <Image src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100" alt="Avatar" width={28} height={28} />
                   </div>
                </div>
                <span className="text-white text-[11px] font-semibold">Sarah_Creator</span>
              </div>
              <div className="bg-[#FF453A] text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1.5 tracking-wide">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> LIVE
              </div>
            </div>

            {/* Captions Overlay bottom */}
            <div className="absolute top-[320px] w-full px-6 z-20 text-center">
              <p className="text-white text-2xl font-black uppercase drop-shadow-[0_2px_15px_rgba(0,0,0,0.6)] leading-tight tracking-tight">
                THIS AI TOOL IS <br/> INSANE! 🤯
              </p>
            </div>
          </div>
        </div>

        {/* Floating Card 4: Top Right (Green AI Detected Hooks) */}
        <motion.div 
          initial={{ opacity: 0, x: 100, y: -50, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5, type: "spring", bounce: 0.4 }}
          className="hidden md:block absolute top-[8%] right-[5%] md:right-[12%] z-20 "
        >
          <div className="bg-[#A8E6A1] p-4 rounded-3xl shadow-xl w-[200px] animate-float">
            <div className="flex justify-between items-start mb-1">
              <h4 className="text-[2.5rem] leading-none font-black text-green-950 flex items-baseline">12<span className="text-xs font-semibold ml-1">hooks</span></h4>
              <motion.div 
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 1.4, type: "spring", stiffness: 200, damping: 10 }}
                className="w-7 h-7 rounded-full bg-white/50 flex items-center justify-center"
              >
                <Plus className="text-green-900 w-4 h-4" />
              </motion.div>
            </div>
            <p className="text-green-900/70 text-[11px] font-bold mb-4">Detected this week</p>
            <div className="bg-[#d4f3d1] w-max px-3 py-1 rounded-full text-green-900 font-bold text-[10px] shadow-sm">
              Top 1% viral
            </div>
          </div>
        </motion.div>

        {/* Floating Card 5: Bottom Right (Social Feed Mock) */}
        <motion.div 
          initial={{ opacity: 0, x: 120, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.7, type: "spring", bounce: 0.4 }}
          className="hidden md:block absolute top-[42%] right-0 md:right-[5%] z-30"
        >
          <div className="bg-white p-2 rounded-3xl shadow-2xl border border-black/5 animate-float">
            <div className="relative w-44 h-28 rounded-2xl overflow-hidden mb-3">
               <Image src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=400" alt="Clip" fill className="object-cover" />
               <div className="absolute bottom-2 left-2 bg-[#523A28]/80 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-0.5 rounded-md">
                 1.5M views
               </div>
            </div>
            <div className="flex items-center justify-between px-3 pb-2 text-zinc-400">
               <div className="flex gap-3">
                 <motion.div
                   animate={{ scale: [1, 1.4, 1] }}
                   transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 1, ease: "easeInOut" }}
                 >
                   <Heart className="w-5 h-5 text-[#FF2D55] fill-[#FF2D55]" />
                 </motion.div>
                 <MessageCircle className="w-5 h-5" />
               </div>
               <Send className="w-4 h-4" />
            </div>
          </div>
        </motion.div>

      </div>

    </section>
  );
}