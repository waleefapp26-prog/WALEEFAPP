import { redirect } from "next/navigation";
import { DashboardScreen } from "@/components/dashboard/DashboardScreen";
import { getCandidateProfiles } from "@/lib/queries/profiles";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Middleware normally redirects unauthenticated visitors before they reach
  // here, but this page re-reads the session independently -- if the cookie is
  // expired or mid-refresh, `user` can still come back null. Guard rather than
  // assert with `user!`, which type-checks but throws at runtime and 500s the
  // whole route.
  if (!user) redirect("/login");

  const candidates = await getCandidateProfiles(supabase);

  // Drives the admin-only "Review queue" chip. Without an entry point the
  // moderation screens were unreachable unless you typed /admin by hand.
  const { data: me } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();

  return (
    <DashboardScreen
      initialCandidates={candidates}
      currentUserId={user.id}
      isAdmin={Boolean(me?.is_admin)}
    />
  );
}
