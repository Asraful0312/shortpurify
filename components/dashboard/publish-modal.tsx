"use client";

import { useState } from "react";
import { Send, Calendar, CheckCircle2, X } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const PLATFORMS = [
  { id: "tiktok", name: "TikTok", color: "bg-black", textColor: "text-white", emoji: "🎵" },
  { id: "instagram", name: "Instagram Reels", color: "bg-gradient-to-br from-purple-500 to-pink-500", textColor: "text-white", emoji: "📸" },
  { id: "youtube", name: "YouTube Shorts", color: "bg-red-500", textColor: "text-white", emoji: "▶️" },
  { id: "linkedin", name: "LinkedIn", color: "bg-blue-600", textColor: "text-white", emoji: "💼" },
  { id: "twitter", name: "X / Twitter", color: "bg-gray-900", textColor: "text-white", emoji: "🐦" },
  { id: "snapchat", name: "Snapchat Spotlight", color: "bg-yellow-400", textColor: "text-black", emoji: "👻" },
];

interface PublishModalProps {
  open: boolean;
  onClose: () => void;
  clipTitle?: string;
}

export function PublishModal({ open, onClose, clipTitle }: PublishModalProps) {
  const [selected, setSelected] = useState<string[]>(["tiktok", "instagram"]);
  const [caption, setCaption] = useState("🔥 Check out this clip! #shorts #viral #content");
  const [mode, setMode] = useState<"now" | "schedule">("now");
  const [published, setPublished] = useState(false);

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));

  const handlePublish = () => {
    // TODO: call Convex uploadpost mutation
    setPublished(true);
    setTimeout(() => {
      setPublished(false);
      onClose();
    }, 2000);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div>
            <h2 className="text-lg font-extrabold">Publish Clip</h2>
            {clipTitle && <p className="text-sm text-muted-foreground mt-0.5 truncate max-w-xs">{clipTitle}</p>}
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-secondary transition-colors">
            <X size={18} />
          </button>
        </div>

        {published ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 size={32} className="text-green-600" />
            </div>
            <p className="font-extrabold text-xl">Published!</p>
            <p className="text-muted-foreground text-sm">Your clip is live on {selected.length} platform{selected.length !== 1 ? "s" : ""}.</p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Platform select */}
            <div>
              <p className="text-sm font-bold mb-3">Select Platforms</p>
              <div className="grid grid-cols-2 gap-2">
                {PLATFORMS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => toggle(p.id)}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all",
                      selected.includes(p.id)
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border bg-white text-muted-foreground hover:border-primary/30"
                    )}
                  >
                    <span className="text-base">{p.emoji}</span>
                    <span className="truncate">{p.name}</span>
                    {selected.includes(p.id) && (
                      <CheckCircle2 size={14} className="ml-auto shrink-0 text-primary" />
                    )}
                  </button>
                ))}
              </div>
              {selected.length === 0 && (
                <p className="text-xs text-red-500 mt-2 font-medium">Select at least one platform.</p>
              )}
            </div>

            {/* Caption */}
            <div>
              <p className="text-sm font-bold mb-2">Caption</p>
              <Textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={3}
                className="resize-none text-sm rounded-xl"
                placeholder="Write your caption…"
              />
              <p className="text-xs text-muted-foreground mt-1 text-right">{caption.length}/500</p>
            </div>

            {/* Publish mode */}
            <div>
              <p className="text-sm font-bold mb-2">When</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setMode("now")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all",
                    mode === "now"
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border text-muted-foreground hover:border-primary/30"
                  )}
                >
                  <Send size={14} /> Publish Now
                </button>
                <button
                  onClick={() => setMode("schedule")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all",
                    mode === "schedule"
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border text-muted-foreground hover:border-primary/30"
                  )}
                >
                  <Calendar size={14} /> Schedule
                </button>
              </div>
              {mode === "schedule" && (
                <input
                  type="datetime-local"
                  className="mt-2 w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              )}
            </div>

            {/* Action */}
            <button
              onClick={handlePublish}
              disabled={selected.length === 0}
              className="w-full bg-primary text-primary-foreground font-extrabold py-3 rounded-xl shadow-md hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Send size={16} />
              {mode === "now" ? `Publish to ${selected.length} Platform${selected.length !== 1 ? "s" : ""}` : "Schedule Post"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
