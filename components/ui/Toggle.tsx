"use client";

import { cn } from "@/lib/cn";
import styles from "@/styles/ui/toggle.module.css";

export type ToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
};

export function Toggle({ checked, onChange, label, className }: ToggleProps) {
  return (
    <div className={cn(styles.row, className)}>
      {label ? <span className={styles.label}>{label}</span> : null}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(styles.track, checked && styles.trackOn)}
      >
        <span className={cn(styles.thumb, checked && styles.thumbOn)} />
      </button>
    </div>
  );
}
