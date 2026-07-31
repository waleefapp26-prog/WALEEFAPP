import Image from "next/image";
import { cn } from "@/lib/cn";
import styles from "@/styles/ui/logo.module.css";

type Variant = "nav" | "auth" | "dashboard" | "footer";

type Props = {
  variant: Variant;
  as?: "h1" | "span";
  className?: string;
  withMark?: boolean;
};

const variantClass: Record<Variant, string> = {
  nav: styles.nav,
  auth: styles.auth,
  dashboard: styles.dashboard,
  footer: styles.footer,
};

const markSize: Record<Variant, number> = {
  nav: 52,
  auth: 84,
  dashboard: 60,
  footer: 48,
};

export function Logo({ variant, as: Tag = "span", className, withMark = true }: Props) {
  return (
    <span className={cn(styles.lockup, className)}>
      {withMark ? (
        <Image
          src="/images/logo.png"
          alt=""
          width={markSize[variant]}
          height={markSize[variant]}
          className={styles.mark}
          priority={variant === "nav"}
        />
      ) : null}
      <Tag className={cn(styles.wordmark, variantClass[variant])}>Waleef</Tag>
    </span>
  );
}
