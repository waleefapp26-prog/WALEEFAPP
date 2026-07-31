import { describe, expect, it } from "vitest";
import { computeCompatibility, type ScoredQuestion } from "./scoreEngine";

function q(overrides: Partial<ScoredQuestion>): ScoredQuestion {
  return {
    bucket: "religion",
    importance: 3,
    promptEn: "Test question",
    answerA: "a",
    answerB: "a",
    ...overrides,
  };
}

describe("computeCompatibility", () => {
  it("returns null for an empty question list", () => {
    expect(computeCompatibility([])).toBeNull();
  });

  it("scores 100 when every answer matches", () => {
    const result = computeCompatibility([
      q({ answerA: "x", answerB: "x", importance: 2 }),
      q({ answerA: "y", answerB: "y", importance: 5 }),
    ]);
    expect(result?.overall).toBe(100);
    expect(result?.conflicts).toHaveLength(0);
  });

  it("scores 0 when every answer mismatches", () => {
    const result = computeCompatibility([
      q({ answerA: "x", answerB: "y", importance: 2 }),
      q({ answerA: "a", answerB: "b", importance: 5 }),
    ]);
    expect(result?.overall).toBe(0);
    expect(result?.strengths).toHaveLength(0);
  });

  it("weights importance correctly in a mixed case", () => {
    // one match worth 1, one mismatch worth 3 -> 1/4 = 25%
    const result = computeCompatibility([
      q({ answerA: "x", answerB: "x", importance: 1 }),
      q({ answerA: "a", answerB: "b", importance: 3 }),
    ]);
    expect(result?.overall).toBe(25);
  });

  it("groups scores per bucket in the breakdown", () => {
    const result = computeCompatibility([
      q({ bucket: "religion", answerA: "x", answerB: "x", importance: 4 }),
      q({ bucket: "finance", answerA: "a", answerB: "b", importance: 4 }),
    ]);
    expect(result?.breakdown.religion).toBe(100);
    expect(result?.breakdown.finance).toBe(0);
  });

  it("only surfaces conflicts at or above the minimum importance threshold", () => {
    const result = computeCompatibility([
      q({ answerA: "a", answerB: "b", importance: 1, promptEn: "Low importance mismatch" }),
      q({ answerA: "c", answerB: "d", importance: 5, promptEn: "High importance mismatch" }),
    ]);
    expect(result?.conflicts).toEqual(["Different views on: High importance mismatch"]);
  });

  it("caps strengths and conflicts at 3 entries, sorted by importance", () => {
    const questions = [1, 2, 3, 4, 5].map((importance) =>
      q({ answerA: "same", answerB: "same", importance, promptEn: `Q${importance}` }),
    );
    const result = computeCompatibility(questions);
    expect(result?.strengths).toEqual(["Aligned on: Q5", "Aligned on: Q4", "Aligned on: Q3"]);
  });
});
