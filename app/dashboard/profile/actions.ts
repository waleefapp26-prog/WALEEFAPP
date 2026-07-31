"use server";

import { createClient } from "@/lib/supabase/server";

export type RequestOptionalQuestionsResult = { success: true } | { success: false; error: string };

export async function requestOptionalQuestions(targetUserId: string): Promise<RequestOptionalQuestionsResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Your session expired. Please log in again." };

  const { count } = await supabase
    .from("matches")
    .select("id", { count: "exact", head: true })
    .or(`and(user_a.eq.${user.id},user_b.eq.${targetUserId}),and(user_a.eq.${targetUserId},user_b.eq.${user.id})`);

  if (!count) {
    return { success: false, error: "You can only request this from a mutual match." };
  }

  const { data: me } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();

  const { error } = await supabase.from("notifications").insert({
    user_id: targetUserId,
    type: "optional_questions_requested",
    title: "Someone would like to know more about you",
    body: `${me?.full_name ?? "Your match"} asked if you'd answer a few optional compatibility questions.`,
    link: "/dashboard/questionnaire",
  });

  if (error) return { success: false, error: error.message };
  return { success: true };
}
