import type { SupabaseClient } from "@supabase/supabase-js";
import type { PhotoAccessRequest, PhotoAccessRequestStatus } from "@/lib/types/photoAccessRequest";

type Row = {
  id: string;
  viewer_id: string;
  owner_id: string;
  status: PhotoAccessRequestStatus;
  created_at: string;
  responded_at: string | null;
};

function mapRow(row: Row): PhotoAccessRequest {
  return {
    id: row.id,
    viewerId: row.viewer_id,
    ownerId: row.owner_id,
    status: row.status,
    createdAt: row.created_at,
    respondedAt: row.responded_at,
  };
}

export async function requestPhotoAccess(supabase: SupabaseClient, viewerId: string, ownerId: string): Promise<void> {
  const { error } = await supabase
    .from("photo_access_requests")
    .upsert({ viewer_id: viewerId, owner_id: ownerId }, { onConflict: "viewer_id,owner_id", ignoreDuplicates: true });
  if (error) throw error;
}

export async function getAccessRequestStatus(
  supabase: SupabaseClient,
  viewerId: string,
  ownerId: string,
): Promise<PhotoAccessRequest | null> {
  const { data, error } = await supabase
    .from("photo_access_requests")
    .select("*")
    .eq("viewer_id", viewerId)
    .eq("owner_id", ownerId)
    .maybeSingle();
  if (error) throw error;
  return data ? mapRow(data as Row) : null;
}

export async function getPendingAccessRequestsForOwner(
  supabase: SupabaseClient,
  ownerId: string,
): Promise<PhotoAccessRequest[]> {
  const { data, error } = await supabase
    .from("photo_access_requests")
    .select("*")
    .eq("owner_id", ownerId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data as Row[] | null) ?? []).map(mapRow);
}

export async function respondToAccessRequest(
  supabase: SupabaseClient,
  id: string,
  status: "approved" | "declined",
): Promise<void> {
  const { error } = await supabase
    .from("photo_access_requests")
    .update({ status, responded_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}
