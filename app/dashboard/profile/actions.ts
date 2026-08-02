"use server";

import { createClient } from "@/lib/supabase/server";

export type RequestOptionalQuestionsResult = { success: true } | { success: false; error: string };

/** Ask a mutual match to answer the optional compatibility questions.
 *
 *  This used to insert into public.notifications directly from the caller's
 *  session, which RLS always denied -- notifications has no INSERT policy,
 *  every other write reaches it through a security-definer trigger. It also
 *  never recorded the access grant, so even a "successful" request would have
 *  unlocked nothing. Both now happen inside request_optional_questions(). */
export async function requestOptionalQuestions(targetUserId: string): Promise<RequestOptionalQuestionsResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Your session expired. Please log in again." };

  const { error } = await supabase.rpc("request_optional_questions", { p_owner_id: targetUserId });

  if (error) {
    if (error.message.includes("not matched")) {
      return { success: false, error: "You can only request this from a mutual match." };
    }
    return { success: false, error: error.message };
  }
  return { success: true };
}

export type RespondToQuestionsRequestResult = { success: true } | { success: false; error: string };

/** The owner's answer to such a request. */
export async function respondToQuestionsRequest(
  requestId: string,
  status: "approved" | "declined",
): Promise<RespondToQuestionsRequestResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("respond_to_optional_questions_request", {
    p_request_id: requestId,
    p_status: status,
  });
  if (error) return { success: false, error: error.message };
  return { success: true };
}
