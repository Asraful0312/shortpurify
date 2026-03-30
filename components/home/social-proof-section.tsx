"use client"

import Image from "next/image";
import { ShieldCheck, Star } from "lucide-react";
import { motion } from "framer-motion";

function SocialProofSection() {
  return (
    <section id="testimonials" className="py-24 bg-white border-y border-border/40">
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="container mx-auto px-4 text-center"
      >
        <div className="inline-flex items-center justify-center p-4 bg-secondary rounded-2xl mb-6 shadow-sm">
          <ShieldCheck className="text-primary" size={36} />
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold mb-6 tracking-tight text-black">Built for creators, agencies & teams</h2>
        <p className="text-xl text-muted-foreground mb-16 max-w-2xl mx-auto leading-relaxed">
          From solo podcasters to content agencies — ShortPurify helps you turn long videos into scroll-stopping shorts without the grind.
        </p>

        {/* Platform Trust Marquee */}
        <div className="mb-20">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-8">Trusted by creators on</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
             <Image src="/icons/youtube.png" alt="YouTube" width={100} height={30} className="h-6 w-auto object-contain" />
             <Image src="/icons/tik-tok.png" alt="TikTok" width={100} height={30} className="h-7 w-auto object-contain" />
             <Image src="/icons/twitter.png" alt="X" width={100} height={30} className="h-5 w-auto object-contain" />
             <Image src="/icons/threads.png" alt="Threads" width={100} height={30} className="h-6 w-auto object-contain" />
             <Image src="/icons/bluesky-icon.png" alt="Bluesky" width={100} height={30} className="h-6 w-auto object-contain" />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 text-left">
          {[
            {
              quote: "ShortPurify saved me 15 hours a week. I just drop my 2-hour podcast and boom—I have a week's worth of TikToks.",
              author: "Alex Johnson",
              role: "Podcast Host",
              image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100",
            },
            {
              quote: "The AI clipping is scary accurate. It finds exactly the moments where the conversation gets heated or interesting.",
              author: "Sarah Meyer",
              role: "Twitch Streamer",
              image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100",
            },
            {
              quote: "I tried 4 other tools and they all felt clunky. This is the cleanest, easiest to use repurposer on the market.",
              author: "Marcus Thorne",
              role: "Agency Owner",
              image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100",
            }
          ].map((t, i) => (
            <div key={i} className="p-8 rounded-3xl bg-white border border-border/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] relative transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group">
              <div className="flex text-yellow-500 mb-6 drop-shadow-sm transition-transform group-hover:scale-105 origin-left">
                {[1,2,3,4,5].map(s => <Star key={s} size={18} fill="currentColor" />)}
              </div>
              <p className="text-lg text-foreground mb-8 font-medium leading-relaxed">"{t.quote}"</p>
              <div className="flex items-center gap-4 mt-auto">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20 shadow-sm">
                   <Image src={t.image} alt={t.author} width={48} height={48} className="object-cover w-full h-full" />
                </div>
                <div>
                  <div className="font-bold text-foreground">{t.author}</div>
                  <div className="text-sm text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}


export default SocialProofSection