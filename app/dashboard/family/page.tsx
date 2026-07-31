import { redirect } from "next/navigation";
import { FamilyPanelScreen } from "@/components/screens/FamilyPanelScreen";
import { getWaliInvitesForUser } from "@/lib/queries/wali";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardFamilyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const invites = await getWaliInvitesForUser(supabase, user.id);

  return <FamilyPanelScreen invites={invites} />;
}
