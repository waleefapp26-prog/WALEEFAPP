export const AI_COACH_SUGGESTIONS = [
  "How should I start a conversation?",
  "What questions should I ask?",
  "When to involve my wali?",
  "Red flags to watch for",
] as const;

export const AI_COACH_INITIAL_MESSAGES = [
  {
    id: 1,
    sender: "ai" as const,
    text: "Assalamu alaikum! I'm here to help guide you through your marriage journey. What questions do you have today?",
  },
  {
    id: 2,
    sender: "user" as const,
    text: "I matched with someone but I'm not sure how to start the conversation.",
  },
  {
    id: 3,
    sender: "ai" as const,
    text: "Great question! Here are some thoughtful conversation starters:\n\n1. Ask about their faith journey and what strengthens their connection with Allah\n2. Discuss family values and what family means to them\n3. Share your vision for marriage and ask about theirs\n\nRemember to keep it respectful and purposeful. Focus on understanding compatibility for marriage, not casual chat.",
  },
] as const;
