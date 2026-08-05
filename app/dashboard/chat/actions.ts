"use server";

import { createClient } from "@/lib/supabase/server";

export type SetMatchStatusResult = { success: true } | { success: false; error: string };

export async function setMatchStatus(matchId: string, status: "active" | "frozen"): Promise<SetMatchStatusResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("set_match_status", { p_match_id: matchId, p_status: status });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function submitMatchRating(
  matchId: string,
  rating: number,
  feedback: string,
): Promise<SetMatchStatusResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Your session expired. Please log in again." };

  const { error } = await supabase
    .from("match_ratings")
    .upsert(
      { match_id: matchId, rated_by: user.id, rating, feedback: feedback.trim() || null },
      { onConflict: "match_id,rated_by" },
    );
  if (error) return { success: false, error: error.message };
  return { success: true };
}
