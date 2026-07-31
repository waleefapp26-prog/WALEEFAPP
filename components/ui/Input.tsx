import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import styles from "@/styles/ui/input.module.css";

export type InputProps = {
  /** Renders a leading icon or adornment inside the field (adds left padding). */
  startAdornment?: ReactNode;
  /** When true, shows error border styling. */
  invalid?: boolean;
  className?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "size">;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { startAdornment, invalid, className, disabled, ...rest },
  ref,
) {
  const inputClass = cn(
    styles.input,
    startAdornment ? styles.inputWithStart : null,
    invalid ? styles.inputInvalid : null,
    className,
  );

  if (startAdornment) {
    return (
      <div className={styles.wrap}>
        <span className={styles.start}>{startAdornment}</span>
        <input ref={ref} className={inputClass} disabled={disabled} {...rest} />
      </div>
    );
  }

  return <input ref={ref} className={inputClass} disabled={disabled} {...rest} />;
});
