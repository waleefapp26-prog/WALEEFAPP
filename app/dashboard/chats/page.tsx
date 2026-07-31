import { redirect } from "next/navigation";
import { ChatListScreen } from "@/components/screens/ChatListScreen";
import { getConversationsForUser } from "@/lib/queries/conversations";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardChatsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const conversations = await getConversationsForUser(supabase, user.id);

  return <ChatListScreen conversations={conversations} />;
}
