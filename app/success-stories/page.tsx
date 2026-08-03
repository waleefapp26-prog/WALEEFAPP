import { SuccessStoriesScreen } from "@/components/screens/SuccessStoriesScreen";
import { getPublishedSuccessStories } from "@/lib/queries/successStories";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Success Stories | Waleef",
};

export default async function SuccessStoriesPage() {
  const supabase = await createClient();
  const stories = await getPublishedSuccessStories(supabase);

  return <SuccessStoriesScreen stories={stories} />;
}
