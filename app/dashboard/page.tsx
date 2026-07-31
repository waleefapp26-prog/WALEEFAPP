import { DashboardScreen } from "@/components/dashboard/DashboardScreen";
import { getCandidateProfiles } from "@/lib/queries/profiles";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const candidates = user ? await getCandidateProfiles(supabase) : [];

  return <DashboardScreen initialCandidates={candidates} currentUserId={user!.id} />;
}
