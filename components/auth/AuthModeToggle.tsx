"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import styles from "@/styles/features/auth.module.css";

type Mode = "login" | "signup";

type Props = {
  mode: Mode;
};

export function AuthModeToggle({ mode }: Props) {
  const { dictionary } = useTranslation();
  return (
    <div className={styles.toggle}>
      <div className={styles.toggleSlot}>
        <Link href="/login" className={cn(styles.toggleLink, mode === "login" && styles.toggleActive)}>
          {dictionary.auth.login}
        </Link>
      </div>
      <div className={styles.toggleSlot}>
        <Link href="/signup" className={cn(styles.toggleLink, mode === "signup" && styles.toggleActive)}>
          {dictionary.auth.signUp}
        </Link>
      </div>
    </div>
  );
}
