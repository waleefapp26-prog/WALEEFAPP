import { useId } from "react";
import { cn } from "@/lib/cn";
import styles from "@/styles/ui/progress-bar.module.css";

export type ProgressBarProps = {
  currentStep: number;
  totalSteps: number;
  className?: string;
};

export function ProgressBar({ currentStep, totalSteps, className }: ProgressBarProps) {
  const gid = useId().replace(/:/g, "");
  const gradId = `wf-pb-grad-${gid}`;
  const w = (currentStep / totalSteps) * 100;
  const pct = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className={cn(styles.root, className)}>
      <div className={styles.meta}>
        <span className={styles.metaLabel}>
          Step {currentStep} of {totalSteps}
        </span>
        <span className={styles.metaPct}>{pct}%</span>
      </div>
      <svg viewBox="0 0 100 3" preserveAspectRatio="none" className={styles.svg} aria-hidden>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
            <stop stopColor="#ff6b9d" />
            <stop offset="1" stopColor="#ff8a5c" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="100" height="3" rx="1.5" fill="#e5e7eb" />
        <rect x="0" y="0" width={w} height="3" rx="1.5" fill={`url(#${gradId})`} />
      </svg>
    </div>
  );
}
