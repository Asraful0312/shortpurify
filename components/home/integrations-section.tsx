"use client"
import Image from "next/image";
import { motion } from "framer-motion";

function IntegrationsSection() {
  return (
    <section className="py-12 bg-white border-y border-border/40 overflow-hidden relative">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4"
      >
        <p className="text-center text-sm font-bold tracking-widest text-muted-foreground uppercase mb-8">Publish seamlessly to your favorite platforms</p>
        <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-700">
          <div className="flex items-center gap-2 font-bold text-xl"><Image src='/icons/youtube.png' className="size-8" alt="youtube" width={28} height={28} /> YouTube</div>
          <div className="flex items-center gap-2 font-bold text-xl"><Image src='/icons/instagram.png' className="size-8" alt="instagram" width={28} height={28} /> Instagram</div>
          <div className="flex items-center gap-2 font-bold text-xl"><Image src='/icons/twitter.png' className="size-6" alt="twitter" width={28} height={28} /> Twitter</div>
          <div className="flex items-center gap-2 font-bold text-xl"><Image src='/icons/snapchat.png' className="size-8" alt="snapchat" width={28} height={28} /> Snapchat</div>
          <div className="flex items-center gap-2 font-bold text-xl"><Image src='/icons/facebook.png' className="size-8" alt="facebook" width={28} height={28} /> Facebook</div>
          <div className="flex items-center gap-2 font-bold text-xl"><Image src='/icons/tik-tok.png' className="size-7" alt="tik-tok" width={28} height={28} /> TikTok</div>
        </div>
      </motion.div>
    </section>
  );
}

export default IntegrationsSection