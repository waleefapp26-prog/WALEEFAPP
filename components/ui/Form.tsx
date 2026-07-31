import { forwardRef, type FormHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import styles from "@/styles/ui/form.module.css";

export type FormProps = {
  /** Applies vertical stack spacing between direct children (design-system form layout). */
  stack?: boolean;
} & FormHTMLAttributes<HTMLFormElement>;

export const Form = forwardRef<HTMLFormElement, FormProps>(function Form({ stack, className, noValidate = true, ...rest }, ref) {
  return <form ref={ref} className={cn(styles.form, stack && styles.stack, className)} noValidate={noValidate} {...rest} />;
});
