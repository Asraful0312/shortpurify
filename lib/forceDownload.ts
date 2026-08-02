/** Fetches a URL as a blob and triggers a real file download instead of a browser navigation.
 * Needed because the `download` attribute on an <a> is ignored for cross-origin URLs
 * (like CDN-hosted video links), which makes the browser open/play the file instead
 * of downloading it. Returns false on failure (e.g. CORS) so the caller can fall back. */
export async function forceDownload(url: string, filename: string): Promise<boolean> {
  try {
    const res = await fetch(url);
    if (!res.ok) return false;
    const blob = await res.blob();
    downloadBlob(blob, filename);
    return true;
  } catch {
    return false;
  }
}

/** Triggers a download for a blob already in memory — no network request. */
export function downloadBlob(blob: Blob, filename: string): void {
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(blobUrl);
}
