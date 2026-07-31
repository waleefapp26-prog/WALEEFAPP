import { redirect } from "next/navigation";
import { PhotoManagerScreen } from "@/components/screens/PhotoManagerScreen";
import { getPendingAccessRequestsForOwner } from "@/lib/queries/photoAccessRequests";
import { getPhotosForUser } from "@/lib/queries/photos";
import { createClient } from "@/lib/supabase/server";

export default async function PhotosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [photos, accessRequests] = await Promise.all([
    getPhotosForUser(supabase, user.id),
    getPendingAccessRequestsForOwner(supabase, user.id),
  ]);

  return <PhotoManagerScreen userId={user.id} initialPhotos={photos} initialAccessRequests={accessRequests} />;
}
