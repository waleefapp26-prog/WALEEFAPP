import { redirect } from "next/navigation";
import { ProfileCreationScreen } from "@/components/screens/ProfileCreationScreen";
import { getOnboardingQuestions } from "@/lib/queries/questionnaire";
import { createClient } from "@/lib/supabase/server";

export default async function ProfileCreatePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const questions = await getOnboardingQuestions(supabase);

  return <ProfileCreationScreen questions={questions} />;
}
