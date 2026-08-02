import type { SupabaseClient } from "@supabase/supabase-js";

export type PhotoVisibilityRow = {
  user_id: string;
  storage_path: string;
  visibility: "public" | "matched" | "approved" | "hidden";
  moderation_status: "pending" | "approved" | "rejected";
};

/** Whether `viewerId` may see `photo`.
 *
 *  Kept in one place because two routes need it and the RLS policy
 *  `profile_photos_select_visible` encodes the same rules -- if they drift,
 *  a photo becomes listable but un-fetchable (or vice versa).
 *
 *  Note this is post-moderation: anything not explicitly rejected is live.
 *  Requiring 'approved' meant no photo was ever visible, because nothing ever
 *  moved a photo out of 'pending'. */
export async function canViewPhoto(
  service: SupabaseClient,
  photo: PhotoVisibilityRow,
  viewerId: string,
): Promise<boolean> {
  if (photo.user_id === viewerId) return true;
  if (photo.moderation_status === "rejected") return false;

  if (photo.visibility === "public") return true;

  if (photo.visibility === "matched") {
    const [lo, hi] = [viewerId, photo.user_id].sort();
    const { data } = await service.from("matches").select("id").eq("user_a", lo).eq("user_b", hi).maybeSingle();
    return Boolean(data);
  }

  if (photo.visibility === "approved") {
    const { data } = await service
      .from("photo_access_requests")
      .select("status")
      .eq("viewer_id", viewerId)
      .eq("owner_id", photo.user_id)
      .maybeSingle();
    return (data as { status: string } | null)?.status === "approved";
  }

  // "hidden": owner-only, no viewer ever passes.
  return false;
}
