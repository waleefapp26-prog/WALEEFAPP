import { ruleBasedCoachProvider } from "./ruleBasedProvider";
import type { CoachProvider } from "./provider";

// The one place a future real-LLM provider gets swapped in -- everything
// else (route auth/gating, UI) is unaffected by that swap.
export const activeCoachProvider: CoachProvider = ruleBasedCoachProvider;

export type { CoachMessage, CoachProvider } from "./provider";
