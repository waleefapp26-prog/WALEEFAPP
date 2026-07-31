import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import styles from "@/styles/ui/form.module.css";

export type FormActionsProps = {
  children: ReactNode;
  /** Horizontal row (e.g. cancel + submit). */
  row?: boolean;
  tight?: boolean;
} & Omit<HTMLAttributes<HTMLDivElement>, "children">;

export function FormActions({ children, row, tight, className, ...rest }: FormActionsProps) {
  return (
    <div className={cn(styles.actions, row && styles.actionsRow, tight && styles.actionsTight, className)} {...rest}>
      {children}
    </div>
  );
}
