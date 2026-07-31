import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import styles from "@/styles/ui/text-field.module.css";

export type TextFieldProps = {
  label?: string;
  error?: string;
  /** Figma-style: parent receives string value */
  onValueChange?: (value: string) => void;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
  onChange?: never;
};

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, error, className, id: idProp, onValueChange, ...rest },
  ref,
) {
  const uid = useId();
  const id = idProp ?? `tf-${uid.replace(/:/g, "")}`;

  return (
    <div className={cn(styles.root, className)}>
      {label ? (
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
      ) : null}
      <input
        ref={ref}
        id={id}
        className={cn(styles.input, error && styles.inputError)}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
        onChange={(e) => onValueChange?.(e.target.value)}
        {...rest}
      />
      {error ? (
        <span id={`${id}-err`} className={styles.errorText} role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
});
