"use client";

import { Logo } from "@/components/ui/Logo";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import styles from "@/styles/features/auth.module.css";

export function AuthBrand() {
  const { dictionary } = useTranslation();
  return (
    <div className={styles.brand}>
      <Logo variant="auth" as="h1" />
      <p className={styles.tagline}>{dictionary.auth.tagline}</p>
    </div>
  );
}
