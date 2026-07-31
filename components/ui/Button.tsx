import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes, type MouseEventHandler, type ReactNode, type Ref } from "react";
import { cn } from "@/lib/cn";
import styles from "@/styles/ui/button.module.css";

type Variant = "primary" | "secondary" | "outline" | "disabled" | "ctaOnGradient";

type Base = {
  children: ReactNode;
  variant?: Exclude<Variant, "disabled">;
  wide?: boolean;
  size?: "md" | "lg";
  disabled?: boolean;
  className?: string;
  href?: string;
  type?: "button" | "submit" | "reset";
  onClick?: MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
};

type ButtonProps = Base &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children" | "disabled"> & {
    href?: undefined;
    disabled?: boolean;
  };

type AnchorProps = Base & {
  href: string;
  disabled?: false;
};

export type ButtonComponentProps = ButtonProps | AnchorProps;

function classFor(
  variant: Exclude<Variant, "disabled"> | "disabled",
  wide: boolean | undefined,
  size: "md" | "lg",
  className: string,
) {
  const variantClass =
    variant === "primary"
      ? styles.primary
      : variant === "secondary"
        ? styles.secondary
        : variant === "outline"
          ? styles.outline
          : variant === "ctaOnGradient"
            ? styles.ctaOnGradient
            : styles.disabled;

  return cn(styles.button, variantClass, wide && styles.wide, size === "lg" && styles.lg, className);
}

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonComponentProps>(function Button(
  props,
  ref,
) {
  const {
    children,
    variant = "primary",
    wide,
    size = "md",
    disabled = false,
    className = "",
    href,
    onClick,
    type = "button",
    ...rest
  } = props;

  const effectiveVariant: Variant = disabled ? "disabled" : variant;
  const classes = classFor(effectiveVariant, wide, size, className);

  if (href) {
    if (href.startsWith("#")) {
      return (
        <a ref={ref as Ref<HTMLAnchorElement>} href={href} className={classes} onClick={onClick}>
          {children}
        </a>
      );
    }
    return (
      <Link ref={ref as Ref<HTMLAnchorElement>} href={href} className={classes} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button
      ref={ref as Ref<HTMLButtonElement>}
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
});
