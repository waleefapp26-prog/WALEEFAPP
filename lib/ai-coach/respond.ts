// Rule-based "smart coach" -- deliberately not a real LLM call (no external
// API, no billing account needed). Matches keywords in the user's latest
// message to a tailored, pre-written response, falling back to a generic
// thoughtful reply otherwise.
//
// Keywords and replies exist in both languages: previously only English was
// matched, so an Arabic question never hit a topic and always received the
// generic fallback -- in English.

import type { Locale } from "@/lib/i18n/types";

type Topic = {
  keywords: string[];
  keywordsAr: string[];
  reply: string;
  replyAr: string;
};

const TOPICS: Topic[] = [
  {
    keywords: ["start", "conversation", "talk", "message", "chat"],
    keywordsAr: ["أبدأ", "ابدأ", "محادثة", "أتحدث", "رسالة", "كلام"],
    reply:
      "Great question! Here are some thoughtful conversation starters:\n\n" +
      "1. Ask about their faith journey and what strengthens their connection with Allah\n" +
      "2. Discuss family values and what family means to them\n" +
      "3. Share your vision for marriage and ask about theirs\n\n" +
      "Keep it respectful and purposeful -- focus on understanding compatibility for marriage, not casual chat.",
    replyAr:
      "سؤال مهم! إليك بعض المداخل الجيدة للمحادثة:\n\n" +
      "١. اسأل عن رحلته الإيمانية وما يقوّي صلته بالله\n" +
      "٢. تحدثا عن قيم الأسرة وما تعنيه العائلة لكل منكما\n" +
      "٣. شارك تصورك عن الزواج واسأل عن تصوره\n\n" +
      "حافظ على الاحترام ووضوح الهدف — التركيز على فهم التوافق للزواج، لا الحديث العابر.",
  },
  {
    keywords: ["wali", "guardian", "family", "involve"],
    keywordsAr: ["ولي", "وليّ", "وليي", "العائلة", "أهلي", "إشراك", "أشرك"],
    reply:
      "Involving your wali is a sign of seriousness, not a step to delay. A good time to bring them in is once " +
      "you feel real, mutual interest forming -- before things get too far along. Waleef's Family tab lets you " +
      "send your guardian a private, no-signup-required link to review the match and respond.",
    replyAr:
      "إشراك وليّك علامة على الجدية، وليس خطوة تؤجَّل. الوقت المناسب هو عندما تشعر بوجود اهتمام متبادل حقيقي — " +
      "قبل أن تتقدم الأمور كثيراً. يتيح لك تبويب العائلة في وليف إرسال رابط خاص لوليّك لمراجعة التطابق والرد، " +
      "دون حاجة لإنشاء حساب.",
  },
  {
    keywords: ["red flag", "warning", "concern", "worried", "trust"],
    keywordsAr: ["علامات", "تحذير", "قلق", "أخشى", "ثقة", "مؤشرات"],
    reply:
      "A few things worth watching for early on:\n\n" +
      "1. Pressure to move fast or avoid involving family\n" +
      "2. Vagueness about their life, faith practice, or intentions\n" +
      "3. Inconsistent stories or reluctance to video call\n" +
      "4. Disrespect toward your boundaries or your wali\n\n" +
      "Trust your instincts, and don't be afraid to pause or ask direct questions.",
    replyAr:
      "بعض ما يستحق الانتباه في البداية:\n\n" +
      "١. الضغط للتسرّع أو تجنّب إشراك العائلة\n" +
      "٢. الغموض بشأن حياته أو التزامه الديني أو نيّته\n" +
      "٣. تناقض في الروايات أو التهرب من مكالمة مرئية\n" +
      "٤. عدم احترام حدودك أو وليّك\n\n" +
      "ثق بحدسك، ولا تتردد في التوقف أو طرح أسئلة مباشرة.",
  },
  {
    keywords: ["meet", "meeting", "first date", "see each other"],
    keywordsAr: ["لقاء", "نلتقي", "مقابلة", "أقابل"],
    reply:
      "For a first meeting: keep it public, keep a family member or wali informed, and keep the setting simple " +
      "(a cafe, a family gathering) rather than anything private. The goal is to see how you both communicate " +
      "and whether values align, not to create pressure.",
    replyAr:
      "بخصوص اللقاء الأول: اجعله في مكان عام، وأبقِ أحد أفراد العائلة أو وليّك على علم، واختر مكاناً بسيطاً " +
      "(مقهى، أو تجمّع عائلي) بدلاً من أي مكان خاص. الهدف أن تريا كيف تتواصلان وهل تتوافق القيم، لا خلق ضغط.",
  },
  {
    keywords: ["question", "ask", "what should i ask"],
    keywordsAr: ["أسئلة", "أسأل", "اسأل", "الأسئلة"],
    reply:
      "Some meaningful questions to ask early on:\n\n" +
      "1. How do you practice your faith day to day?\n" +
      "2. What does a successful marriage look like to you?\n" +
      "3. How do you see family and in-laws fitting into your life?\n" +
      "4. What are your expectations around finances and career?\n\n" +
      "Asking these gently, over a few conversations, tends to work better than a single interview-style chat.",
    replyAr:
      "بعض الأسئلة المهمة في البداية:\n\n" +
      "١. كيف تمارس التزامك الديني في يومك؟\n" +
      "٢. كيف يبدو الزواج الناجح بالنسبة لك؟\n" +
      "٣. كيف ترى مكان العائلة والأصهار في حياتك؟\n" +
      "٤. ما توقعاتك بشأن المال والعمل؟\n\n" +
      "طرحها بلطف على مدى عدة محادثات أفضل من جعلها تبدو كمقابلة واحدة.",
  },
];

