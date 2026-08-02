"use client";

import { useEffect, useRef, useState } from "react";

/** Fetches a remote video URL as a blob and exposes a local blob URL for <video src>.
 * Needed because some extractor URLs (e.g. cobalt tunnel links) don't serve a MIME
 * type the browser can stream directly, even though the raw bytes are valid — fetching
 * as a blob sidesteps that. The blob is also returned so a download button can reuse
 * it without a second network request. */
export function useVideoPreview(url: string | null | undefined) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const requestedUrlRef = useRef<string | null>(null);
  const activeObjectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (activeObjectUrlRef.current) {
      URL.revokeObjectURL(activeObjectUrlRef.current);
      activeObjectUrlRef.current = null;
    }
    // Resetting on a new url is intentional here — this effect synchronizes with an
    // external resource (a remote file fetch), matching React's own documented pattern
    // for data fetching in effects.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreviewUrl(null);
    setBlob(null);
    setFailed(false);

    if (!url) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    requestedUrlRef.current = url;
    setLoading(true);

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("preview fetch failed");
        return res.blob();
      })
      .then((b) => {
        if (cancelled || requestedUrlRef.current !== url) return;
        const objectUrl = URL.createObjectURL(b);
        activeObjectUrlRef.current = objectUrl;
        setBlob(b);
        setPreviewUrl(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  return { previewUrl, blob, loading, failed };
}
