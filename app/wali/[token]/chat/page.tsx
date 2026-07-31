import { notFound } from "next/navigation";
import { WaliChatViewScreen, type WaliChatMessage } from "@/components/screens/WaliChatViewScreen";
import { createClient } from "@/lib/supabase/server";

type MessageRpcRow = {
  id: string;
  sender_id: string;
  sender_name: string | null;
  body: string;
  created_at: string;
};

export default async function WaliChatPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_conversation_messages_for_wali", { p_token: token });
  if (error || !data) notFound();

  const messages: WaliChatMessage[] = (data as MessageRpcRow[]).map((row) => ({
    id: row.id,
    senderId: row.sender_id,
    senderName: row.sender_name,
    body: row.body,
    createdAt: row.created_at,
  }));

  return <WaliChatViewScreen messages={messages} />;
}
