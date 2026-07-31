import type { ReactNode } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { getUnreadNotificationCount } from "@/lib/queries/notifications";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const unreadCount = user ? await getUnreadNotificationCount(supabase, user.id) : 0;

  return (
    <>
      {user ? <DashboardHeader userId={user.id} unreadCount={unreadCount} /> : null}
      {children}
      <DashboardNav />
    </>
  );
}
