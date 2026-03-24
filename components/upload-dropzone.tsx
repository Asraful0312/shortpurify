"use client";

import { useRef, useState } from "react";
import { useUploadFile } from "@convex-dev/r2/react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { FileVideo, Sparkles, AlertCircle, Upload } from "lucide-react";

interface SingleVideoUploaderProps {
  onUploadComplete: (url: string, size: number, fileName: string, key: string) => Promise<void>;
  disabled?: boolean;
}

export default function SingleVideoUploader({
  onUploadComplete,
  disabled = false,
}: SingleVideoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Official @convex-dev/r2 hook — handles presigned URL generation, PUT, and metadata sync
  const uploadFile = useUploadFile(api.r2);
  const getServingUrl = useAction(api.r2Actions.getServingUrl);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("video/")) {
      setError("Please select a video file.");
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // uploadFile returns the R2 key; progress isn't exposed by the hook so we
      // fake a simple pulse — swap for a custom XHR if you want real % later
      const key = await uploadFile(file, {
        onProgress: ({ loaded, total }) =>
          setUploadProgress(Math.round((loaded / total) * 100)),
      });

      setIsUploading(false);
      setIsProcessing(true);

      const serveUrl = await getServingUrl({ key });
      await onUploadComplete(serveUrl, file.size, file.name, key);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setIsUploading(false);
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled || isUploading || isProcessing) return;
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const busy = isUploading || isProcessing;

  return (
    <div className="w-full max-w-2xl mx-auto border border-border bg-white rounded-3xl p-8 shadow-sm">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileVideo size={32} className="text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Upload Raw Video</h2>
        <p className="text-muted-foreground text-sm">
          Drag and drop your video file, or click to browse. MP4, MOV up to 512 MB.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm font-bold px-4 py-3 rounded-xl mb-6 flex items-center gap-2 border border-red-200">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {disabled && (
        <div className="bg-amber-50 text-amber-700 text-sm font-semibold px-4 py-3 rounded-xl mb-4 border border-amber-200">
          Enter a project title above before uploading.
        </div>
      )}

      <div
        className={`rounded-2xl border-2 border-dashed transition-colors p-12 min-h-[300px] flex flex-col items-center justify-center ${
          disabled || busy
            ? "border-border/40 bg-secondary/10 cursor-not-allowed"
            : "border-border hover:border-primary/50 bg-secondary/20 cursor-pointer"
        }`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => !disabled && !busy && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={handleChange}
          disabled={disabled || busy}
        />

        {busy ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <p className="text-base text-primary font-bold flex items-center gap-2 animate-pulse bg-white px-4 py-1.5 rounded-full shadow-sm">
              <Sparkles size={16} className="text-accent" />
              {isProcessing ? "Creating project…" : `Uploading… ${uploadProgress}%`}
            </p>
            {isUploading && (
              <div className="w-48 bg-secondary rounded-full h-2">
                <div
                  className="bg-primary rounded-full h-2 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>
        ) : (
          <>
            <Upload size={40} className="text-primary/40 mb-4" />
            <p className="text-foreground font-semibold text-base mb-1">
              Drag &amp; drop or click to browse
            </p>
            <p className="text-muted-foreground text-sm">MP4, MOV, WebM — up to 512 MB</p>
            <button
              type="button"
              disabled={disabled}
              className="mt-8 bg-primary text-primary-foreground font-bold px-8 py-4 rounded-full shadow-md hover:-translate-y-1 hover:shadow-lg transition-all text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
            >
              Choose File
            </button>
          </>
        )}
      </div>
    </div>
  );
}
