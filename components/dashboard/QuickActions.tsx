"use client";

import { Camera, Lock, ShieldCheck, Sparkles, Wrench } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import styles from "@/styles/features/quick-actions.module.css";

type Props = {
  /** Admins get an extra chip to the review queues, which otherwise had no
   *  entry point anywhere in the app -- you had to know the /admin URL. */
  isAdmin?: boolean;
};

export function QuickActions({ isAdmin = false }: Props) {
  const { dictionary } = useTranslation();

  const actions = [
    { href: "/dashboard/questionnaire", icon: Sparkles, label: dictionary.quickActions.quiz, tone: styles.tonePink },
    { href: "/dashboard/photos", icon: Camera, label: dictionary.quickActions.photos, tone: styles.toneOrange },
    { href: "/dashboard/verification", icon: ShieldCheck, label: dictionary.quickActions.verify, tone: styles.toneGold },
    { href: "/dashboard/privacy", icon: Lock, label: dictionary.quickActions.privacy, tone: styles.toneSlate },
    ...(isAdmin
      ? [{ href: "/admin/verifications", icon: Wrench, label: dictionary.quickActions.admin, tone: styles.toneAdmin }]
      : []),
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
