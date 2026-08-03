import type { SupabaseClient } from "@supabase/supabase-js";
import type { AnswerMap, CompatibilityQuestion, OnboardingQuestion, QuestionOption, ShowIf } from "@/lib/types/questionnaire";

type QuestionRow = {
  id: string;
  slug: string;
  match_bucket: string | null;
  section: "compatibility" | "optional";
  question_text_en: string;
  question_text_ar: string | null;
  options: QuestionOption[] | null;
  order_index: number;
  show_if: ShowIf | null;
};

function mapQuestionRow(row: QuestionRow): CompatibilityQuestion {
  return {
    id: row.id,
    slug: row.slug,
    bucket: row.match_bucket ?? "general",
    section: row.section,
    promptEn: row.question_text_en,
    promptAr: row.question_text_ar,
    options: row.options ?? [],
    orderIndex: row.order_index,
    showIf: row.show_if,
  };
}

export async function getCompatibilityQuestions(supabase: SupabaseClient): Promise<CompatibilityQuestion[]> {
  const { data, error } = await supabase
    .from("questions")
    .select("id, slug, match_bucket, section, question_text_en, question_text_ar, options, order_index, show_if")
    .in("section", ["compatibility", "optional"])
    .eq("type", "select")
    .order("order_index", { ascending: true });
  if (error) throw error;
  return ((data as QuestionRow[] | null) ?? []).map(mapQuestionRow);
}

/** How far through the post-match compatibility bank a member is.
 *
 *  These 44 questions unlock on a first mutual match, but nothing announced
 *  that -- the only entry point was a "Compatibility quiz" chip that looked
 *  identical before and after matching, so members had no way to know there
 *  was anything new to answer. */
export async function getCompatibilityProgress(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ total: number; answered: number }> {
  const [{ count: total }, { count: answered }] = await Promise.all([
    supabase.from("questions").select("id", { count: "exact", head: true }).eq("section", "compatibility"),
    supabase
      .from("answers")
      .select("question_id, questions!inner(section)", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("questions.section", "compatibility"),
  ]);
  return { total: total ?? 0, answered: answered ?? 0 };
}

type OnboardingRow = {
  id: string;
  slug: string;
  step_key: string;
  type: "date" | "select" | "text" | "number";
  required: boolean;
  question_text_en: string;
  question_text_ar: string | null;
  options: QuestionOption[] | null;
  order_index: number;
  show_if: ShowIf | null;
};

export async function getOnboardingQuestions(supabase: SupabaseClient): Promise<OnboardingQuestion[]> {
  const { data, error } = await supabase
    .from("questions")
    .select("id, slug, step_key, type, required, question_text_en, question_text_ar, options, order_index, show_if")
    .eq("section", "onboarding")
    .order("order_index", { ascending: true });
  if (error) throw error;
  return ((data as OnboardingRow[] | null) ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    stepKey: row.step_key,
    type: row.type,
    required: row.required,
    promptEn: row.question_text_en,
    promptAr: row.question_text_ar,
    options: row.options ?? [],
    orderIndex: row.order_index,
    showIf: row.show_if,
  }));
}

export async function getAnswersForUser(supabase: SupabaseClient, userId: string): Promise<AnswerMap> {
  const { data, error } = await supabase.from("answers").select("question_id, answer_value").eq("user_id", userId);
  if (error) throw error;
  const map: AnswerMap = {};
  for (const row of (data as { question_id: string; answer_value: { value?: unknown } | null }[] | null) ?? []) {
    const value = row.answer_value?.value;
    if (typeof value === "string") map[row.question_id] = value;
  }
  return map;
}

/** Maps slug -> answer value, needed to evaluate `show_if` conditions against a user's own answers. */
export async function getAnswersBySlugForUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<Record<string, string>> {
  const { data, error } = await supabase
    .from("answers")
    .select("answer_value, questions!inner(slug)")
    .eq("user_id", userId);
  if (error) throw error;
  const map: Record<string, string> = {};
  for (const row of (data as { answer_value: { value?: unknown } | null; questions: { slug: string }[] }[] | null) ??
    []) {
    const value = row.answer_value?.value;
    const slug = row.questions[0]?.slug;
    if (typeof value === "string" && slug) map[slug] = value;
  }
  return map;
}

export async function upsertAnswer(
  supabase: SupabaseClient,
  userId: string,
  questionId: string,
  value: string,
): Promise<void> {
  const { error } = await supabase
    .from("answers")
    .upsert(
      { user_id: userId, question_id: questionId, answer_value: { value }, updated_at: new Date().toISOString() },
      { onConflict: "user_id,question_id" },
    );
  if (error) throw error;
}
