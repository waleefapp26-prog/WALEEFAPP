"use client";

import { useEffect } from "react";
import { markNavSectionRead } from "@/app/dashboard/actions";
import type { DashboardNavItem } from "@/lib/config/dashboard";
import { useClearNavUnread } from "./NotificationCountProvider";

/** Drop into a dashboard page to clear that destination's badge on arrival.
 *
 *  Renders nothing -- it exists so a server page can trigger the client-side
 *  badge reset and the database write together. */
export function MarkSectionRead({ navKey }: { navKey: DashboardNavItem["labelKey"] }) {
  const clearNavUnread = useClearNavUnread();

  useEffect(() => {
    clearNavUnread(navKey);
    void markNavSectionRead(navKey);
  }, [navKey, clearNavUnread]);

  return null;
}
