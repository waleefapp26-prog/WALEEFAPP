import { redirect } from "next/navigation";
import { VerificationScreen } from "@/components/screens/VerificationScreen";
import { getLatestVerificationRequestByTier } from "@/lib/queries/verification";
import { createClient } from "@/lib/supabase/server";

export default async function VerificationPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [idRequest, selfieRequest] = await Promise.all([
    getLatestVerificationRequestByTier(supabase, user.id, "id"),
    getLatestVerificationRequestByTier(supabase, user.id, "selfie"),
  ]);

  return <VerificationScreen userId={user.id} initialIdRequest={idRequest} initialSelfieRequest={selfieRequest} />;
}
