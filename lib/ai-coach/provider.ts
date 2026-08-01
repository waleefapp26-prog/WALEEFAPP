import type { Locale } from "@/lib/i18n/types";

export type CoachMessage = {
  role: "user" | "assistant";
  content: string;
};

export interface CoachProvider {
  /** `locale` lets a provider answer in the language the user is reading.
   *  Optional so a future real-LLM provider can ignore it. */
  reply(messages: CoachMessage[], locale?: Locale): Promise<string>;
}
