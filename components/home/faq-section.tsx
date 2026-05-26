"use client";

import { Plus, Minus } from "lucide-react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/motion-primitives/accordion";

const faqs = [
  {
    q: "What is ShortPurify and how does it work?",
    a: "ShortPurify is an AI-powered clip generator. You upload a long-form video (podcast, interview, webinar, YouTube video) and the AI finds the most engaging moments, smart-crops them to 9:16, burns in captions, and exports ready-to-post vertical clips for TikTok, Instagram Reels, YouTube Shorts, and more — in minutes.",
  },
  {
    q: "What happens if I stay on the free Starter plan?",
    a: "You keep access to 2 projects per month with 3 clips each — enough to test the product. But you'll be capped at 10-minute videos and every export will include a ShortPurify watermark. Most creators find they hit the limit within their first week once they see results. Pro Creator ($24/mo) removes the watermark, unlocks 30 projects, 8 clips per video, and up to 5-hour videos — typically paying for itself with a single viral clip.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes, absolutely. Cancel from your billing settings whenever you like — no questions asked, no penalties. Your plan stays active until the end of your current billing period and you keep access to all your clips until their retention window expires.",
  },
  {
    q: "Which social platforms does ShortPurify publish to?",
    a: "ShortPurify supports direct publishing to TikTok, Instagram Reels, YouTube Shorts, LinkedIn, Facebook, X (Twitter), Threads, and Bluesky. You can also download a ZIP of all clips and post manually.",
  },
  {
    q: "How long does it take to generate clips from a video?",
    a: "Most videos finish processing within 2–5 minutes. Processing time scales with video length — a 10-minute video typically takes around 2 minutes; a 60-minute video may take 5–8 minutes. You'll see a progress indicator while the AI works.",
  },
  {
    q: "Are captions added automatically?",
    a: "Yes. ShortPurify transcribes your video with AI and burns subtitles directly into each clip. You can choose from multiple caption styles (including animated word-by-word and comic styles) and adjust font, size, color, and position before exporting.",
  },
  {
    q: "Do the exported clips have a watermark?",
    a: "Free Starter plan clips include a small ShortPurify watermark. Upgrading to Pro Creator or Agency removes all watermarks from your exports.",
  },
  {
    q: "Can I use ShortPurify with my team or agency?",
    a: "Yes. The Agency plan ($79/mo) includes workspace support so multiple team members can collaborate on projects, share clips, and publish from a single account.",
  },
];

export default function FaqSection() {
  return (
    <section className="max-w-3xl mx-auto px-4 py-20">
      <div className="text-center mb-12">
        <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">FAQ</p>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Frequently asked questions</h2>
        <p className="mt-3 text-muted-foreground text-lg">Everything you need to know about ShortPurify.</p>
      </div>

      <Accordion
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      variants={{
        expanded: {
          opacity: 1,
          scale: 1,
        },
        collapsed: {
          opacity: 0,
          scale: 0.7,
        },
      }}
        className="space-y-3"
      >
        {faqs.map((faq, i) => (
          <AccordionItem
            key={i}
            value={i}
            className="bg-white border border-border rounded-2xl transition-shadow hover:shadow-sm"
          >
            <AccordionTrigger className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left">
              <span className="font-bold text-sm sm:text-base">{faq.q}</span>
              <span className="shrink-0 w-7 h-7 rounded-full bg-secondary/60 flex items-center justify-center text-muted-foreground">
                <Plus size={14} className="group-data-expanded:hidden" />
                <Minus size={14} className="group-data-closed:hidden" />
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="px-6 pb-5 pt-4 text-sm text-muted-foreground leading-relaxed border-t border-border">
                {faq.a}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
