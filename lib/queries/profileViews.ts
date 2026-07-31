import type { SupabaseClient } from "@supabase/supabase-js";
import { getProfileById } from "./profiles";
import type { ProfileView } from "@/lib/types/profileView";

type Row = { id: string; viewer_id: string; created_at: string };

export async function getProfileViewsForUser(supabase: SupabaseClient, userId: string): Promise<ProfileView[]> {
  const { data, error } = await supabase
    .from("profile_views")
    .select("id, viewer_id, created_at")
    .eq("viewed_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;

  const rows = (data as Row[] | null) ?? [];
  return Promise.all(
    rows.map(async (row) => {
      const viewerProfile = await getProfileById(supabase, row.viewer_id);
      return {
        id: row.id,
        viewerId: row.viewer_id,
        viewerName: viewerProfile?.fullName ?? null,
        createdAt: row.created_at,
      };
    }),
  );
}

export async function recordProfileView(supabase: SupabaseClient, viewedId: string): Promise<void> {
  const { error } = await supabase.rpc("record_profile_view", { p_viewed_id: viewedId });
  if (error) throw error;
}
