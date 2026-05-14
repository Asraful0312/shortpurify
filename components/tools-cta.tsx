"use client"

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, PlayCircle, X } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react';



const ToolsCta = ({headerText, subText}: {headerText: string, subText: string}) => {
    const [showVideo, setShowVideo] = useState(false);

      // Close on ESC key
      useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === "Escape") setShowVideo(false);
        };
        if (showVideo) {
          window.addEventListener("keydown", handleKeyDown);
          document.body.style.overflow = "hidden";
        }
        return () => {
          window.removeEventListener("keydown", handleKeyDown);
          document.body.style.overflow = "unset";
        };
      }, [showVideo]);
  
  return (
    <>
     <div className="bg-primary rounded-3xl p-8 text-primary-foreground text-center">
          <h2 className="text-2xl font-extrabold mb-2">{headerText}</h2>
          <p className="text-primary-foreground/80 mb-6 max-w-md mx-auto">
            {subText}
          </p>
          <div className='flex items-center flex-wrap justify-center gap-2'>

          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-white text-primary font-bold px-6 py-3 rounded-xl hover:bg-white/90 transition-colors shadow-md"
          >
            Try ShortPurify Free <ArrowRight size={16} />
          </Link>

            <button 
            onClick={() => setShowVideo(true)}
            className="flex flex-1 sm:flex-none items-center justify-center gap-2 bg-white text-foreground border border-border px-6 py-3 rounded-full font-bold transition-all hover:bg-secondary hover:shadow-sm cursor-pointer"
          >
            <PlayCircle size={20} className="text-muted-foreground" />
            See Demo
          </button>
          </div>
          <p className="text-xs text-primary-foreground/60 mt-3">No credit card required · Free plan available</p>
        </div>

         {/* Video Modal Overlay */}
      <AnimatePresence>
        {showVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setShowVideo(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(255,215,95,0.2)] border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button 
                onClick={() => setShowVideo(false)}
                className="absolute top-4 right-4 z-20 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all border border-white/10"
              >
                <X size={24} />
              </button>

              {/* YouTube Embed */}
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/GDoQda6zZOU?autoplay=1"
                title="Product Demo"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default ToolsCta