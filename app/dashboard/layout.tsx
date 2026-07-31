import type { ReactNode } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { getUnreadNotificationCount } from "@/lib/queries/notifications";
import { createClient } from "@/lib/supabase/server";
import shellStyles from "@/styles/layout/dashboard-shell.module.css";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const unreadCount = user ? await getUnreadNotificationCount(supabase, user.id) : 0;

  return (
    // Flex column owning the viewport height: the header takes what it needs
    // and `content` gets the rest, so full-height screens land in the space
    // that's genuinely available instead of running under the header and nav.
    <div className={shellStyles.shell}>
      {user ? (
        <div className={shellStyles.header}>
          <DashboardHeader userId={user.id} unreadCount={unreadCount} />
        </div>
      ) : null}
      <div className={shellStyles.content}>{children}</div>
      <DashboardNav />
    </div>
  );
}
