import type { SupabaseClient } from "@supabase/supabase-js";
import type { WaliChatPermission, WaliInvite, WaliInviteStatus } from "@/lib/types/wali";

type WaliInviteRow = {
  id: string;
  requester_id: string;
  match_id: string | null;
  wali_name: string;
  wali_relation: string;
  wali_phone: string | null;
  wali_email: string;
  status: WaliInviteStatus;
  notes: string | null;
  created_at: string;
  responded_at: string | null;
  chat_permission: WaliChatPermission;
};

function mapWaliInviteRow(row: WaliInviteRow): WaliInvite {
  return {
    id: row.id,
    requesterId: row.requester_id,
    matchId: row.match_id,
    waliName: row.wali_name,
    waliRelation: row.wali_relation,
    waliPhone: row.wali_phone,
    waliEmail: row.wali_email,
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
    respondedAt: row.responded_at,
    chatPermission: row.chat_permission,
  };
}

export async function getWaliInvitesForUser(supabase: SupabaseClient, userId: string): Promise<WaliInvite[]> {
  const { data, error } = await supabase
    .from("wali_invites")
    .select("*")
    .eq("requester_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data as WaliInviteRow[] | null) ?? []).map(mapWaliInviteRow);
}
