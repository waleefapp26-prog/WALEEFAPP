import type { SupabaseClient } from "@supabase/supabase-js";
import type { Match } from "@/lib/types/match";

type MatchRow = {
  id: string;
  user_a: string;
  user_b: string;
  status: "active" | "frozen";
  created_at: string;
};

function mapMatchRow(row: MatchRow): Match {
  return { id: row.id, userA: row.user_a, userB: row.user_b, status: row.status, createdAt: row.created_at };
}

export async function getMatchById(supabase: SupabaseClient, id: string): Promise<Match | null> {
  const { data, error } = await supabase.from("matches").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? mapMatchRow(data as MatchRow) : null;
}

export async function getConversationIdForMatch(supabase: SupabaseClient, matchId: string): Promise<string | null> {
  const { data, error } = await supabase.from("conversations").select("id").eq("match_id", matchId).maybeSingle();
  if (error) throw error;
  return (data as { id: string } | null)?.id ?? null;
}

export async function getWaliChatInvolvement(
  supabase: SupabaseClient,
  matchId: string,
  requesterId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("wali_invites")
    .select("chat_involved")
    .eq("match_id", matchId)
    .eq("requester_id", requesterId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as { chat_involved: boolean } | null)?.chat_involved ?? false;
}

/** Detailed compatibility questions unlock once the user has at least one mutual match. */
export async function hasAnyMatch(supabase: SupabaseClient, userId: string): Promise<boolean> {
  const { count, error } = await supabase
    .from("matches")
    .select("id", { count: "exact", head: true })
    .or(`user_a.eq.${userId},user_b.eq.${userId}`);
  if (error) throw error;
  return (count ?? 0) > 0;
}
