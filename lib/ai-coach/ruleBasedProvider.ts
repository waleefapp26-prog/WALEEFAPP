import { generateCoachReply } from "./respond";
import type { CoachMessage, CoachProvider } from "./provider";

export const ruleBasedCoachProvider: CoachProvider = {
  async reply(messages: CoachMessage[]) {
    const last = [...messages].reverse().find((m) => m.role === "user");
    const userMessageCount = messages.filter((m) => m.role === "user").length;
    return generateCoachReply(last?.content ?? "", userMessageCount);
  },
};
