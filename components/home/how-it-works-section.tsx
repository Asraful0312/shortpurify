"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MousePointer2, Upload, FileVideo, Sparkles, Check, Download, Scissors } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

const AnimatedTutorialUI = ({ step }: { step: number }) => {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-6 min-h-[350px]">
      <AnimatePresence mode="wait">
        
        {step === 0 && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-sm h-[250px] border-2 border-dashed border-primary/40 rounded-3xl bg-white/80 backdrop-blur-md flex flex-col items-center justify-center gap-4 relative overflow-hidden shadow-sm"
          >
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-2">
              <Upload size={32} />
            </div>
            <p className="font-semibold text-muted-foreground text-center px-6">Drag & Drop your video or <span className="text-primary font-bold">Browse</span></p>
            
            <motion.div
              initial={{ x: 140, y: 150, opacity: 0 }}
              animate={{ x: 20, y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 1.5, ease: "easeOut" }}
              className="absolute z-50 text-foreground drop-shadow-xl"
            >
              <MousePointer2 size={36} fill="black" stroke="white" />
              <motion.div 
                animate={{ scale: [1, 0.5, 1], opacity: [0, 1, 0] }}
                transition={{ delay: 2, duration: 0.4 }}
                className="absolute -top-3 -left-3 w-10 h-10 bg-primary/40 rounded-full"
              />
            </motion.div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="analyze"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-sm h-[250px] bg-white rounded-3xl shadow-xl border border-border/50 flex flex-col items-center overflow-hidden relative"
          >
            <div className="w-full flex-1 bg-secondary/40 relative overflow-hidden flex flex-col items-center justify-center border-b border-border/50">
               <FileVideo size={56} className="text-muted-foreground/20" />
               <motion.div 
                 animate={{ y: ["-100%", "300%"] }}
                 transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                 className="absolute top-0 left-0 right-0 h-24 bg-linear-to-b from-transparent via-primary/20 to-primary/80 border-b-2 border-primary z-10"
               />
               
               {/* Floating analysis boxes */}
               <motion.div 
                 animate={{ opacity: [0, 1, 0] }}
                 transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                 className="absolute top-4 right-4 bg-yellow-400 text-black text-[10px] font-bold px-2 py-1 rounded shadow-sm"
               >
                 Hook Found
               </motion.div>
            </div>
            <div className="w-full p-6 flex flex-col gap-4 bg-white z-20">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Image src="/logo-small.png" alt="logo" width={24} height={24} />
                 </div>
                 <div>
                   <p className="font-extrabold text-sm text-foreground">AI is cooking...</p>
                   <p className="text-xs text-muted-foreground font-medium">Finding hooks & generating captions</p>
                 </div>
              </div>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 4.5, ease: "linear" }}
                  className="h-full bg-primary rounded-full relative"
                >
                   <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="publish"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-sm h-[250px] flex flex-col gap-4 relative justify-end"
          >
            <div className="flex gap-4 h-[180px]">
               {/* Mockup Shorts */}
               {[1, 2].map((i) => (
                 <motion.div 
                   key={i} 
                   initial={{ opacity: 0, scale: 0.8, y: 20 }}
                   animate={{ opacity: 1, scale: 1, y: 0 }}
                   transition={{ delay: i * 0.2, type: "spring" }}
                   className="flex-1 bg-[#1A1A1A] rounded-2xl overflow-hidden relative shadow-2xl border border-white/10 group"
                 >
                   <div className="absolute top-3 right-3 flex gap-2">
                     <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shadow-lg backdrop-blur-md">
                       <Scissors size={12} className="text-white" />
                     </div>
                     <div className="w-6 h-6 rounded-full bg-primary/90 flex items-center justify-center shadow-lg">
                       <Check size={14} className="text-white" />
                     </div>
                   </div>
                   <div className="absolute bottom-4 left-0 right-0 p-3">
                     <div className="h-2.5 w-full bg-white/20 rounded-full mb-2"></div>
                     <div className="h-2.5 w-2/3 bg-white/20 rounded-full mb-4"></div>
                     <div className="flex gap-2">
                        <div className="h-6 w-1/2 bg-white/10 rounded-md"></div>
                        <div className="h-6 w-8 bg-blue-500/80 rounded-md"></div>
                     </div>
                   </div>
                 </motion.div>
               ))}
               <div className="w-[12px] h-full bg-border/50 rounded-full shrink-0"></div>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex justify-between items-center bg-white px-5 py-3 rounded-2xl shadow-xl border border-border/80 relative z-20"
            >
               <span className="font-extrabold text-sm flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                 2 Viral Clips Ready
               </span>
               <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl text-sm font-bold shadow-md transition-all active:scale-95 flex items-center gap-1.5 border border-primary/20">
                 <Download size={16} /> Export All
               </button>

               <motion.div
                  initial={{ x: -20, y: 100, opacity: 0 }}
                  animate={{ 
                     x: [ -20, -190, -190, 0, 0, 0 ], 
                     y: [ 100, -160, -160, 0, 0, 0 ], 
                     opacity: [ 0, 1, 1, 1, 1, 0 ] 
                  }}
                  transition={{ 
                     delay: 1.0, 
                     duration: 2.8, 
                     times: [ 0, 0.25, 0.45, 0.8, 0.95, 1 ], 
                     ease: "easeInOut" 
                  }}
                  className="absolute z-50 text-foreground drop-shadow-2xl right-6 top-4 pointer-events-none"
                >
                  <MousePointer2 size={36} fill="black" stroke="white" strokeWidth={1.5} />
                  <motion.div 
                    animate={{ 
                      scale:   [1, 1, 0.4, 1, 1, 0.4, 1, 1], 
                      opacity: [0, 0, 1,   0, 0, 1,   0, 0] 
                    }}
                    transition={{ 
                      delay: 1.0, 
                      duration: 2.8, 
                      times: [0, 0.25, 0.3, 0.35, 0.8, 0.85, 0.9, 1] 
                    }}
                    className="absolute -top-3 -left-3 w-10 h-10 bg-primary/40 rounded-full"
                  />
                </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 4500); // sync with inner component auto-advance
    return () => clearInterval(timer);
  }, []);

  const steps = [
    { step: "01", title: "Upload your raw footage", desc: "Paste a YouTube link or drop your video file directly into our dashboard." },
    { step: "02", title: "AI analyzes & clips", desc: "ShortPurify finds the best moments, adds captions, and crops perfectly for mobile." },
    { step: "03", title: "Review & Publish", desc: "Preview your clips, make slight tweaks if needed, and export directly to your socials." }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-background">
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="container mx-auto px-4 max-w-6xl"
      >
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6">
              <span className="text-sm font-bold">Fast & Simple</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6 tracking-tight">Start posting in minutes, not hours.</h2>
            <p className="text-lg text-muted-foreground mb-12">
              We've boiled down the complex video editing process into three simple steps anyone can follow.
            </p>
            
            <div className="space-y-4 md:space-y-8">
              {steps.map((item, i) => {
                const isActive = activeStep === i;
                return (
                  <div 
                    key={i} 
                    className={cn(
                      "flex gap-6 group cursor-pointer transition-all duration-300 rounded-2xl p-4 md:-ml-4",
                      isActive ? "bg-secondary/40 border border-border/50 shadow-sm" : "hover:bg-secondary/20"
                    )}
                    onClick={() => setActiveStep(i)}
                  >
                    <div className={cn(
                      "shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 shadow-sm",
                      isActive ? "bg-primary text-primary-foreground shadow-primary/20 scale-110" : "bg-white border border-border text-muted-foreground group-hover:bg-white/80"
                    )}>
                      {item.step}
                    </div>
                    <div>
                      <h4 className={cn(
                        "text-xl font-bold mb-2 transition-colors duration-300",
                        isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground/80"
                      )}>{item.title}</h4>
                      <p className={cn(
                         "text-lg transition-colors duration-300",
                         isActive ? "text-muted-foreground" : "text-muted-foreground/60"
                      )}>{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="lg:w-1/2 w-full">
            <div className="aspect-square md:aspect-video lg:aspect-square bg-secondary/30 rounded-[2rem] border border-border overflow-hidden relative  flex flex-col group">
              {/* Safari Fake UI mockup */}
              <div className="h-12 border-b border-border bg-white flex items-center px-4 gap-2 shrink-0 z-20">
                <div className="w-3.5 h-3.5 rounded-full bg-[#FF5F56] border border-[#E0443E]"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] border border-[#DEA123]"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-[#27C93F] border border-[#1AAB29]"></div>
              </div>
              <div className="flex-1 flex items-center justify-center bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] relative transition-colors duration-700">
                 <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px]"></div>
                 <AnimatedTutorialUI step={activeStep} />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}