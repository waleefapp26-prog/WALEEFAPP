import { notFound, redirect } from "next/navigation";
import { MarkSectionRead } from "@/components/dashboard/MarkSectionRead";
import { MyProfileScreen } from "@/components/screens/MyProfileScreen";
import { getProfileById } from "@/lib/queries/profiles";
import { createClient } from "@/lib/supabase/server";

/** The signed-in user's own profile. Until now the only profile route was
 *  /dashboard/profile/[profileId], which shows *other* members -- there was no
 *  way to review or edit your own details after onboarding. */
export default async function MyProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await getProfileById(supabase, user.id);
  if (!profile) notFound();

  return (
    <>
      <MarkSectionRead navKey="profile" />
      <MyProfileScreen profile={profile} />
    </>
  );
}
