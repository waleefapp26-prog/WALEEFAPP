import { redirect } from "next/navigation";
import { AICoachScreen } from "@/components/screens/AICoachScreen";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardCoachPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // The API rejects free-tier users with a 403. Reading the tier here lets the
  // screen say so up front, instead of presenting a full chat UI that only
  // reveals it is locked after you have typed a question and pressed send.
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier")
    .eq("id", user.id)
    .maybeSingle();

  return <AICoachScreen isPremium={Boolean(profile && profile.subscription_tier !== "free")} />;
}
