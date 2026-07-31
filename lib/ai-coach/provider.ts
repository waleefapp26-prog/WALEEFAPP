export type CoachMessage = {
  role: "user" | "assistant";
  content: string;
};

export interface CoachProvider {
  reply(messages: CoachMessage[]): Promise<string>;
}
