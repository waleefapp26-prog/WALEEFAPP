import { createServiceClient } from "@/lib/supabase/service";
import { computeCompatibility, type ScoredQuestion } from "./scoreEngine";

type QuestionRow = {
  id: string;
  match_bucket: string | null;
  importance: number | null;
  question_text_en: string;
};

type AnswerRow = {
  user_id: string;
  question_id: string;
  answer_value: { value?: unknown } | null;
};

/** Real compatibility scores for a whole candidate deck, in two queries.
 *
 *  `null` for a candidate means the pair has no overlapping answers yet, so
 *  there is genuinely nothing to score. Callers must show that as unknown --
 *  the deck used to paper over it with computePlaceholderScore(), a hash of
 *  the two user ids scaled into a plausible-looking 65-98%, which meant the
 *  headline number on the main browsing screen was invented every time.
 *
 *  Uses the service client because answers are owner-only under RLS; this runs
 *  server-side only and returns nothing but aggregate scores. */
export async function getDeckCompatibilityScores(
  userId: string,
  candidateIds: string[],
): Promise<Map<string, number | null>> {
  const scores = new Map<string, number | null>();
  for (const id of candidateIds) scores.set(id, null);
  if (candidateIds.length === 0) return scores;

  const service = createServiceClient();

  const { data: questions } = await service
    .from("questions")
    .select("id, match_bucket, importance, question_text_en")
    .in("section", ["compatibility", "optional"])
    .eq("type", "select");

  const questionRows = (questions as QuestionRow[] | null) ?? [];
  if (questionRows.length === 0) return scores;

  const questionById = new Map(questionRows.map((q) => [q.id, q]));

  const { data: answers } = await service
    .from("answers")
    .select("user_id, question_id, answer_value")
    .in("question_id", Array.from(questionById.keys()))
    .in("user_id", [userId, ...candidateIds]);

  const byUser = new Map<string, Map<string, string>>();
  for (const row of ((answers as AnswerRow[] | null) ?? [])) {
    const value = row.answer_value?.value;
    if (typeof value !== "string") continue; // free-text answers aren't comparable
    if (!byUser.has(row.user_id)) byUser.set(row.user_id, new Map());
    byUser.get(row.user_id)!.set(row.question_id, value);
  }

  const mine = byUser.get(userId);
  if (!mine || mine.size === 0) return scores;

  for (const candidateId of candidateIds) {
    const theirs = byUser.get(candidateId);
    if (!theirs) continue;

    const scored: ScoredQuestion[] = [];
    for (const [questionId, myAnswer] of mine) {
      const theirAnswer = theirs.get(questionId);
      if (theirAnswer === undefined) continue;
      const question = questionById.get(questionId)!;
      scored.push({
        bucket: question.match_bucket ?? "general",
        importance: question.importance ?? 1,
        promptEn: question.question_text_en,
        answerA: myAnswer,
        answerB: theirAnswer,
      });
    }

    scores.set(candidateId, computeCompatibility(scored)?.overall ?? null);
  }

  return scores;
}
