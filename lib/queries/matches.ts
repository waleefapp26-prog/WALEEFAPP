import type { SupabaseClient } from "@supabase/supabase-js";
import type { Match } from "@/lib/types/match";
import type { WaliChatPermission } from "@/lib/types/wali";

const PERMISSION_RANK: Record<WaliChatPermission, number> = { none: 0, read: 1, react: 2, chat: 3 };

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

/** The highest chat permission among the requester's approved guardians for this match -- a match can now have more than one. */
export async function getWaliChatPermission(
  supabase: SupabaseClient,
  matchId: string,
  requesterId: string,
): Promise<WaliChatPermission> {
  const { data } = await supabase
    .from("wali_invites")
    .select("chat_permission")
    .eq("match_id", matchId)
    .eq("requester_id", requesterId)
    .eq("status", "approved");
  const rows = (data ?? []) as { chat_permission: WaliChatPermission }[];
  return rows.reduce<WaliChatPermission>(
    (max, row) => (PERMISSION_RANK[row.chat_permission] > PERMISSION_RANK[max] ? row.chat_permission : max),
    "none",
  );
}

export type MatchWithPartner = { matchId: string; partnerId: string; partnerName: string | null };

/** The user's matches with the other person's display name.
 *
 *  Needed by the Family panel: inviting a guardian is per-match, and the only
 *  way to reach that flow used to be the match-result screen shown once when a
 *  match is created -- leaving it stranded the member with no way back. */
export async function getMatchesWithPartner(
  supabase: SupabaseClient,
  userId: string,
): Promise<MatchWithPartner[]> {
  const { data, error } = await supabase
    .from("matches")
    .select("id, user_a, user_b")
    .or(`user_a.eq.${userId},user_b.eq.${userId}`)
    .order("created_at", { ascending: false });
  if (error) throw error;

  const rows = (data as { id: string; user_a: string; user_b: string }[] | null) ?? [];
  if (rows.length === 0) return [];

  const partnerIds = rows.map((r) => (r.user_a === userId ? r.user_b : r.user_a));
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, pseudonym")
    .in("id", partnerIds);

  const nameById = new Map(
    ((profiles as { id: string; full_name: string | null; pseudonym: string | null }[] | null) ?? []).map((p) => [
      p.id,
      p.pseudonym ?? p.full_name,
    ]),
  );

  return rows.map((row) => {
    const partnerId = row.user_a === userId ? row.user_b : row.user_a;
    return { matchId: row.id, partnerId, partnerName: nameById.get(partnerId) ?? null };
  });
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
