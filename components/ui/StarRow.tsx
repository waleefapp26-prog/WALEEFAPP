import { Star } from "lucide-react";
import { cn } from "@/lib/cn";
import styles from "@/styles/ui/star-row.module.css";

type Props = {
  count?: number;
  starSize?: number;
  label?: string;
  compact?: boolean;
  className?: string;
};

export function StarRow({ count = 5, starSize = 18, label, compact, className }: Props) {
  return (
    <div className={cn(styles.row, compact && styles.compact, className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} size={starSize} className={styles.star} aria-hidden />
      ))}
      {label ? <span className={styles.label}>{label}</span> : null}
    </div>
  );
}
