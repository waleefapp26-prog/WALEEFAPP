import { notFound, redirect } from "next/navigation";
import { ProfileViewScreen } from "@/components/screens/ProfileViewScreen";
import { getCompatibility } from "@/lib/matching/compatibility";
import { getProfileById } from "@/lib/queries/profiles";
import { recordProfileView } from "@/lib/queries/profileViews";
import { createClient } from "@/lib/supabase/server";

export default async function ProfileDetailPage({ params }: { params: Promise<{ profileId: string }> }) {
  const { profileId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await getProfileById(supabase, profileId);
  if (!profile) notFound();

  await recordProfileView(supabase, profileId);
  const compatibility = await getCompatibility(user.id, profile.id);

  return (
    <ProfileViewScreen
      profile={profile}
      matchPercentage={compatibility.overall}
      compatibility={compatibility.breakdown}
    />
  );
}
