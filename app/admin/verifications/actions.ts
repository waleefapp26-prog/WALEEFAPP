"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function respondToVerification(
  requestId: string,
  status: "approved" | "rejected" | "changes_requested",
  notes: string,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("respond_to_verification_request", {
    p_request_id: requestId,
    p_status: status,
    p_notes: notes || null,
  });
  if (error) throw error;
  revalidatePath("/admin/verifications");
}
