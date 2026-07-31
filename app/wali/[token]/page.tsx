import { notFound } from "next/navigation";
import { WaliReviewScreen, type WaliInviteDetails } from "@/components/screens/WaliReviewScreen";
import { createClient } from "@/lib/supabase/server";

type WaliInviteRpcRow = {
  id: string;
  status: "pending" | "approved" | "declined";
  wali_name: string;
  requester_name: string | null;
  match_other_name: string | null;
};

export default async function WaliInvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .rpc("get_wali_invite_by_token", { p_token: token })
    .maybeSingle<WaliInviteRpcRow>();

  if (error || !data) notFound();

  const invite: WaliInviteDetails = {
    status: data.status,
    waliName: data.wali_name,
    requesterName: data.requester_name,
    matchOtherName: data.match_other_name,
  };

  return <WaliReviewScreen token={token} invite={invite} />;
}
