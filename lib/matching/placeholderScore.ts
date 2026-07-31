// TODO(phase 2+): replace with a real compatibility engine (prayer frequency,
// hijab preference, interests overlap, etc). For now this is a deterministic
// stand-in so the same pair of users always sees the same "match percentage."
export function computePlaceholderScore(idA: string, idB: string): number {
  const combined = [idA, idB].sort().join("-");
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    hash = (hash * 31 + combined.charCodeAt(i)) >>> 0;
  }
  return 65 + (hash % 34); // plausible 65-98 range
}

const BREAKDOWN_CATEGORIES = ["Religious Values", "Lifestyle", "Family Goals", "Personality"] as const;

export function computePlaceholderBreakdown(idA: string, idB: string) {
  return BREAKDOWN_CATEGORIES.map((label) => ({
    label,
    score: computePlaceholderScore(`${idA}:${label}`, `${idB}:${label}`),
  }));
}
