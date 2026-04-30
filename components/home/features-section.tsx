"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Share2, TrendingUp, Zap, Video, Link2, Trophy, MousePointer2 } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";

const icons = ["/icons/tik-tok.png", "/icons/instagram.png", "/icons/youtube.png", "/icons/bluesky-icon.png"]

// --- Viral Hook Detection (Radar) Components ---
export const Circle = ({ className, idx, ...rest }: any) => {
  return (
    <motion.div
      {...rest}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: idx * 0.1, duration: 0.2 }}
      className={`absolute inset-0 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform rounded-full border border-black/5 ${className || ""}`}
    />
  );
};

export const Radar = ({ className }: { className?: string }) => {
  const circles = new Array(8).fill(1);
  return (
    <div className={`relative flex h-[400px] w-[400px] items-center justify-center rounded-full ${className || ""}`}>
      {/* Rotating sweep line */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "right center" }}
        className="absolute right-1/2 top-1/2 z-40 flex h-[5px] w-[200px] items-end justify-center overflow-hidden bg-transparent"
      >
        <div className="relative z-40 h-[2px] w-full bg-linear-to-r from-transparent via-primary to-transparent" />
      </motion.div>
      {/* Concentric circles */}
      {circles.map((_, idx) => (
        <Circle
          style={{
            height: `${(idx + 1) * 3}rem`,
            width: `${(idx + 1) * 3}rem`,
            border: `1px solid rgba(0, 0, 0, ${0.02 + (idx * 0.015)})`,
          }}
          key={`circle-${idx}`}
          idx={idx}
        />
      ))}
      
      {/* Detected Nodes / Hook indicators */}
      <motion.div 
        animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1, times: [0, 0.1, 0.8, 1] }}
        className="absolute top-[25%] left-[30%] z-50 bg-[#FFDA6C] text-black text-[10px] font-extrabold px-3 py-1.5 rounded-full shadow-lg border border-yellow-400"
      >
        Hook Found
      </motion.div>
      <motion.div 
        animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 3, repeat: Infinity, repeatDelay: 2.5, delay: 1.5, times: [0, 0.1, 0.8, 1] }}
        className="absolute bottom-[25%] right-[25%] z-50 bg-[#A8E6A1] text-green-950 text-[10px] font-extrabold px-3 py-1.5 rounded-full shadow-lg border border-green-300"
      >
        98% Viral
      </motion.div>
    </div>
  );
};

