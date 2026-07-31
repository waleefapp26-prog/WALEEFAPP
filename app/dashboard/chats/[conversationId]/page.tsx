import { notFound, redirect } from "next/navigation";
import { ChatScreen } from "@/components/screens/ChatScreen";
import { getConversationById, getMessages } from "@/lib/queries/conversations";
import { getMatchById, getWaliChatInvolvement } from "@/lib/queries/matches";
import { getProfileById } from "@/lib/queries/profiles";
import { createClient } from "@/lib/supabase/server";

export default async function ChatThreadPage({ params }: { params: Promise<{ conversationId: string }> }) {
  const { conversationId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const conversation = await getConversationById(supabase, conversationId);
  if (!conversation) notFound();

  const match = await getMatchById(supabase, conversation.matchId);
  if (!match || (match.userA !== user.id && match.userB !== user.id)) notFound();

  const otherUserId = match.userA === user.id ? match.userB : match.userA;
  const otherProfile = await getProfileById(supabase, otherUserId);
  if (!otherProfile) notFound();

  const initialMessages = await getMessages(supabase, conversationId);
  const initialWaliInvolved = await getWaliChatInvolvement(supabase, conversation.matchId, user.id);

  return (
    <ChatScreen
      conversationId={conversationId}
      currentUserId={user.id}
      otherUserId={otherUserId}
      otherParticipantName={otherProfile.fullName ?? "Your match"}
      initialMessages={initialMessages}
      initialWaliInvolved={initialWaliInvolved}
      matchId={match.id}
      initialMatchStatus={match.status}
    />
  );
}
