import JSZip from "jszip";

/** Fetch a URL as a blob and trigger a browser download. */
export async function downloadVideo(url: string, filename: string): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: HTTP ${res.status}`);
  const blob = await res.blob();
  triggerBlobDownload(blob, filename.endsWith(".mp4") ? filename : `${filename}.mp4`);
}

/** Fetch multiple clips, zip them, and trigger a browser download. */
export async function downloadAllAsZip(
  clips: { url: string; title: string }[],
  zipName: string,
  onProgress?: (done: number, total: number) => void,
): Promise<void> {
  const zip = new JSZip();
  let done = 0;

  await Promise.all(
    clips.map(async (clip, i) => {
      const res = await fetch(clip.url);
      if (!res.ok) throw new Error(`Failed to fetch clip "${clip.title}": HTTP ${res.status}`);
      const blob = await res.blob();
      const safeName = clip.title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
      zip.file(`${String(i + 1).padStart(2, "0")}_${safeName}.mp4`, blob);
      done++;
      onProgress?.(done, clips.length);
    }),
  );

  const zipBlob = await zip.generateAsync({ type: "blob" });
  triggerBlobDownload(zipBlob, `${zipName}.zip`);
}

function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
