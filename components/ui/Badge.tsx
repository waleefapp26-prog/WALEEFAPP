import { CheckCircle, Crown } from "lucide-react";
import { cn } from "@/lib/cn";
import styles from "@/styles/ui/badge.module.css";

type Props = {
  variant: "verified" | "premium";
  className?: string;
};

export function Badge({ variant, className }: Props) {
  const Icon = variant === "verified" ? CheckCircle : Crown;
  const variantClass = variant === "verified" ? styles.verified : styles.premium;

  return (
    <div className={cn(styles.badge, variantClass, className)}>
      <Icon size={14} aria-hidden />
      <span>{variant === "verified" ? "Verified" : "Premium"}</span>
    </div>
  );
}
