"use client"

import Image from "next/image";
import { ShieldCheck, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface ReviewItem {
  quote: string;
  authorName: string;
  authorRole?: string;
  rating: number;
  image?: string;
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function ReviewCard({
  quote,
  authorName,
  authorRole,
  rating,
  image,
}: {
  quote: string;
  authorName: string;
  authorRole?: string;
  rating: number;
  image?: string;
}) {
  return (
    <div className="p-5 sm:p-8 rounded-3xl bg-white border border-border/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] relative transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group">
      <div className="flex text-yellow-500 mb-6 drop-shadow-sm transition-transform group-hover:scale-105 origin-left">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star key={s} size={18} fill={s <= rating ? "currentColor" : "none"} className={s <= rating ? "" : "text-border"} />
        ))}
      </div>
      <p className="text-lg text-foreground mb-8 font-medium leading-relaxed">"{quote}"</p>
      <div className="flex items-center gap-4 mt-auto">
        {image ? (
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20 shadow-sm shrink-0">
            <Image src={image} alt={authorName} width={48} height={48} className="object-cover w-full h-full" />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center shrink-0">
            <span className="text-sm font-extrabold text-primary">{initials(authorName)}</span>
          </div>
        )}
        <div>
          <div className="font-bold text-foreground">{authorName}</div>
          {authorRole && <div className="text-sm text-muted-foreground">{authorRole}</div>}
        </div>
      </div>
    </div>
  );
}

function SocialProofSection() {
  const rawReviews = useQuery(api.reviews.getApprovedReviews);

  // Don't render at all until we have data and there are 3+ approved reviews
  if (!rawReviews || rawReviews.length < 3) return null;

  const reviews: ReviewItem[] = rawReviews.map((r) => ({
    quote: r.reviewText,
    authorName: r.authorName,
    authorRole: r.authorRole,
    rating: r.rating,
  }));

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
        <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold mb-4 md:mb-6 tracking-tight text-black">
          Built for creators, agencies & teams
        </h2>
        <p className="text-base sm:text-xl text-muted-foreground mb-8 md:mb-16 max-w-2xl mx-auto leading-relaxed">
          From solo podcasters to content agencies — ShortPurify helps you turn long videos into scroll-stopping shorts without the grind.
        </p>

        {/* Platform Trust Marquee */}
        <div className="mb-10 md:mb-20">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-8">Trusted by creators on</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
            <Image src="/icons/youtube.png" alt="YouTube" width={100} height={30} className="h-6 w-auto object-contain" />
            <Image src="/icons/tik-tok.png" alt="TikTok" width={100} height={30} className="h-7 w-auto object-contain" />
            <Image src="/icons/threads.png" alt="Threads" width={100} height={30} className="h-6 w-auto object-contain" />
            <Image src="/icons/bluesky-icon.png" alt="Bluesky" width={100} height={30} className="h-6 w-auto object-contain" />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 md:gap-8 text-left">
          {reviews.slice(0, 3).map((r, i) => (
            <ReviewCard key={i} {...r} />
          ))}
        </div>

        {rawReviews.length > 3 && (
          <p className="mt-8 text-sm text-muted-foreground">
            + {rawReviews.length - 3} more reviews from real users
          </p>
        )}
      </motion.div>
    </section>
  );
}

export default SocialProofSection;
