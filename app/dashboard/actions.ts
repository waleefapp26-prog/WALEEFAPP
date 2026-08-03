"use server";

import type { DashboardNavItem } from "@/lib/config/dashboard";
import { getDeckCompatibilityScores } from "@/lib/matching/deckScores";
import { typesForNavKey } from "@/lib/notifications/navRouting";
import { createClient } from "@/lib/supabase/server";

/** Real compatibility scores for a freshly filtered candidate list.
 *
 *  Scoring needs both parties' answers, which are owner-only under RLS, so it
 *  has to happen server-side -- hence an action rather than a client query. */
export async function fetchDeckScores(candidateIds: string[]): Promise<Record<string, number | null>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return {};

  const scores = await getDeckCompatibilityScores(user.id, candidateIds);
  return Object.fromEntries(scores);
}

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
