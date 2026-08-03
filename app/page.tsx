import { LandingPage } from "@/components/landing/LandingPage";
import { getPublishedSuccessStories } from "@/lib/queries/successStories";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const successStories = await getPublishedSuccessStories(supabase);

  return <LandingPage successStories={successStories} />;
}