// --- Auto-Captions loop ---
const KaraokeText = () => {
  const words = ["This", "AI", "tool", "is", "absolutely", "insane!"];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length);
    }, 450); 
    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <div className="flex flex-wrap justify-center gap-y-3 gap-x-2 p-4">
      {words.map((word, i) => (
        <motion.span
          key={i}
          animate={{
            backgroundColor: i === currentIndex ? "#FFF041" : "transparent",
            color: i === currentIndex ? "#000000" : "#A1A1AA",
            scale: i === currentIndex ? 1.15 : 1,
            rotate: i === currentIndex ? (i % 2 === 0 ? -3 : 3) : 0,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="text-2xl md:text-3xl font-black uppercase px-2 py-1 rounded-lg transition-colors"
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
};

// --- Lightning Fast Burst Loop ---
const BurstVideo = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center min-h-[220px]">
      {/* Central Base Video */}
      <div className="relative z-20 w-16 h-24 bg-primary rounded-xl shadow-2xl border border-white/20 flex flex-col items-center justify-center">
        <Video className="text-white mb-1" size={24} />
      </div>

      {/* Bursting Short fragments */}
      {icons.map((icon,i) => (
        <motion.div
          key={i}
          className="absolute z-10 w-12 h-16 bg-white overflow-hidden rounded-xl shadow-lg border border-black/5 flex items-center justify-center"
          animate={{
             x: [0, (i % 2 === 0 ? 1 : -1) * (70 + Math.random() * 50)],
             y: [0, (i < 2 ? -1 : 1) * (60 + Math.random() * 50)],
             rotate: [0, (i % 2 === 0 ? 1 : -1) * (15 + Math.random() * 30)],
             scale: [0.5, 1],
             opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            repeatDelay: 0.2,
            delay: i * 0.15,
            ease: "easeOut",
          }}
        >
           <Image src={icon} alt="Short" width={20} height={20} className="opacity-80 drop-shadow-sm" />
        </motion.div>
      ))}
    </div>
  );
};

// --- Multi-Platform Morphing Loop ---
const PlatformMorph = () => {
  const platforms = [
    { label: "YouTube", aspectRatio: 16/9, icon: <Image src="/icons/youtube.png" alt="YT" width={40} height={40}/>, bg: "bg-red-500" },
    { label: "TikTok", aspectRatio: 9/16, icon: <Image src="/icons/tik-tok.png" alt="TT" width={36} height={36}/>, bg: "bg-black" },
    { label: "Instagram", aspectRatio: 1/1, icon: <Image src="/icons/instagram.png" alt="IG" width={40} height={40}/>, bg: "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600" }
  ];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % platforms.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center p-6 min-h-[250px]">
      <motion.div 
        animate={{ aspectRatio: platforms[index].aspectRatio }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
        className={`${platforms[index].bg} h-[180px] rounded-3xl shadow-2xl flex items-center justify-center border-4 border-white/90 relative overflow-hidden shrink-0 transition-colors duration-700`}
      >
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,white_0,transparent_100%)]"></div>
        <AnimatePresence mode="wait">
          <motion.div
            key={platforms[index].label}
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-2 relative z-10"
          >
            <div className="bg-white p-2 rounded-full shadow-lg">
                {platforms[index].icon}
            </div>
            <span className="text-white font-black tracking-wider text-[10px] drop-shadow-md uppercase mt-1">{platforms[index].label}</span>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

// --- YouTube Import Animation Loop ---
const YouTubeImportLoop = () => {
  const [stage, setStage] = useState(0); // 0: idle, 1: typing, 2: fetching, 3: results
  const url = "youtube.com/watch?v=dQw4w9WgXcQ";

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const startSequence = () => {
      setStage(0);
      timeoutId = setTimeout(() => {
        setStage(1);
        timeoutId = setTimeout(() => {
          setStage(2);
          timeoutId = setTimeout(() => {
            setStage(3);
            timeoutId = setTimeout(() => {
              startSequence();
            }, 3000);
          }, 2000);
        }, 1000);
      }, 1500);
    };

    startSequence();
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="w-full flex flex-col gap-4 relative">
      {/* Input Field with Cursor */}
      <div className="relative">
        <div className="flex items-center gap-2 bg-white border border-border rounded-xl px-4 py-3 shadow-sm relative z-10 overflow-hidden">
          <Image src="/icons/youtube.png" alt="YouTube" width={18} height={18} className="shrink-0" />
          <div className="text-[10px] sm:text-xs font-mono text-muted-foreground truncate flex items-center h-4">
            {stage >= 1 ? (
              <motion.span
                initial={{ width: 0 }}
                animate={{ width: "auto" }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="inline-block overflow-hidden whitespace-nowrap"
              >
                {url}
              </motion.span>
            ) : (
                <span className="opacity-40">Paste link here...</span>
            )}
            {stage === 1 && (
                <motion.div 
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="w-[2px] h-3 bg-primary ml-0.5" 
                />
            )}
          </div>
        </div>

        {/* Animated Hand/Cursor */}
        <AnimatePresence>
          {stage === 0 && (
            <motion.div
              initial={{ x: "130%", y: "150%", opacity: 0 }}
              animate={{ x: "70%", y: "50%", opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
              className="absolute top-0 left-0 z-20 pointer-events-none"
            >
              <div className="bg-white/95 backdrop-blur-sm p-1.5 rounded-full shadow-xl border border-black/5 ring-4 ring-primary/5 text-primary -translate-x-1/2 -translate-y-1/2">
                <MousePointer2 size={20} fill="currentColor" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Processing States */}
      <div className="min-h-[140px] flex flex-col gap-3">
        <AnimatePresence mode="wait">
          {stage === 2 && (
            <motion.div
              key="fetching"
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-xl px-4 py-4 shadow-xs"
            >
              <div className="relative flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-primary animate-ping absolute" />
                <div className="w-2.5 h-2.5 rounded-full bg-primary relative z-10" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-primary">Fetching & transcribing video…</span>
                <span className="text-[10px] text-primary/60 font-medium">Extracting AI highlights</span>
              </div>
            </motion.div>
          )}

          {stage === 3 && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col gap-3"
            >
              <div className="flex gap-2">
                {[
                  { score: 94, label: "Top Hook", color: "text-green-600", bg: "bg-green-500", bar: "bg-green-100" },
                  { score: 81, label: "Viral Pot", color: "text-amber-600", bg: "bg-amber-500", bar: "bg-amber-100" },
                  { score: 67, label: "Engaging", color: "text-blue-600", bg: "bg-blue-500", bar: "bg-blue-100" }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: i * 0.4, type: "spring", stiffness: 260, damping: 20 }}
                    className={`flex-1 bg-white border border-border rounded-xl p-3 flex flex-col items-center gap-1 shadow-sm hover:shadow-md transition-shadow group`}
                  >
                    <motion.span 
                        initial={{ scale: 1 }}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ delay: i * 0.4 + 0.5, duration: 0.3 }}
                        className={`text-sm font-black ${item.color}`}
                    >
                        {item.score}
                    </motion.span>
                    <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-tight">{item.label}</span>
                    <div className={`mt-1.5 w-full h-1 ${item.bar} rounded-full overflow-hidden`}>
                         <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ delay: i * 0.4 + 0.3, duration: 0.8 }}
                            className={`h-full ${item.bg}`} 
                         />
                    </div>
                  </motion.div>
                ))}
              </div>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="text-[10px] text-center text-muted-foreground font-medium italic"
              >
                "Hook at 0:24 is too strong to scroll past"
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default function FeaturesSection() {

  return (
    <section id="features" className="py-24 bg-secondary/20 border-t border-border/40">
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="container mx-auto px-4 max-w-6xl"
      >
        <div className="text-center max-w-2xl mx-auto mb-8 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6">
            <span className="text-sm font-bold">Powerful AI Features</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold mb-4">Built for maximum engagement</h2>
          <p className="text-base sm:text-lg text-muted-foreground">Everything you need to grow your audience without spending hours in software.</p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Viral Hook Detection */}
          <div className="md:col-span-2 bg-white rounded-[2rem] border border-border/60 shadow-sm overflow-hidden flex flex-col relative group">
            <div className="p-5 sm:p-8 pb-0 relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center">
              <div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <TrendingUp size={24} />
                </div>
                <h3 className="text-2xl font-bold mb-2">Viral Hook Detection</h3>
                <p className="text-muted-foreground">Our AI scans your entire video with pinpoint accuracy to find the moments with the highest retention potential.</p>
              </div>
            </div>
            <div className="relative h-[250px] w-full mt-auto flex items-end justify-center overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-t from-white via-transparent to-transparent z-10 pointer-events-none"></div>
                {/* Embedded Radar Graphic */}
                <Radar className="translate-y-1/2 scale-125 opacity-90" />
            </div>
          </div>

          {/* Card 2: Subtitle Editor */}
          <div className="md:col-span-1 bg-white rounded-[2rem] border border-border/60 shadow-sm overflow-hidden flex flex-col group">
            <div className="p-5 sm:p-8 pb-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-4">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-2">Subtitle Editor & Burn-in</h3>
              <p className="text-muted-foreground">Style your captions with custom fonts, colors, and highlights then burn them permanently into your exported clips.</p>
            </div>
            <div className="flex-1 bg-zinc-50 flex items-center justify-center min-h-[220px] overflow-hidden border-t border-border/20">
               <KaraokeText />
            </div>
          </div>

                 {/* Card 3: Viral Score */}
          <div className="md:col-span-1 bg-white rounded-[2rem] border border-border/60 shadow-sm overflow-hidden flex flex-col group">
            <div className="p-5 sm:p-8 pb-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center mb-4">
                <Trophy size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-2">Viral Score per Clip</h3>
              <p className="text-muted-foreground">Every clip gets an AI-generated score from 0–100 with a reason so you always know which clips to post first.</p>
            </div>
            <div className="flex-1 bg-zinc-50 flex flex-col items-center justify-center min-h-[180px] border-t border-border/20 p-6 gap-3">
              {[{ label: "Hook is too strong to scroll past", score: 94, color: "bg-green-500" }, { label: "Emotional moment — high share potential", score: 81, color: "bg-yellow-500" }, { label: "Solid value — good for retention", score: 67, color: "bg-blue-400" }].map((item, i) => (
                <div key={i} className="w-full flex items-center gap-3">
                  <span className="text-xs font-extrabold w-8 text-right shrink-0">{item.score}</span>
                  <div className="flex-1 h-2 bg-black/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${item.score}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: i * 0.2, ease: "easeOut" }}
                      className={`h-full ${item.color} rounded-full`}
                    />
                  </div>
                </div>
              ))}
              <p className="text-[10px] text-muted-foreground text-center mt-1">AI reasoning included with every score</p>
            </div>
          </div>

          {/* Card 4: YouTube Import */}
          <div className="md:col-span-2 bg-white rounded-[2rem] border border-border/60 shadow-sm overflow-hidden flex flex-col md:flex-row relative group">
            <div className="p-5 sm:p-8 md:w-1/2 flex flex-col justify-center border-b md:border-b-0 md:border-r border-border/20">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center mb-4">
                <Link2 size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-2">Import Any YouTube Video</h3>
              <p className="text-muted-foreground">Just paste a YouTube URL no downloading needed. ShortPurify fetches the video, transcribes it, and starts clipping automatically.</p>
            </div>
            <div className="md:w-1/2 bg-zinc-50 flex items-center justify-center overflow-hidden h-full min-h-[200px] p-8">
               <YouTubeImportLoop />
            </div>
          </div>

          {/* Card 5: Lightning Fast */}
          <div className="md:col-span-1 bg-white rounded-[2rem] border border-border/60 shadow-sm overflow-hidden flex flex-col group">
             <div className="p-5 sm:p-8 pb-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 text-yellow-600 flex items-center justify-center mb-4">
                <Zap size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-2">Lightning Fast</h3>
              <p className="text-muted-foreground">Get 4–6 ready-to-post clips from a 60-minute video in under 5 minutes no editing skills needed.</p>
            </div>
            <div className="flex-1 bg-zinc-50 flex items-center justify-center min-h-[220px] overflow-hidden border-t border-border/20 p-4">
               <BurstVideo />
            </div>
          </div>

          {/* Card 6: Multi-Platform Publish */}
          <div className="md:col-span-2 bg-white rounded-[2rem] border border-border/60 shadow-sm overflow-hidden flex flex-col md:flex-row relative group">
             <div className="p-5 sm:p-8 md:w-1/2 flex flex-col justify-center border-b md:border-b-0 md:border-r border-border/20">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-4">
                <Share2 size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-2">One-Click Multi-Platform Publish</h3>
              <p className="text-muted-foreground">Connect your accounts and publish directly to YouTube Shorts, TikTok, X, Bluesky, and Threads or schedule posts in advance.</p>
            </div>
            <div className="md:w-1/2 bg-zinc-50 flex items-center justify-center overflow-hidden h-full min-h-[250px] p-6">
               <PlatformMorph />
            </div>
          </div>

   

        </div>
      </motion.div>
    </section>
  );
}