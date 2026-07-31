import type { ShowIf } from "@/lib/types/questionnaire";

export function evaluateShowIf(showIf: ShowIf | null, answersBySlug: Record<string, string | undefined>): boolean {
  if (!showIf) return true;
  const actual = answersBySlug[showIf.depends_on];
  if (actual === undefined) return false;
  return showIf.operator === "equals" ? actual === showIf.value : actual !== showIf.value;
}
