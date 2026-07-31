import { redirect } from "next/navigation";
import { NotificationsScreen } from "@/components/screens/NotificationsScreen";
import { getNotificationsForUser } from "@/lib/queries/notifications";
import { createClient } from "@/lib/supabase/server";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const notifications = await getNotificationsForUser(supabase, user.id);

  return <NotificationsScreen userId={user.id} initialNotifications={notifications} />;
}
