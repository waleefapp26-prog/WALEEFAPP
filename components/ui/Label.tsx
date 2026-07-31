import { forwardRef, type LabelHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import styles from "@/styles/ui/form.module.css";

export type LabelProps = {
  requiredIndicator?: boolean;
} & LabelHTMLAttributes<HTMLLabelElement>;

export const Label = forwardRef<HTMLLabelElement, LabelProps>(function Label(
  { className, children, requiredIndicator, ...rest },
  ref,
) {
  return (
    <label ref={ref} className={cn(styles.label, className)} {...rest}>
      {children}
      {requiredIndicator ? <span className={styles.required} aria-hidden>*</span> : null}
    </label>
  );
});
