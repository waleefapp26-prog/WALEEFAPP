import { redirect } from "next/navigation";
import { QuestionnaireScreen } from "@/components/screens/QuestionnaireScreen";
import { hasAnyMatch } from "@/lib/queries/matches";
import { getAnswersBySlugForUser, getAnswersForUser, getCompatibilityQuestions } from "@/lib/queries/questionnaire";
import { createClient } from "@/lib/supabase/server";

export default async function QuestionnairePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [questions, answers, matched, profileFacts] = await Promise.all([
    getCompatibilityQuestions(supabase),
    getAnswersForUser(supabase, user.id),
    hasAnyMatch(supabase, user.id),
    getAnswersBySlugForUser(supabase, user.id),
  ]);

  return (
    <QuestionnaireScreen
      userId={user.id}
      questions={questions}
      initialAnswers={answers}
      hasMatch={matched}
      profileFacts={profileFacts}
    />
  );
}
