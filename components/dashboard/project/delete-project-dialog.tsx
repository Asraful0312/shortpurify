"use client"

import { friendlyError } from "@/lib/utils";
import { AlertCircle, Loader2, Trash2, X } from "lucide-react";
import { useState } from "react";

function DeleteProjectDialog({
  projectTitle,
  clipCount,
  onConfirm,
  onClose,
}: {
  projectTitle: string;
  clipCount: number;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}) {
  const [typed, setTyped] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const confirmed = typed === projectTitle;

  const handleDelete = async () => {
    if (!confirmed || deleting) return;
    setDeleting(true);
    setError(null);
    try {
      await onConfirm();
    } catch (e) {
      setError(friendlyError(e));
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-300 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-border flex flex-col gap-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
              <Trash2 size={18} className="text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-foreground">Delete Project</h2>
              <p className="text-sm text-muted-foreground mt-0.5">This action cannot be undone.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={deleting}
            className="p-2 rounded-xl hover:bg-secondary transition-colors text-muted-foreground disabled:opacity-40 shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* What gets deleted */}
        <div className="mx-6 mb-5 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 space-y-1.5">
          <p className="text-sm font-bold text-red-800">The following will be permanently deleted:</p>
          <ul className="text-sm text-red-700 space-y-1">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              <p>Project <span className="font-semibold">&ldquo;{projectTitle}&rdquo;</span></p>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              {clipCount} clip{clipCount !== 1 ? "s" : ""} and all associated video files
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              All scheduled posts for this project
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              Transcript, captions, and subtitle settings
            </li>
          </ul>
        </div>

        {/* Type-to-confirm */}
        <div className="px-6 pb-5 space-y-2">
          <label className="text-sm font-bold text-foreground">
            Type <span className="font-mono bg-secondary px-1.5 py-0.5 rounded text-red-700">{projectTitle}</span> to confirm
          </label>
          <input
            type="text"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleDelete()}
            disabled={deleting}
            placeholder={projectTitle}
            autoFocus
            className="w-full border border-border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-400/40 bg-white disabled:opacity-50 placeholder:text-muted-foreground/40 mt-4"
          />
          {error && (
            <p className="text-xs text-red-600 font-medium flex items-center gap-1">
              <AlertCircle size={12} /> {error}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={deleting}
            className="flex-1 py-2.5 rounded-xl border border-border font-semibold text-sm hover:bg-secondary transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={!confirmed || deleting}
            className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {deleting ? (
              <><Loader2 size={15} className="animate-spin" /> Deleting…</>
            ) : (
              <><Trash2 size={15} /> Delete Forever</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteProjectDialog