"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import styles from "@/styles/features/dashboard-header.module.css";

type Props = {
  userId: string;
  initialUnreadCount: number;
};

export function NotificationBell({ userId, initialUnreadCount }: Props) {
  const supabase = createClient();
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);

  useEffect(() => {
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        () => setUnreadCount((c) => c + 1),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, userId]);

  return (
    <Link href="/dashboard/notifications" className={styles.bellBtn} aria-label="Notifications">
      <Bell size={20} />
      {unreadCount > 0 ? <span className={styles.badge}>{unreadCount > 9 ? "9+" : unreadCount}</span> : null}
    </Link>
  );
}
