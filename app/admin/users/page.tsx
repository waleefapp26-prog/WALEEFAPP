import { AdminUsersScreen } from "@/components/screens/admin/AdminUsersScreen";
import { getAllProfilesForAdmin } from "@/lib/queries/profiles";
import { createClient } from "@/lib/supabase/server";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const profiles = await getAllProfilesForAdmin(supabase);

  return <AdminUsersScreen profiles={profiles} />;
}
