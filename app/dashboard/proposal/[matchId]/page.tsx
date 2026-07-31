import { notFound, redirect } from "next/navigation";
import { ProposalFlowScreen } from "@/components/screens/ProposalFlowScreen";
import { getMatchById } from "@/lib/queries/matches";
import { createClient } from "@/lib/supabase/server";

export default async function ProposalPage({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const match = await getMatchById(supabase, matchId);
  if (!match || (match.userA !== user.id && match.userB !== user.id)) notFound();

  return <ProposalFlowScreen matchId={matchId} />;
}
