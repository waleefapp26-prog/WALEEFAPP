"use server";

import type { PhotoModerationStatus } from "@/lib/types/photo";
import { createClient } from "@/lib/supabase/server";

export type SetPhotoModerationResult = { success: true } | { success: false; error: string };

/** Take a photo down (or restore it). Authorization is the
 *  profile_photos_update_admin RLS policy, not a check here -- so a non-admin
 *  calling this action directly updates zero rows rather than being trusted. */
export async function setPhotoModeration(
  photoId: string,
  status: PhotoModerationStatus,
): Promise<SetPhotoModerationResult> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profile_photos")
    .update({ moderation_status: status })
    .eq("id", photoId)
    .select("id");

  if (error) return { success: false, error: error.message };
  if (!data || data.length === 0) return { success: false, error: "Not authorized to moderate photos." };
  return { success: true };
}