const FALLBACK_REPLIES = [
  "That's a thoughtful question. Focus on shared values, clear communication, and involving your family when it " +
    "feels right -- those matter more in the long run than any single answer I could give you.",
  "Good question to be thinking about. Take your time, keep your wali or a trusted family member in the loop, " +
    "and prioritize honesty over impressing the other person.",
];

const FALLBACK_REPLIES_AR = [
  "سؤال يستحق التفكير. ركّز على القيم المشتركة، والتواصل الواضح، وإشراك عائلتك عندما يكون الوقت مناسباً — " +
    "هذه أهم على المدى الطويل من أي إجابة واحدة أستطيع تقديمها.",
  "سؤال جيد أن تفكر فيه. خذ وقتك، وأبقِ وليّك أو أحد أفراد عائلتك الموثوقين على اطلاع، " +
    "وقدّم الصدق على محاولة إبهار الطرف الآخر.",
];

const SHARIA_NUDGE_EN =
  "\n\nP.S. Since you've been chatting for a while now, this could be a good moment to request a نظرة شرعية " +
  "(a permissible in-person look) if you haven't already -- it's a meaningful next step many couples take once " +
  "real interest has formed.";

const SHARIA_NUDGE_AR =
  "\n\nملاحظة: بما أنكما تتحادثان منذ فترة، قد تكون هذه لحظة مناسبة لطلب نظرة شرعية إن لم تفعل بعد — " +
  "خطوة تالية ذات معنى يتخذها كثيرون بعد أن يتكوّن اهتمام حقيقي.";

export function generateCoachReply(userMessage: string, userMessageCount = 1, locale: Locale = "en"): string {
  const lower = userMessage.toLowerCase();
  const isAr = locale === "ar";

  const match = TOPICS.find((topic) =>
    (isAr ? topic.keywordsAr : topic.keywords).some((keyword) => lower.includes(keyword.toLowerCase())),
  );

  let reply: string;
  if (match) {
    reply = isAr ? match.replyAr : match.reply;
  } else {
    const pool = isAr ? FALLBACK_REPLIES_AR : FALLBACK_REPLIES;
    reply = pool[Math.floor(Math.random() * pool.length)];
  }

  if (userMessageCount >= 8) reply += isAr ? SHARIA_NUDGE_AR : SHARIA_NUDGE_EN;
  return reply;
}
