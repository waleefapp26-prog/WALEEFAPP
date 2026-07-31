import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import styles from "@/styles/features/landing.module.css";

type Tone = "default" | "white" | "tint";

type Props = {
  id?: string;
  tone?: Tone;
  children: ReactNode;
  className?: string;
};

export function LandingSection({ id, tone = "default", children, className }: Props) {
  return (
    <section
      id={id}
      className={cn(
        styles.section,
        tone === "white" && styles.sectionWhite,
        tone === "tint" && styles.sectionTint,
        className,
      )}
    >
      <div className={styles.sectionInner}>{children}</div>
    </section>
  );
}
