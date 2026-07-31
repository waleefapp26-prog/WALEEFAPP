import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import styles from "@/styles/ui/tag.module.css";

export type TagProps = {
  label: string;
  selected?: boolean;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">;

export function Tag({ label, selected, className, type = "button", ...rest }: TagProps) {
  return (
    <button type={type} className={cn(styles.tag, selected && styles.selected, className)} {...rest}>
      {label}
    </button>
  );
}
