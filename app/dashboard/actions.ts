"use server";

import type { DashboardNavItem } from "@/lib/config/dashboard";
import { typesForNavKey } from "@/lib/notifications/navRouting";
import { createClient } from "@/lib/supabase/server";

/** Mark a section's notifications read because the member just opened it.
 *
 *  Without this the badges only ever counted up: opening Chats did nothing to
 *  the "3" sitting next to it, so every number was permanent. */
export async function markNavSectionRead(navKey: DashboardNavItem["labelKey"]): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const types = typesForNavKey(navKey);
  if (types.length === 0) return;

  // notifications_update_own scopes this to the caller's own rows.
  await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", user.id)
    .eq("read", false)
    .in("type", types);
}
