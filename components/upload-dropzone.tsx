"use client";

import { useState } from "react";
import { UploadDropzone } from "@/lib/uploadthing";
import { FileVideo, Sparkles, AlertCircle } from "lucide-react";

interface SingleVideoUploaderProps {
  /** Called with the UploadThing URL, file size, and original filename when upload finishes. */
  onUploadComplete: (url: string, size: number, fileName: string) => Promise<void>;
  disabled?: boolean;
}

export default function SingleVideoUploader({
  onUploadComplete,
  disabled = false,
}: SingleVideoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="w-full max-w-2xl mx-auto border border-border bg-white rounded-3xl p-8 shadow-sm">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileVideo size={32} className="text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Upload Raw Video</h2>
        <p className="text-muted-foreground text-sm">
          Drag and drop your video file, or click to browse. MP4, MOV up to 64 MB.
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

      <div className="rounded-2xl overflow-hidden hover:border-primary/50 transition-colors bg-secondary/20 relative">
        <UploadDropzone
          endpoint="videoUploader"
          disabled={disabled}
          onUploadBegin={() => {
            setIsUploading(true);
            setError(null);
          }}
          onClientUploadComplete={async (res) => {
            setIsUploading(false);
            if (!res?.[0]) return;
            setIsProcessing(true);
            try {
              await onUploadComplete(res[0].ufsUrl, res[0].size, res[0].name);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Failed to create project");
              setIsProcessing(false);
            }
          }}
          onUploadError={(err: Error) => {
            setIsUploading(false);
            setError(`Upload failed: ${err.message}`);
          }}
          appearance={{
            container:
              "w-full p-12 min-h-[300px] flex flex-col items-center justify-center cursor-pointer",
            button:
              "bg-primary text-primary-foreground text-nowrap font-bold px-8 py-4 rounded-full mt-8 shadow-md hover:-translate-y-1 hover:shadow-lg transition-all text-base after:bg-primary/50 ut-uploading:cursor-not-allowed ut-uploading:opacity-60",
            label: "text-foreground font-semibold mt-4 text-base",
            allowedContent: "text-muted-foreground mt-2 font-medium",
            uploadIcon: "text-primary/60 w-16 h-16 mb-2",
          }}
        />

        {(isUploading || isProcessing) && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <p className="text-base text-primary font-bold flex items-center gap-2 animate-pulse bg-white px-4 py-1.5 rounded-full shadow-sm">
              <Sparkles size={16} className="text-accent" />
              {isProcessing ? "Creating project…" : "Uploading to cloud…"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
