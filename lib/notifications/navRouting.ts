import type { DashboardNavItem } from "@/lib/config/dashboard";
import type { NotificationType } from "@/lib/notifications/types";

/** Which nav destination each notification type belongs to, so an unread
 *  notification raises a badge on the item it concerns rather than only on a
 *  single global bell. Keyed by the same labelKey the nav items use. */
const TYPE_TO_NAV: Record<NotificationType, DashboardNavItem["labelKey"]> = {
  new_match: "matches",
  high_compatibility_match: "matches",
  profile_like: "matches",
  new_message: "chats",
  wali_status_change: "family",
  payment_event: "premium",
  verification_status_change: "profile",
  profile_completion_reminder: "profile",
  optional_questions_requested: "profile",
};

export type NavUnreadCounts = Partial<Record<DashboardNavItem["labelKey"], number>>;

export function navKeyForNotification(type: NotificationType): DashboardNavItem["labelKey"] | undefined {
  return TYPE_TO_NAV[type];
}

/** Every notification type that belongs to a destination -- used to mark that
 *  section's notifications read once the member actually opens it. */
export function typesForNavKey(key: DashboardNavItem["labelKey"]): NotificationType[] {
  return (Object.keys(TYPE_TO_NAV) as NotificationType[]).filter((type) => TYPE_TO_NAV[type] === key);
}

export function tallyByNavKey(types: NotificationType[]): NavUnreadCounts {
  const counts: NavUnreadCounts = {};
  for (const type of types) {
    const key = navKeyForNotification(type);
    if (key) counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}
