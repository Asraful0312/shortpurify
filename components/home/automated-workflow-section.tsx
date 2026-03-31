"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Send, UploadCloud, Users, Calendar } from "lucide-react";
import Image from "next/image";
import { AnimatedBeam } from "@/components/ui/animated-beam";
import { cn } from "@/lib/utils";

const Node = React.forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
  return (
    <motion.div
      ref={ref}
      initial={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      className={cn(
        "z-10 flex size-14 items-center justify-center rounded-full border-2 border-border/50 bg-white p-3 shadow-lg transition-all duration-300",
        className,
      )}
    >
      {children}
    </motion.div>
  );
});
Node.displayName = "Node";

export default function AutomatedWorkflowsSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const div1Ref = useRef<HTMLDivElement>(null);
  const div2Ref = useRef<HTMLDivElement>(null);
  const div3Ref = useRef<HTMLDivElement>(null);
  const div4Ref = useRef<HTMLDivElement>(null);
  const div5Ref = useRef<HTMLDivElement>(null);
  const div6Ref = useRef<HTMLDivElement>(null);
  const div7Ref = useRef<HTMLDivElement>(null);

  const benefits = [
    { title: "Direct Social Integration", text: "Connect YouTube, TikTok, X, Bluesky & Threads in one place." },
    { title: "One-Click Publishing", text: "Post to every social platform simultaneously from the Publish Hub." },
    { title: "Smart Scheduling", text: "Queue up your viral clips days or weeks in advance." },
    { title: "Team Collaboration", text: "Invite editors and managers to collaborate in shared workspaces." },
  ];

  return (
    <section id="workflows" className="py-24 bg-secondary/30 border-y border-border/40 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="container mx-auto px-4"
      >
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          <div className="lg:w-1/2 w-full order-2 lg:order-1">
            <div className="bg-white rounded-[2rem] border border-border/80 p-6 md:p-8 relative">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 bg-accent text-accent-foreground px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 rotate-12 z-20">
                <Send size={16} /> Publish Hub
              </div>
              <h4 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-border pb-4">
                <div className="w-3 h-3 rounded-full bg-green-500"></div> Live Publishing Map
              </h4>

              <div
                className="relative flex h-[350px] w-full items-center justify-center overflow-hidden rounded-3xl bg-secondary/10 p-4 shrink-0"
                ref={containerRef}
              >
                <div className="flex w-full max-w-[500px] flex-row items-center justify-between">
                  {/* Inputs */}
                  <div className="flex flex-col gap-10">
                    <Node ref={div1Ref}>
                      <Image src="/icons/youtube.png" alt="YouTube" width={28} height={28} />
                    </Node>
                    <Node ref={div2Ref}>
                      <UploadCloud className="text-primary" size={26} />
                    </Node>
                    <Node ref={div3Ref}>
                      <Image src="/icons/tik-tok.png" alt="TikTok" width={26} height={26} />
                    </Node>
                  </div>

                  {/* Center AI Node */}
                  <div className="flex flex-col justify-center">
                    <Node ref={div4Ref} className="size-20 border-primary shadow-[0_0_30px_rgba(var(--primary),0.3)] bg-white border-2 relative">
                      <motion.div 
                         initial={{ scale: 0.8, opacity: 0.5 }}
                         animate={{ scale: 1.2, opacity: 0 }}
                         transition={{ duration: 2, repeat: Infinity, repeatDelay: 0.5 }}
                         className="absolute inset-0 rounded-full bg-primary/20"
                      />
                      <Image src="/logo-small.png" alt="logo" width={44} height={44} className="relative z-10" />
                    </Node>
                  </div>

                  {/* Outputs */}
                  <div className="flex flex-col gap-10">
                    <Node ref={div5Ref}>
                      <Image src="/icons/youtube-short.png" alt="YouTube Shorts" width={26} height={26} />
                    </Node>
                    <Node ref={div6Ref}>
                      <Image src="/icons/twitter.png" alt="X" width={22} height={22} />
                    </Node>
                    <Node ref={div7Ref}>
                      <Image src="/icons/bluesky-icon.png" alt="Bluesky" width={26} height={26} />
                    </Node>
                  </div>
                </div>

                {/* Flowing Beams */}
                <AnimatedBeam containerRef={containerRef} fromRef={div1Ref} toRef={div4Ref} curvature={-50} pathColor="#FF0000" gradientStartColor="#FF0000" gradientStopColor="#FF0000" />
                <AnimatedBeam containerRef={containerRef} fromRef={div2Ref} toRef={div4Ref} pathColor="#3b82f6" gradientStartColor="#3b82f6" gradientStopColor="#3b82f6" />
                <AnimatedBeam containerRef={containerRef} fromRef={div3Ref} toRef={div4Ref} curvature={50} pathColor="#69C9D0" gradientStartColor="#69C9D0" gradientStopColor="#ee1d52" />
                <AnimatedBeam containerRef={containerRef} fromRef={div4Ref} toRef={div5Ref} curvature={50} pathColor="#FF0000" gradientStartColor="#FF0000" gradientStopColor="#FF0000" delay={0.5} />
                <AnimatedBeam containerRef={containerRef} fromRef={div4Ref} toRef={div6Ref} pathColor="#000000" gradientStartColor="#000000" gradientStopColor="#1DA1F2" delay={0.5} />
                <AnimatedBeam containerRef={containerRef} fromRef={div4Ref} toRef={div7Ref} curvature={-30} pathColor="#0085FF" gradientStartColor="#0085FF" gradientStopColor="#0085FF" delay={0.5} />
              </div>
            </div>
          </div>

          <div className="lg:w-1/2 order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6">
              <Send size={16} />
              <span className="text-sm font-bold">Multi-Platform Publishing</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6 tracking-tight">
              One upload.<br />Every platform.
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Stop copying clips between apps. ShortPurify's Publish Hub connects all your social accounts so you can post everywhere or schedule in advance without leaving the dashboard.
            </p>
            <ul className="grid grid-cols-1 gap-6 mb-10">
              {benefits.map((benefit, i) => (
                <li key={i} className="flex gap-5 items-start bg-white/50 p-4 rounded-2xl border border-transparent transition-all hover:bg-white hover:border-border hover:shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <h5 className="font-bold text-foreground text-lg mb-1">{benefit.title}</h5>
                    <p className="text-muted-foreground text-sm leading-relaxed">{benefit.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
