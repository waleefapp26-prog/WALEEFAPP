import { redirect } from "next/navigation";
import { PrivacyScreen } from "@/components/screens/PrivacyScreen";
import { getProfileById } from "@/lib/queries/profiles";
import { getProfileViewsForUser } from "@/lib/queries/profileViews";
import { createClient } from "@/lib/supabase/server";

export default async function PrivacyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profile, profileViews] = await Promise.all([
    getProfileById(supabase, user.id),
    getProfileViewsForUser(supabase, user.id),
  ]);

  return (
    <PrivacyScreen
      userId={user.id}
      initialIncognito={profile?.incognito ?? false}
      initialRetentionDays={profile?.chatRetentionDays ?? null}
      profileViews={profileViews}
    />
  );
}
