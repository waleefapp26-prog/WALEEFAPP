"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import styles from "@/styles/ui/reveal.module.css";

type Props = {
  children: ReactNode;
  className?: string;
};

export function Reveal({ children, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  // `armed` flips to true only once this effect has run, which proves JS is
  // alive and can drive the animation. Until then the content renders plainly
  // visible, so a hydration failure can no longer leave whole sections blank.
  const [armed, setArmed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Already on screen (e.g. above the fold): show it outright rather than
    // hiding it first and animating it back in, which would flash.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setVisible(true);
      return;
    }

    setArmed(true);
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setVisible(true);
        });
      },
      { threshold: 0.12 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        styles.reveal,
        armed && !visible && styles.revealHidden,
        visible && styles.revealVisible,
        className,
      )}
    >
      {children}
    </div>
  );
}
