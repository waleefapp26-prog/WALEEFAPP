"use client";

import Link from "next/link";
import { useState } from "react";
import { Bell, Check, CreditCard, Heart, MessageCircle, Sparkles, ShieldCheck, Users } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import { createClient } from "@/lib/supabase/client";
import { markAllNotificationsRead, markNotificationRead } from "@/lib/queries/notifications";
import type { Notification, NotificationType } from "@/lib/types/notification";
import styles from "@/styles/features/notifications.module.css";

const TYPE_ICONS: Record<NotificationType, typeof Bell> = {
  new_match: Heart,
  new_message: MessageCircle,
  profile_like: Heart,
  wali_status_change: Users,
  verification_status_change: ShieldCheck,
  payment_event: CreditCard,
  high_compatibility_match: Sparkles,
  profile_completion_reminder: Bell,
  optional_questions_requested: MessageCircle,
};

type Props = {
  userId: string;
  initialNotifications: Notification[];
};

export function NotificationsScreen({ userId, initialNotifications }: Props) {
  const supabase = createClient();
  const { dictionary } = useTranslation();
  const [notifications, setNotifications] = useState(initialNotifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await markAllNotificationsRead(supabase, userId);
    } catch (err) {
      console.error("Failed to mark all notifications read", err);
    }
  };

  const handleOpen = (notification: Notification) => {
    if (notification.read) return;
    setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)));
    markNotificationRead(supabase, notification.id).catch((err) => {
      console.error("Failed to mark notification read", err);
    });
  };

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.topRow}>
          <h1 className={styles.title}>{dictionary.notificationsScreen.title}</h1>
          {unreadCount > 0 ? (
            <Button variant="outline" size="md" onClick={() => void handleMarkAllRead()}>
              <Check size={16} aria-hidden /> {dictionary.notificationsScreen.markAllRead}
            </Button>
          ) : null}
        </div>

        {notifications.length === 0 ? (
          <p className={styles.sub}>{dictionary.notificationsScreen.empty}</p>
        ) : (
          <div className={styles.cardList}>
            {notifications.map((notification) => {
              const Icon = TYPE_ICONS[notification.type] ?? Bell;
              const card = (
                <Card className={`${styles.row} ${!notification.read ? styles.unread : ""}`}>
                  <div className={styles.iconWrap}>
                    <Icon size={20} aria-hidden />
                  </div>
                  <div className={styles.body}>
                    <p className={styles.notifTitle}>{notification.title}</p>
                    {notification.body ? <p className={styles.notifBody}>{notification.body}</p> : null}
                    <p className={styles.notifTime}>{new Date(notification.createdAt).toLocaleString()}</p>
                  </div>
                </Card>
              );
              return notification.link ? (
                <Link
                  key={notification.id}
                  href={notification.link}
                  className={styles.linkReset}
                  onClick={() => handleOpen(notification)}
                >
                  {card}
                </Link>
              ) : (
                <div key={notification.id} onClick={() => handleOpen(notification)}>
                  {card}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
