// Rule-based "smart coach" -- deliberately not a real LLM call (no external
// API, no billing account needed). Matches keywords in the user's latest
// message to a tailored, pre-written response, falling back to a generic
// thoughtful reply otherwise.

type Topic = {
  keywords: string[];
  reply: string;
};

const TOPICS: Topic[] = [
  {
    keywords: ["start", "conversation", "talk", "message", "chat"],
    reply:
      "Great question! Here are some thoughtful conversation starters:\n\n" +
      "1. Ask about their faith journey and what strengthens their connection with Allah\n" +
      "2. Discuss family values and what family means to them\n" +
      "3. Share your vision for marriage and ask about theirs\n\n" +
      "Keep it respectful and purposeful -- focus on understanding compatibility for marriage, not casual chat.",
  },
  {
    keywords: ["wali", "guardian", "family", "involve"],
    reply:
      "Involving your wali is a sign of seriousness, not a step to delay. A good time to bring them in is once " +
      "you feel real, mutual interest forming -- before things get too far along. Waleef's Family tab lets you " +
      "send your guardian a private, no-signup-required link to review the match and respond.",
  },
  {
    keywords: ["red flag", "warning", "concern", "worried", "trust"],
    reply:
      "A few things worth watching for early on:\n\n" +
      "1. Pressure to move fast or avoid involving family\n" +
      "2. Vagueness about their life, faith practice, or intentions\n" +
      "3. Inconsistent stories or reluctance to video call\n" +
      "4. Disrespect toward your boundaries or your wali\n\n" +
      "Trust your instincts, and don't be afraid to pause or ask direct questions.",
  },
  {
    keywords: ["meet", "meeting", "first date", "see each other"],
    reply:
      "For a first meeting: keep it public, keep a family member or wali informed, and keep the setting simple " +
      "(a cafe, a family gathering) rather than anything private. The goal is to see how you both communicate " +
      "and whether values align, not to create pressure.",
  },
  {
    keywords: ["question", "ask", "what should i ask"],
    reply:
      "Some meaningful questions to ask early on:\n\n" +
      "1. How do you practice your faith day to day?\n" +
      "2. What does a successful marriage look like to you?\n" +
      "3. How do you see family and in-laws fitting into your life?\n" +
      "4. What are your expectations around finances and career?\n\n" +
      "Asking these gently, over a few conversations, tends to work better than a single interview-style chat.",
  },
];

const FALLBACK_REPLIES = [
  "That's a thoughtful question. Focus on shared values, clear communication, and involving your family when it " +
    "feels right -- those matter more in the long run than any single answer I could give you.",
  "Good question to be thinking about. Take your time, keep your wali or a trusted family member in the loop, " +
    "and prioritize honesty over impressing the other person.",
];

const SHARIA_NUDGE =
  "\n\nP.S. Since you've been chatting for a while now, this could be a good moment to request a نظرة شرعية " +
  "(a permissible in-person look) if you haven't already -- it's a meaningful next step many couples take once " +
  "real interest has formed.";

export function generateCoachReply(userMessage: string, userMessageCount = 1): string {
  const lower = userMessage.toLowerCase();
  const match = TOPICS.find((topic) => topic.keywords.some((keyword) => lower.includes(keyword)));
  const reply = match ? match.reply : FALLBACK_REPLIES[Math.floor(Math.random() * FALLBACK_REPLIES.length)];
  return userMessageCount >= 8 ? reply + SHARIA_NUDGE : reply;
}
