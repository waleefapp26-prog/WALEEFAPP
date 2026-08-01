import { generateCoachReply } from "./respond";
import type { CoachMessage, CoachProvider } from "./provider";
import type { Locale } from "@/lib/i18n/types";

export const ruleBasedCoachProvider: CoachProvider = {
  async reply(messages: CoachMessage[], locale: Locale = "en") {
    const last = [...messages].reverse().find((m) => m.role === "user");
    const userMessageCount = messages.filter((m) => m.role === "user").length;
    return generateCoachReply(last?.content ?? "", userMessageCount, locale);
  },
};
