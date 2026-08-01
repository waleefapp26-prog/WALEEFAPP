import type { Locale } from "@/lib/i18n/types";

/** Opening message -- just the greeting.
 *
 * This previously shipped a fabricated three-turn exchange that included a
 * fake *user* message ("I matched with someone but I'm not sure how to start
 * the conversation"), so every visitor arrived to a conversation they had
 * never had, attributed to them. */
export function coachGreeting(locale: Locale): { id: number; sender: "ai"; text: string } {
  return {
    id: 1,
    sender: "ai",
    text:
      locale === "ar"
        ? "السلام عليكم! أنا هنا لمساعدتك في رحلتك نحو الزواج — بدء المحادثة، إشراك وليّك، أو ما يجب الانتباه له. ما الذي يشغل بالك؟"
        : "Assalamu alaikum! I'm here to help with your marriage journey -- starting a conversation, involving your wali, or knowing what to watch for. What's on your mind?",
  };
}

/** Prompt chips. `prompt` is what actually gets sent, so the question travels
 *  in the same language the user is reading. */
export function coachSuggestions(locale: Locale): { label: string; prompt: string }[] {
  if (locale === "ar") {
    return [
      { label: "كيف أبدأ المحادثة؟", prompt: "كيف أبدأ المحادثة مع من تطابقت معه؟" },
      { label: "ما الأسئلة التي أطرحها؟", prompt: "ما الأسئلة المهمة التي يجب أن أسألها في البداية؟" },
      { label: "متى أُشرك وليّي؟", prompt: "متى وكيف أشرك وليّي أو عائلتي؟" },
      { label: "علامات تستدعي الانتباه", prompt: "ما العلامات التحذيرية التي يجب الانتباه لها؟" },
      { label: "اللقاء الأول", prompt: "ما الذي يجب أن أعرفه قبل اللقاء الأول؟" },
    ];
  }
  return [
    { label: "How do I start?", prompt: "How should I start a conversation with my match?" },
    { label: "What should I ask?", prompt: "What questions should I ask early on?" },
    { label: "Involving my wali", prompt: "When and how should I involve my wali or family?" },
    { label: "Red flags", prompt: "What red flags should I watch for?" },
    { label: "First meeting", prompt: "What should I know before our first meeting?" },
  ];
}
