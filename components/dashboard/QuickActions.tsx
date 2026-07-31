"use client";

import { Camera, Lock, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import styles from "@/styles/features/quick-actions.module.css";

/** Replaces the stack of plain underlined links that used to sit under the
 *  dashboard heading -- same destinations, but scannable at a glance. */
export function QuickActions() {
  const { dictionary } = useTranslation();

  const actions = [
    { href: "/dashboard/questionnaire", icon: Sparkles, label: dictionary.quickActions.quiz, tone: styles.tonePink },
    { href: "/dashboard/photos", icon: Camera, label: dictionary.quickActions.photos, tone: styles.toneOrange },
    { href: "/dashboard/verification", icon: ShieldCheck, label: dictionary.quickActions.verify, tone: styles.toneGold },
    { href: "/dashboard/privacy", icon: Lock, label: dictionary.quickActions.privacy, tone: styles.toneSlate },
  ];

  return (
    <nav className={styles.row} aria-label={dictionary.quickActions.title}>
      {actions.map(({ href, icon: Icon, label, tone }) => (
        <Link key={href} href={href} className={styles.card}>
          <span className={`${styles.iconWrap} ${tone}`}>
            <Icon size={18} aria-hidden />
          </span>
          <span className={styles.label}>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
