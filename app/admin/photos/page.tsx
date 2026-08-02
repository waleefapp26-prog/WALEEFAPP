import { AdminPhotosScreen, type AdminPhoto } from "@/components/screens/admin/AdminPhotosScreen";
import { createClient } from "@/lib/supabase/server";

type Row = {
  id: string;
  user_id: string;
  is_main: boolean;
  visibility: string;
  moderation_status: AdminPhoto["moderationStatus"];
  created_at: string;
  profiles: { full_name: string | null } | null;
};

export default async function AdminPhotosPage() {
  const supabase = await createClient();
  // profile_photos_select_admin makes the whole table readable here; a
  // non-admin reaching this page just sees their own photos.
  const { data } = await supabase
    .from("profile_photos")
    .select("id, user_id, is_main, visibility, moderation_status, created_at, profiles(full_name)")
    .order("created_at", { ascending: false });

  const photos: AdminPhoto[] = ((data as Row[] | null) ?? []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    ownerName: row.profiles?.full_name ?? null,
    visibility: row.visibility,
    moderationStatus: row.moderation_status,
    isMain: row.is_main,
    createdAt: row.created_at,
  }));

  return <AdminPhotosScreen photos={photos} />;
}
