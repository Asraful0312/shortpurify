"use client";

import { useState } from "react";
import { X, Loader2, ExternalLink, Eye, EyeOff } from "lucide-react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";

interface BlueskyConnectModalProps {
  open: boolean;
  onClose: () => void;
  onConnected: (handle: string) => void;
}

export function BlueskyConnectModal({ open, onClose, onConnected }: BlueskyConnectModalProps) {
  const [handle, setHandle] = useState("");
  const [appPassword, setAppPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const connectBluesky = useAction(api.blueskyActions.connectAccount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handle.trim() || !appPassword.trim()) return;
    setLoading(true);
    setError("");
    try {
      const result = await connectBluesky({ handle: handle.trim(), appPassword: appPassword.trim() });
      onConnected(result.handle);
      setHandle("");
      setAppPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect. Check your handle and app password.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setHandle("");
    setAppPassword("");
    setError("");
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm border border-border">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next-image */}
            <img src="/icons/bluesky-icon.png" alt="Bluesky" className="w-5 h-5" />
            <h2 className="text-base font-extrabold">Connect Bluesky</h2>
          </div>
          <button onClick={handleClose} disabled={loading} className="p-2 rounded-xl hover:bg-secondary transition-colors disabled:opacity-50">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Instructions */}
          <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-xs text-sky-800">
            <p className="font-bold mb-1">How to get an app password:</p>
            <ol className="list-decimal list-inside space-y-0.5">
              <li>Go to <a href="https://bsky.app/settings/app-passwords" target="_blank" rel="noopener noreferrer" className="underline font-semibold inline-flex items-center gap-0.5">bsky.app/settings/app-passwords <ExternalLink size={10} /></a></li>
              <li>Click <strong>Add App Password</strong></li>
              <li>Name it "ShortPurify" and copy the password</li>
            </ol>
          </div>

          {/* Handle */}
          <div>
            <label className="block text-sm font-bold mb-1.5">Bluesky Handle</label>
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="user.bsky.social"
              disabled={loading}
              className="w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
            />
          </div>

          {/* App Password */}
          <div>
            <label className="block text-sm font-bold mb-1.5">App Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={appPassword}
                onChange={(e) => setAppPassword(e.target.value)}
                placeholder="xxxx-xxxx-xxxx-xxxx"
                disabled={loading}
                className="w-full border border-border rounded-xl px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-red-600 font-medium bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!handle.trim() || !appPassword.trim() || loading}
            className="w-full bg-primary text-primary-foreground font-extrabold py-2.5 rounded-xl hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {loading ? <><Loader2 size={14} className="animate-spin" /> Connecting…</> : "Connect Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
