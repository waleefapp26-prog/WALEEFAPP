import { notFound, redirect } from "next/navigation";
import { MatchResultScreen } from "@/components/screens/MatchResultScreen";
import { getCompatibility } from "@/lib/matching/compatibility";
import { getConversationIdForMatch, getMatchById } from "@/lib/queries/matches";
import { getProfileById } from "@/lib/queries/profiles";
import { createClient } from "@/lib/supabase/server";

export default async function MatchResultPage({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const match = await getMatchById(supabase, matchId);
  if (!match || (match.userA !== user.id && match.userB !== user.id)) notFound();

  const otherUserId = match.userA === user.id ? match.userB : match.userA;
  const otherProfile = await getProfileById(supabase, otherUserId);
  if (!otherProfile) notFound();

  const conversationId = await getConversationIdForMatch(supabase, match.id);
  const compatibility = await getCompatibility(user.id, otherUserId, match.id);

  return (
    <MatchResultScreen
      matchId={match.id}
      name={otherProfile.fullName ?? "Your match"}
      percentage={compatibility.overall}
      conversationId={conversationId}
      strengths={compatibility.strengths}
      conflicts={compatibility.conflicts}
    />
  );
}
