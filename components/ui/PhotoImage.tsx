"use client";

import { useEffect, useState } from "react";

type Props = {
  photoId: string;
  alt: string;
  className?: string;
};

export function PhotoImage({ photoId, alt, className }: Props) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setUrl(null);
    setFailed(false);

    fetch(`/api/photos/${photoId}/signed-url`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        if (!cancelled) setUrl(data.url);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [photoId]);

  if (failed || !url) return null;

  // Signed URLs expire in 60s, so next/image's caching/optimization
  // pipeline doesn't apply here -- a plain img is the correct fit.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={alt} className={className} />;
}
