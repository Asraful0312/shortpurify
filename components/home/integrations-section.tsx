"use client"
import Image from "next/image";
import { motion } from "framer-motion";
import { Marquee } from "../ui/marquee";

function IntegrationsSection() {
  const live = [
    { src: "/icons/youtube-short.png", label: "YouTube Shorts" },
    { src: "/icons/tik-tok.png", label: "TikTok" },
    { src: "/icons/bluesky-icon.png", label: "Bluesky" },
    { src: "/icons/threads.png", label: "Threads" },
    { src: "/icons/instagram.png", label: "Instagram" },
    { src: "/icons/facebook.png", label: "Facebook" },
    { src: "/icons/twitter.png", label: "X/Twitter" },
    { src: "/icons/linkedin.png", label: "LinkedIn" },
  ];

  const comingSoon = [
    { src: "/icons/instagram.png", label: "Instagram" },
    { src: "/icons/facebook.png", label: "Facebook" },
    { src: "/icons/linkedin.png", label: "LinkedIn" },
  ];

  return (
    <section className="py-12 bg-white border-y border-border/40 overflow-hidden relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4"
      >
        <p className="text-center text-sm font-bold tracking-widest text-muted-foreground uppercase mb-6">
          Publish directly to 8 platforms
        </p>

        {/* Live platforms */}
        <Marquee pauseOnHover className="[--duration:30s]">
          {live.map(({ src, label }) => (
            <div key={label} className="flex items-center gap-2 font-bold text-lg opacity-80 hover:opacity-100 transition-opacity mx-4">
              <Image src={src} className={label === "X/Twitter" ? "size-5" : "size-7"} alt={label} width={28} height={28} />
              {label}
            </div>
          ))}
         
        </Marquee>

        {/* Coming soon */}
        {/* <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
          {comingSoon.map(({ src, label }) => (
            <div key={label} className="flex items-center gap-2 font-semibold text-sm text-muted-foreground/50 grayscale">
              <Image src={src} className="size-5" alt={label} width={20} height={20} />
              {label}
              <span className="text-[10px] font-bold uppercase tracking-wider bg-secondary px-2 py-0.5 rounded-full border border-border">
                Soon
              </span>
            </div>
          ))}
        </div> */}
      </motion.div>
    </section>
  );
}

export default IntegrationsSection;
