import type { SupabaseClient } from "@supabase/supabase-js";

export type QuestionnaireAccessRequest = {
  id: string;
  viewerId: string;
  viewerName: string | null;
  status: "pending" | "approved" | "declined";
  createdAt: string;
};

type Row = {
  id: string;
  viewer_id: string;
  status: QuestionnaireAccessRequest["status"];
  created_at: string;
  profiles: { full_name: string | null; pseudonym: string | null }[] | null;
};

/** Requests *received* by `userId` -- matches asking them to answer the
 *  optional compatibility questions. The optional section stays locked until
 *  at least one of these exists. */
export async function getIncomingQuestionnaireRequests(
  supabase: SupabaseClient,
  userId: string,
): Promise<QuestionnaireAccessRequest[]> {
  const { data, error } = await supabase
    .from("questionnaire_access_requests")
    .select("id, viewer_id, status, created_at, profiles!questionnaire_access_requests_viewer_id_fkey(full_name, pseudonym)")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;

  return ((data as Row[] | null) ?? []).map((row) => ({
    id: row.id,
    viewerId: row.viewer_id,
    viewerName: row.profiles?.[0]?.pseudonym ?? row.profiles?.[0]?.full_name ?? null,
    status: row.status,
    createdAt: row.created_at,
  }));
}

/** Whether `viewerId` has been granted sight of `ownerId`'s optional answers. */
export async function hasApprovedQuestionnaireAccess(
  supabase: SupabaseClient,
  viewerId: string,
  ownerId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("questionnaire_access_requests")
    .select("status")
    .eq("viewer_id", viewerId)
    .eq("owner_id", ownerId)
    .maybeSingle();
  if (error) throw error;
  return (data as { status: string } | null)?.status === "approved";
}
