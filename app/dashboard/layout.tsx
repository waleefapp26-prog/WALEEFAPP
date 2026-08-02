import type { ReactNode } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { NotificationCountProvider } from "@/components/dashboard/NotificationCountProvider";
import { getUnreadCountsByNavKey } from "@/lib/queries/notifications";
import { createClient } from "@/lib/supabase/server";
import shellStyles from "@/styles/layout/dashboard-shell.module.css";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const initialCounts = user ? await getUnreadCountsByNavKey(supabase, user.id) : {};

  // Flex column owning the viewport height: the header takes what it needs and
  // `content` gets the rest, so full-height screens land in the space that's
  // genuinely available instead of running under the header and nav.
  const shell = (
    <div className={shellStyles.shell}>
      {user ? (
        <div className={shellStyles.header}>
          <DashboardHeader />
        </div>
      ) : null}
      <div className={shellStyles.content}>{children}</div>
      <DashboardNav signedIn={Boolean(user)} />
    </div>
  );

  // The provider owns the single Realtime subscription every badge reads from,
  // so it has to wrap the nav and the header together.
  return (
    <NotificationCountProvider userId={user?.id ?? ""} initialCounts={initialCounts}>
      {shell}
    </NotificationCountProvider>
  );
}
