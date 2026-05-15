"use client"

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, PlayCircle, X } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react';
import VideoModal from './VideoModal';



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
   <VideoModal showVideo={showVideo} setShowVideo={setShowVideo} videoId="GDoQda6zZOU" />
    </>
  )
}

export default ToolsCta