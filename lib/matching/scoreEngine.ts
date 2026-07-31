// Pure compatibility scoring logic -- no DB access, fully unit-testable.
// Reads from the existing public.questions/public.answers content (real,
// bilingual, already-authored questions), not a placeholder.

export type ScoredQuestion = {
  bucket: string;
  importance: number;
  promptEn: string;
  answerA: string;
  answerB: string;
};

export type CompatibilityResult = {
  overall: number;
  breakdown: Record<string, number>;
  strengths: string[];
  conflicts: string[];
};

const MIN_CONFLICT_IMPORTANCE = 3;
const MAX_HIGHLIGHTS = 3;

export function computeCompatibility(questions: ScoredQuestion[]): CompatibilityResult | null {
  if (questions.length === 0) return null;

  const bucketSums = new Map<string, { sim: number; weight: number }>();
  let totalSim = 0;
  let totalWeight = 0;

  const matched: ScoredQuestion[] = [];
  const mismatched: ScoredQuestion[] = [];

  for (const q of questions) {
    const sim = q.answerA === q.answerB ? 1 : 0;
    const weighted = sim * q.importance;

    totalSim += weighted;
    totalWeight += q.importance;

    const bucket = bucketSums.get(q.bucket) ?? { sim: 0, weight: 0 };
    bucket.sim += weighted;
    bucket.weight += q.importance;
    bucketSums.set(q.bucket, bucket);

    if (sim === 1) matched.push(q);
    else mismatched.push(q);
  }

  if (totalWeight === 0) return null;

  const overall = Math.round((100 * totalSim) / totalWeight);

  const breakdown: Record<string, number> = {};
  for (const [bucket, { sim, weight }] of bucketSums) {
    breakdown[bucket] = weight === 0 ? 0 : Math.round((100 * sim) / weight);
  }

  const strengths = matched
    .sort((a, b) => b.importance - a.importance)
    .slice(0, MAX_HIGHLIGHTS)
    .map((q) => `Aligned on: ${q.promptEn}`);

  const conflicts = mismatched
    .filter((q) => q.importance >= MIN_CONFLICT_IMPORTANCE)
    .sort((a, b) => b.importance - a.importance)
    .slice(0, MAX_HIGHLIGHTS)
    .map((q) => `Different views on: ${q.promptEn}`);

  return { overall, breakdown, strengths, conflicts };
}
