import { redirect } from "next/navigation";
import { MarkSectionRead } from "@/components/dashboard/MarkSectionRead";
import { FamilyPanelScreen } from "@/components/screens/FamilyPanelScreen";
import { getMatchesWithPartner } from "@/lib/queries/matches";
import { getWaliInvitesForUser } from "@/lib/queries/wali";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardFamilyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Inviting a guardian is per-match, so the panel needs the member's matches
  // to offer it at all.
  const [invites, matches] = await Promise.all([
    getWaliInvitesForUser(supabase, user.id),
    getMatchesWithPartner(supabase, user.id),
  ]);

  return (
    <>
      <MarkSectionRead navKey="family" />
      <FamilyPanelScreen invites={invites} matches={matches} />
    </>
  );
}
