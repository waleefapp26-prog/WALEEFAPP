import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import styles from "@/styles/ui/card.module.css";

type Variant = "default" | "profile" | "match" | "info";

export type CardProps = {
  children: ReactNode;
  variant?: Variant;
  onClick?: () => void;
} & Omit<HTMLAttributes<HTMLDivElement>, "onClick">;

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { children, variant = "default", onClick, className, ...rest },
  ref,
) {
  const variantClass =
    variant === "profile"
      ? styles.profile
      : variant === "match"
        ? styles.match
        : variant === "info"
          ? styles.info
          : styles.default;

  return (
    <div
      ref={ref}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={cn(styles.card, variantClass, onClick && styles.clickable, className)}
      onClick={onClick}
      {...rest}
    >
      {children}
    </div>
  );
});
