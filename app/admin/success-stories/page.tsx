import { AdminSuccessStoriesScreen } from "@/components/screens/admin/AdminSuccessStoriesScreen";
import { getAllSuccessStories } from "@/lib/queries/successStories";
import { createClient } from "@/lib/supabase/server";

export default async function AdminSuccessStoriesPage() {
  const supabase = await createClient();
  const stories = await getAllSuccessStories(supabase);

  return <AdminSuccessStoriesScreen stories={stories} />;
}
