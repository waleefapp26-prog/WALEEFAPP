import { notFound } from "next/navigation";
import { WaliChatViewScreen, type WaliChatMessage, type WaliOwnReaction } from "@/components/screens/WaliChatViewScreen";
import type { WaliChatPermission } from "@/lib/types/wali";
import { createClient } from "@/lib/supabase/server";

type MessageRpcRow = {
  id: string;
  sender_id: string | null;
  sender_name: string | null;
  is_wali: boolean;
  body: string;
  created_at: string;
};

type ReactionRpcRow = { message_id: string; emoji: string };

export default async function WaliChatPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_conversation_messages_for_wali", { p_token: token });
  if (error || !data) notFound();

  const [{ data: permissionData }, { data: reactionData }, { data: inviteData }] = await Promise.all([
    supabase.rpc("get_wali_chat_permission", { p_token: token }),
    supabase.rpc("get_wali_reactions", { p_token: token }),
    supabase.rpc("get_wali_invite_by_token", { p_token: token }),
  ]);

  const messages: WaliChatMessage[] = (data as MessageRpcRow[]).map((row) => ({
    id: row.id,
    senderId: row.sender_id,
    senderName: row.sender_name,
    isWali: row.is_wali,
    body: row.body,
    createdAt: row.created_at,
  }));

  const reactions: WaliOwnReaction[] = ((reactionData as ReactionRpcRow[] | null) ?? []).map((row) => ({
    messageId: row.message_id,
    emoji: row.emoji,
  }));

  const permission = (permissionData as WaliChatPermission | null) ?? "none";
  const waliName = (inviteData as { wali_name: string }[] | null)?.[0]?.wali_name ?? "Guardian";

  return (
    <WaliChatViewScreen
      token={token}
      permission={permission}
      waliName={waliName}
      initialMessages={messages}
      initialReactions={reactions}
    />
  );
}
