"use client"

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
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by 10,000+ creators</h2>
        <p className="text-lg text-muted-foreground mb-16 max-w-2xl mx-auto">
          Join the community of podcasters, streamers, and marketers who have scaled their views effortlessly.
        </p>

        <div className="grid md:grid-cols-3 gap-8 text-left">
          {[
            {
              quote: "ShortPurify saved me 15 hours a week. I just drop my 2-hour podcast and boom—I have a week's worth of TikToks.",
              author: "Alex J.",
              role: "Podcast Host",
            },
            {
              quote: "The AI clipping is scary accurate. It finds exactly the moments where the conversation gets heated or interesting.",
              author: "Sarah M.",
              role: "Twitch Streamer",
            },
            {
              quote: "I tried 4 other tools and they all felt clunky. This is the cleanest, easiest to use repurposer on the market.",
              author: "Marcus T.",
              role: "Content Agency Owner"
            }
          ].map((t, i) => (
            <div key={i} className="p-8 rounded-2xl bg-background border border-border/80 shadow-sm relative transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group">
              <div className="flex text-yellow-500 mb-6 drop-shadow-sm transition-transform group-hover:scale-105 origin-left">
                {[1,2,3,4,5].map(s => <Star key={s} size={18} fill="currentColor" />)}
              </div>
              <p className="text-lg text-foreground mb-8 font-medium leading-relaxed">"{t.quote}"</p>
              <div className="flex items-center gap-4 mt-auto">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary border border-primary/20">
                  {t.author.charAt(0)}
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