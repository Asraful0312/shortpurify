"use client";

import { useState, useEffect } from "react";
import { Star, X, Loader2, Check } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";

const STORAGE_KEY = "shortpurify_review_dismissed";

/**
 * Slides up from the bottom-right after `delayMs` when a project first completes.
 * Dismissed permanently via localStorage. Skipped if the user already reviewed.
 */
export function ReviewPrompt({ delayMs = 3000 }: { delayMs?: number }) {
  const { user } = useUser();
  const myReview = useQuery(api.reviews.getMyReview);
  const submitReview = useMutation(api.reviews.submitReview);

  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorRole, setAuthorRole] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Pre-fill name from Clerk
  useEffect(() => {
    if (user?.fullName) setAuthorName(user.fullName);
  }, [user?.fullName]);

  useEffect(() => {
    // Don't show if already dismissed this session or already reviewed
    if (typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY)) return;
    if (myReview !== null && myReview !== undefined) return;

    const t = setTimeout(() => setVisible(true), delayMs);
    return () => clearTimeout(t);
  }, [myReview, delayMs]);

  function dismiss() {
    setDismissed(true);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, "1");
  }

  async function handleSubmit() {
    if (!rating || !reviewText.trim() || !authorName.trim()) return;
    setSubmitting(true);
    try {
      await submitReview({
        rating,
        reviewText,
        authorName,
        authorRole: authorRole.trim() || undefined,
      });
      setSubmitted(true);
      setTimeout(dismiss, 2500);
    } finally {
      setSubmitting(false);
    }
  }

  if (dismissed || !visible || myReview) return null;

  const displayRating = hovered || rating;

  return (
    <div className="fixed bottom-6 right-6 z-200 w-[340px] bg-white rounded-3xl shadow-2xl border border-border animate-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-start justify-between p-5 pb-3">
        <div>
          <p className="font-extrabold text-sm">Enjoying ShortPurify? ⚡</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your review helps other creators find us.
          </p>
        </div>
        <button
          onClick={dismiss}
          className="p-1 rounded-full hover:bg-secondary transition-colors text-muted-foreground shrink-0 ml-2"
        >
          <X size={14} />
        </button>
      </div>

      {submitted ? (
        <div className="px-5 pb-6 flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <Check size={22} className="text-green-600" />
          </div>
          <p className="font-extrabold text-sm">Thank you! 🎉</p>
          <p className="text-xs text-muted-foreground">
            {rating >= 4
              ? "Your review will appear on our homepage soon."
              : "We appreciate your honest feedback!"}
          </p>
        </div>
      ) : (
        <div className="px-5 pb-5 flex flex-col gap-3">
          {/* Stars */}
          <div className="flex gap-1 justify-center py-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onMouseEnter={() => setHovered(s)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setRating(s)}
                className="transition-transform hover:scale-110 active:scale-95"
              >
                <Star
                  size={28}
                  className={s <= displayRating ? "text-yellow-400 fill-yellow-400" : "text-border"}
                  strokeWidth={1.5}
                />
              </button>
            ))}
          </div>

          {/* Only show text fields once a star is selected */}
          {rating > 0 && (
            <>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder={
                  rating >= 4
                    ? "What do you love most about it?"
                    : "What could we improve?"
                }
                rows={3}
                maxLength={280}
                className="w-full text-sm border border-border rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/60"
              />
              <div className="flex gap-2">
                <input
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Your name"
                  maxLength={50}
                  className="flex-1 text-sm border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <input
                  value={authorRole}
                  onChange={(e) => setAuthorRole(e.target.value)}
                  placeholder="Role (optional)"
                  maxLength={40}
                  className="flex-1 text-sm border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={submitting || !reviewText.trim() || !authorName.trim()}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-extrabold text-sm transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : "Submit Review"}
              </button>
            </>
          )}

          <button
            onClick={dismiss}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors text-center"
          >
            Maybe later
          </button>
        </div>
      )}
    </div>
  );
}
