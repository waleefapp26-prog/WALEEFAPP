"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import styles from "@/styles/features/dashboard-header.module.css";
import { useUnreadNotificationCount } from "./NotificationCountProvider";

type Props = {
  /** "icon" is the circular button used in the mobile top bar; "rail" is the
   *  full-width labelled row used in the laptop side rail. */
  variant?: "icon" | "rail";
  className?: string;
};

export function NotificationBell({ variant = "icon", className }: Props) {
  const { dictionary } = useTranslation();
  const unreadCount = useUnreadNotificationCount();

  const label = dictionary.dashboardNav.notifications;
  const badge =
    unreadCount > 0 ? <span className={styles.badge}>{unreadCount > 9 ? "9+" : unreadCount}</span> : null;

  if (variant === "rail") {
    return (
      <Link href="/dashboard/notifications" className={cn(className)} aria-label={label}>
        <span className={styles.railIcon}>
          <Bell size={20} aria-hidden />
          {badge}
        </span>
        <span>{label}</span>
      </Link>
    );
  }

  return (
    <Link href="/dashboard/notifications" className={cn(styles.bellBtn, className)} aria-label={label}>
      <Bell size={20} aria-hidden />
      {badge}
    </Link>
  );
}
