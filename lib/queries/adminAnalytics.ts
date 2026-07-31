import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminAnalytics } from "@/lib/types/adminAnalytics";

type Row = {
  total_users: number;
  active_users_30d: number;
  total_matches: number;
  total_messages: number;
  paid_subscribers: number;
  conversion_rate: number;
};

export async function getAdminAnalytics(supabase: SupabaseClient): Promise<AdminAnalytics | null> {
  const { data, error } = await supabase.rpc("get_admin_analytics").maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const row = data as Row;
  return {
    totalUsers: row.total_users,
    activeUsers30d: row.active_users_30d,
    totalMatches: row.total_matches,
    totalMessages: row.total_messages,
    paidSubscribers: row.paid_subscribers,
    conversionRate: Number(row.conversion_rate),
  };
}
