"use client";

import { Languages } from "lucide-react";
import { cn } from "@/lib/cn";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import styles from "@/styles/ui/language-toggle.module.css";

export function LanguageToggle({ className }: { className?: string }) {
  const { locale, dictionary, setLocale } = useTranslation();

  return (
    <button
      type="button"
      className={cn(styles.toggle, className)}
      onClick={() => setLocale(locale === "en" ? "ar" : "en")}
      aria-label="Switch language"
    >
      <Languages size={16} aria-hidden />
      <span>{dictionary.common.languageToggle}</span>
    </button>
  );
}
