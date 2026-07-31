import { cloneElement, isValidElement, useId, type ReactElement, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import styles from "@/styles/ui/form.module.css";
import { Label } from "@/components/ui/Label";

export type FormFieldProps = {
  /** Visible label; omit for icon-only / placeholder-only fields. */
  label?: string;
  /** Explicit control id (also used for `htmlFor`). If omitted, a stable id is generated. */
  id?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
};

function mergeControlId(child: ReactNode, controlId: string): ReactNode {
  if (!isValidElement(child)) return child;
  const el = child as ReactElement<{ id?: string }>;
  if (el.props.id) return child;
  return cloneElement(el, { id: controlId });
}

export function FormField({ label, id: idProp, hint, error, required, className, children }: FormFieldProps) {
  const uid = useId().replace(/:/g, "");
  const controlId = idProp ?? `field-${uid}`;

  const control = mergeControlId(children, controlId);

  return (
    <div className={cn(styles.field, className)}>
      {label ? (
        <Label htmlFor={controlId} requiredIndicator={required}>
          {label}
        </Label>
      ) : null}
      {control}
      {error ? (
        <p id={`${controlId}-error`} role="alert" className={styles.error}>
          {error}
        </p>
      ) : null}
      {hint && !error ? <p id={`${controlId}-hint`} className={styles.hint}>{hint}</p> : null}
    </div>
  );
}
