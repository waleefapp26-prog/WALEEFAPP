import type { SupabaseClient } from "@supabase/supabase-js";
import { getProfileById } from "./profiles";

export type ConversationPreview = {
  id: string;
  otherParticipant: { id: string; fullName: string | null };
  lastMessage: { body: string; createdAt: string } | null;
};

export type ChatMessage = {
  id: string;
  /** Null for a guardian-authored message -- see waliSenderName instead. */
  senderId: string | null;
  waliSenderName: string | null;
  body: string;
  createdAt: string;
};

export type MessageReaction = {
  messageId: string;
  emoji: string;
  waliName: string;
};

export async function getConversationsForUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<ConversationPreview[]> {
  const { data: matches, error: matchesError } = await supabase
    .from("matches")
    .select("id, user_a, user_b")
    .or(`user_a.eq.${userId},user_b.eq.${userId}`);
  if (matchesError) throw matchesError;
  if (!matches || matches.length === 0) return [];

  const matchIds = matches.map((m) => m.id);
  const { data: conversations, error: convError } = await supabase
    .from("conversations")
    .select("id, match_id")
    .in("match_id", matchIds);
  if (convError) throw convError;
  if (!conversations || conversations.length === 0) return [];

  const { data: blockedRows } = await supabase.from("blocks").select("blocked_id").eq("blocker_id", userId);
  const blockedIds = new Set((blockedRows ?? []).map((b) => b.blocked_id));

  const visibleConversations = conversations.filter((conversation) => {
    const match = matches.find((m) => m.id === conversation.match_id)!;
    const otherId = match.user_a === userId ? match.user_b : match.user_a;
    return !blockedIds.has(otherId);
  });

  return Promise.all(
    visibleConversations.map(async (conversation) => {
      const match = matches.find((m) => m.id === conversation.match_id)!;
      const otherId = match.user_a === userId ? match.user_b : match.user_a;
      const otherProfile = await getProfileById(supabase, otherId);

      const { data: lastMessageRow } = await supabase
        .from("messages")
        .select("body, created_at")
        .eq("conversation_id", conversation.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      return {
        id: conversation.id,
        otherParticipant: { id: otherId, fullName: otherProfile?.fullName ?? null },
        lastMessage: lastMessageRow
          ? { body: lastMessageRow.body, createdAt: lastMessageRow.created_at }
          : null,
      };
    }),
  );
}

export async function getConversationById(
  supabase: SupabaseClient,
  id: string,
): Promise<{ id: string; matchId: string } | null> {
  const { data, error } = await supabase.from("conversations").select("id, match_id").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? { id: data.id, matchId: data.match_id } : null;
}

export async function getMessages(supabase: SupabaseClient, conversationId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("id, sender_id, wali_sender_name, body, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    senderId: row.sender_id,
    waliSenderName: row.wali_sender_name,
    body: row.body,
    createdAt: row.created_at,
  }));
}

/** Guardian reactions across every message in a conversation, for the member's own view of the chat. */
export async function getReactionsForConversation(
  supabase: SupabaseClient,
  conversationId: string,
): Promise<MessageReaction[]> {
  const { data, error } = await supabase
    .from("message_reactions")
    .select("emoji, message_id, messages!inner(conversation_id), wali_invites(wali_name)")
    .eq("messages.conversation_id", conversationId);
  if (error) throw error;
  return ((data ?? []) as unknown as Array<{
    emoji: string;
    message_id: string;
    wali_invites: { wali_name: string } | null;
  }>).map((row) => ({
    messageId: row.message_id,
    emoji: row.emoji,
    waliName: row.wali_invites?.wali_name ?? "Guardian",
  }));
}
