"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

type Props = {
  userId: string;
  /** Shown until the photo loads, and permanently if there isn't one. */
  fallback: string | null | undefined;
  alt?: string;
  className?: string;
  /** Applied to the <img> when a photo resolves; defaults to `className`. */
  imgClassName?: string;
};

/** A member's main photo, falling back to their initial.
 *
 *  Signed URLs expire after 60s, so this deliberately fetches at render time
 *  rather than embedding a URL in server-rendered HTML that would already be
 *  stale by the time a slow client painted it. */
export function MemberAvatar({ userId, fallback, alt = "", className, imgClassName }: Props) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setUrl(null);

    fetch(`/api/members/${userId}/avatar`)
      .then((res) => (res.ok ? res.json() : { url: null }))
      .then((data: { url: string | null }) => {
        if (!cancelled) setUrl(data.url);
      })
      .catch(() => {
        // Falls back to the initial; nothing useful to tell the viewer.
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt={alt} className={cn(imgClassName ?? className)} />;
  }

  return (
    <span className={cn(className)} aria-hidden>
      {fallback?.[0] ?? "?"}
    </span>
  );
}
