import type { SupabaseClient } from "@supabase/supabase-js";
import { tallyByNavKey, type NavUnreadCounts } from "@/lib/notifications/navRouting";
import type { Notification } from "@/lib/types/notification";

type NotificationRow = {
  id: string;
  type: Notification["type"];
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
};

function mapNotificationRow(row: NotificationRow): Notification {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    link: row.link,
    read: row.read,
    createdAt: row.created_at,
  };
}

export async function getNotificationsForUser(supabase: SupabaseClient, userId: string): Promise<Notification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return ((data as NotificationRow[] | null) ?? []).map(mapNotificationRow);
}

export async function getUnreadNotificationCount(supabase: SupabaseClient, userId: string): Promise<number> {
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false);
  if (error) throw error;
  return count ?? 0;
}

/** Unread counts broken down by the nav destination each type belongs to, so
 *  the nav can badge the specific item a notification concerns. */
export async function getUnreadCountsByNavKey(
  supabase: SupabaseClient,
  userId: string,
): Promise<NavUnreadCounts> {
  const { data, error } = await supabase
    .from("notifications")
    .select("type")
    .eq("user_id", userId)
    .eq("read", false);
  if (error) throw error;
  return tallyByNavKey(((data as { type: Notification["type"] }[] | null) ?? []).map((r) => r.type));
}

export async function markNotificationRead(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from("notifications").update({ read: true }).eq("id", id);
  if (error) throw error;
}

export async function markAllNotificationsRead(supabase: SupabaseClient, userId: string): Promise<void> {
  const { error } = await supabase.from("notifications").update({ read: true }).eq("user_id", userId).eq("read", false);
  if (error) throw error;
}
