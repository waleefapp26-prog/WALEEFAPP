import { createServiceClient } from "@/lib/supabase/service";
import { computeCompatibility, type ScoredQuestion } from "./scoreEngine";
import { computePlaceholderBreakdown, computePlaceholderScore } from "./placeholderScore";

const HIGH_COMPATIBILITY_THRESHOLD = 85;

type QuestionRow = {
  id: string;
  slug: string;
  match_bucket: string | null;
  importance: number | null;
  question_text_en: string;
};

type AnswerRow = {
  user_id: string;
  question_id: string;
  answer_value: { value?: unknown; text?: unknown } | null;
};

export type Compatibility = {
  overall: number;
  breakdown: { label: string; score: number }[];
  strengths: string[];
  conflicts: string[];
};

const ALGORITHM_VERSION = "v1";

function formatBucketLabel(bucket: string): string {
  return bucket.charAt(0).toUpperCase() + bucket.slice(1);
}

/**
 * Reads both users' real questionnaire answers (public.questions/answers --
 * pre-existing, bilingual, real content) via the service client (server-only;
 * never exposed to the browser, since questionnaire_answers-equivalent RLS is
 * owner-only). Falls back to the deterministic placeholder if neither user
 * has answered anything in common yet. When a matchId is given, caches the
 * result in public.match_scores and reads that cache on subsequent calls.
 */
export async function getCompatibility(
  userIdA: string,
  userIdB: string,
  matchId?: string,
): Promise<Compatibility> {
  const service = createServiceClient();

  if (matchId) {
    const { data: cached } = await service
      .from("match_scores")
      .select("score, breakdown, strengths, conflicts")
      .eq("match_id", matchId)
      .order("computed_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (cached) {
      return {
        overall: Number(cached.score),
        breakdown: Object.entries(cached.breakdown as Record<string, number>).map(([bucket, score]) => ({
          label: formatBucketLabel(bucket),
          score,
        })),
        strengths: (cached.strengths as string[] | null) ?? [],
        conflicts: (cached.conflicts as string[] | null) ?? [],
      };
    }
  }

  const { data: questions } = await service
    .from("questions")
    .select("id, slug, match_bucket, importance, question_text_en")
    .in("section", ["compatibility", "optional"])
    .eq("type", "select");

  const questionRows = (questions as QuestionRow[] | null) ?? [];
  const questionIds = questionRows.map((q) => q.id);

  const { data: answers } = questionIds.length
    ? await service
        .from("answers")
        .select("user_id, question_id, answer_value")
        .in("question_id", questionIds)
        .in("user_id", [userIdA, userIdB])
    : { data: [] as AnswerRow[] };

  const answerRows = (answers as AnswerRow[] | null) ?? [];
  const answersByUser = new Map<string, Map<string, string>>();
  for (const row of answerRows) {
    const value = row.answer_value?.value;
    if (typeof value !== "string") continue; // skip free-text/non-select answers
    if (!answersByUser.has(row.user_id)) answersByUser.set(row.user_id, new Map());
    answersByUser.get(row.user_id)!.set(row.question_id, value);
  }

  const answersA = answersByUser.get(userIdA);
  const answersB = answersByUser.get(userIdB);

  const scored: ScoredQuestion[] = [];
  if (answersA && answersB) {
    for (const question of questionRows) {
      const a = answersA.get(question.id);
      const b = answersB.get(question.id);
      if (a === undefined || b === undefined) continue;
      scored.push({
        bucket: question.match_bucket ?? "general",
        importance: question.importance ?? 1,
        promptEn: question.question_text_en,
        answerA: a,
        answerB: b,
      });
    }
  }

  const result = computeCompatibility(scored);

  if (!result) {
    return {
      overall: computePlaceholderScore(userIdA, userIdB),
      breakdown: computePlaceholderBreakdown(userIdA, userIdB),
      strengths: [],
      conflicts: [],
    };
  }

  if (matchId) {
    await service.from("match_scores").insert({
      match_id: matchId,
      source: "system",
      algorithm_version: ALGORITHM_VERSION,
      score: result.overall,
      breakdown: result.breakdown,
      strengths: result.strengths,
      conflicts: result.conflicts,
      metadata: { compared_questions: scored.length },
    });

    if (result.overall >= HIGH_COMPATIBILITY_THRESHOLD) {
      const { data: profiles } = await service
        .from("profiles")
        .select("id, email")
        .in("id", [userIdA, userIdB]);
      for (const profile of (profiles as { id: string; email: string | null }[] | null) ?? []) {
        await service.from("notifications").insert({
          user_id: profile.id,
          type: "high_compatibility_match",
          title: "A highly compatible match!",
          body: `You scored ${result.overall}% compatibility -- one of your strongest matches yet.`,
          link: `/dashboard/match-result/${matchId}`,
        });
      }
    }
  }

  return {
    overall: result.overall,
    breakdown: Object.entries(result.breakdown).map(([bucket, score]) => ({
      label: formatBucketLabel(bucket),
      score,
    })),
    strengths: result.strengths,
    conflicts: result.conflicts,
  };
}
