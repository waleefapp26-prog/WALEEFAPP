"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { navKeyForNotification, type NavUnreadCounts } from "@/lib/notifications/navRouting";
import type { NotificationType } from "@/lib/notifications/types";
import { createClient } from "@/lib/supabase/client";

const NotificationCountContext = createContext<NavUnreadCounts>({});

/** Unread counts per nav destination. */
export function useNavUnreadCounts() {
  return useContext(NotificationCountContext);
}

/** Total unread across every destination, for the bell. */
export function useUnreadNotificationCount() {
  const counts = useNavUnreadCounts();
  return Object.values(counts).reduce((sum, n) => sum + (n ?? 0), 0);
}

/** Owns the one Realtime subscription behind every unread badge.
 *
 *  The bell renders twice -- mobile top bar and laptop side rail -- and only
 *  one is ever visible, but both mount, because the other is hidden with CSS
 *  rather than unmounted. When each bell subscribed for itself, the second
 *  `supabase.channel("notifications:<id>")` threw "tried to subscribe multiple
 *  times" and took the whole dashboard down with a client-side exception.
 *  Subscribing once here and sharing the counts keeps every badge live without
 *  duplicating the channel. */
export function NotificationCountProvider({
  userId,
  initialCounts,
  children,
}: {
  userId: string;
  initialCounts: NavUnreadCounts;
  children: ReactNode;
}) {
  const [counts, setCounts] = useState<NavUnreadCounts>(initialCounts);

  useEffect(() => {
    // Signed-out shell: nothing to subscribe to, and an empty id would build
    // an invalid `user_id=eq.` filter.
    if (!userId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        (payload) => {
          const key = navKeyForNotification((payload.new as { type: NotificationType }).type);
          if (!key) return;
          setCounts((prev) => ({ ...prev, [key]: (prev[key] ?? 0) + 1 }));
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId]);

  return <NotificationCountContext.Provider value={counts}>{children}</NotificationCountContext.Provider>;
}
