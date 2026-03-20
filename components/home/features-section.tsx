"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Share2, TrendingUp, Zap, Video } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";

const icons = ["/icons/tik-tok.png", "/icons/instagram.png", "/icons/youtube.png", "/icons/twitter.png"]

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
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6">
            <span className="text-sm font-bold">Powerful AI Features</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4">Built for maximum engagement</h2>
          <p className="text-lg text-muted-foreground">Everything you need to grow your audience without spending hours in software.</p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Viral Hook Detection */}
          <div className="md:col-span-2 bg-white rounded-[2rem] border border-border/60 shadow-sm overflow-hidden flex flex-col relative group">
            <div className="p-8 pb-0 relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center">
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

          {/* Card 2: Auto-Captions */}
          <div className="md:col-span-1 bg-white rounded-[2rem] border border-border/60 shadow-sm overflow-hidden flex flex-col group">
            <div className="p-8 pb-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-4">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-2">Auto-Captions & B-Roll</h3>
              <p className="text-muted-foreground">Generates highly accurate, engaging captions dynamically.</p>
            </div>
            <div className="flex-1 bg-zinc-50 flex items-center justify-center min-h-[220px] overflow-hidden border-t border-border/20">
               <KaraokeText />
            </div>
          </div>

          {/* Card 3: Lightning Fast */}
          <div className="md:col-span-1 bg-white rounded-[2rem] border border-border/60 shadow-sm overflow-hidden flex flex-col group">
             <div className="p-8 pb-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 text-yellow-600 flex items-center justify-center mb-4">
                <Zap size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-2">Lightning Fast</h3>
              <p className="text-muted-foreground">Get 10 fresh clips from a 2-hour podcast in under 5 minutes.</p>
            </div>
            <div className="flex-1 bg-zinc-50 flex items-center justify-center min-h-[220px] overflow-hidden border-t border-border/20 p-4">
               <BurstVideo />
            </div>
          </div>

          {/* Card 4: Multi-Platform Export */}
          <div className="md:col-span-2 bg-white rounded-[2rem] border border-border/60 shadow-sm overflow-hidden flex flex-col md:flex-row relative group">
             <div className="p-8 md:w-1/2 flex flex-col justify-center border-b md:border-b-0 md:border-r border-border/20">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-4">
                <Share2 size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-2">Multi-Platform Export</h3>
              <p className="text-muted-foreground">Flawless aspect ratio morphing and safe-zones automatically optimized for TikTok, IG Reels, and YouTube.</p>
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