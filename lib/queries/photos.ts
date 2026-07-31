import type { SupabaseClient } from "@supabase/supabase-js";
import type { PhotoModerationStatus, PhotoVisibility, ProfilePhoto } from "@/lib/types/photo";

type PhotoRow = {
  id: string;
  user_id: string;
  storage_path: string;
  is_main: boolean;
  visibility: PhotoVisibility;
  moderation_status: PhotoModerationStatus;
  created_at: string;
};

function mapPhotoRow(row: PhotoRow): ProfilePhoto {
  return {
    id: row.id,
    userId: row.user_id,
    storagePath: row.storage_path,
    isMain: row.is_main,
    visibility: row.visibility,
    moderationStatus: row.moderation_status,
    createdAt: row.created_at,
  };
}

export async function getPhotosForUser(supabase: SupabaseClient, userId: string): Promise<ProfilePhoto[]> {
  const { data, error } = await supabase
    .from("profile_photos")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return ((data as PhotoRow[] | null) ?? []).map(mapPhotoRow);
}

export async function setMainPhoto(supabase: SupabaseClient, userId: string, photoId: string): Promise<void> {
  const { error: clearError } = await supabase
    .from("profile_photos")
    .update({ is_main: false })
    .eq("user_id", userId)
    .eq("is_main", true);
  if (clearError) throw clearError;

  const { error } = await supabase.from("profile_photos").update({ is_main: true }).eq("id", photoId);
  if (error) throw error;
}

export async function updatePhotoVisibility(
  supabase: SupabaseClient,
  photoId: string,
  visibility: PhotoVisibility,
): Promise<void> {
  const { error } = await supabase.from("profile_photos").update({ visibility }).eq("id", photoId);
  if (error) throw error;
}

export async function deletePhoto(supabase: SupabaseClient, photoId: string): Promise<void> {
  const { error } = await supabase.from("profile_photos").delete().eq("id", photoId);
  if (error) throw error;
}
