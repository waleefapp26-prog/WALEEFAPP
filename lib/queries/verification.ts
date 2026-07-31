import type { SupabaseClient } from "@supabase/supabase-js";
import type { DocumentType, VerificationRequest, VerificationStatus } from "@/lib/types/verification";

type Row = {
  id: string;
  user_id: string;
  document_type: DocumentType;
  document_storage_path: string;
  status: VerificationStatus;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  admin_notes: string | null;
};

function mapRow(row: Row): VerificationRequest {
  return {
    id: row.id,
    userId: row.user_id,
    documentType: row.document_type,
    documentStoragePath: row.document_storage_path,
    status: row.status,
    submittedAt: row.submitted_at,
    reviewedAt: row.reviewed_at,
    reviewedBy: row.reviewed_by,
    adminNotes: row.admin_notes,
  };
}

export async function getLatestVerificationRequest(
  supabase: SupabaseClient,
  userId: string,
): Promise<VerificationRequest | null> {
  const { data, error } = await supabase
    .from("verification_requests")
    .select("*")
    .eq("user_id", userId)
    .order("submitted_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? mapRow(data as Row) : null;
}

export async function getLatestVerificationRequestByTier(
  supabase: SupabaseClient,
  userId: string,
  tier: "id" | "selfie",
): Promise<VerificationRequest | null> {
  let query = supabase.from("verification_requests").select("*").eq("user_id", userId);
  query = tier === "selfie" ? query.eq("document_type", "selfie") : query.neq("document_type", "selfie");
  const { data, error } = await query.order("submitted_at", { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  return data ? mapRow(data as Row) : null;
}

export async function getPendingVerificationRequests(supabase: SupabaseClient): Promise<VerificationRequest[]> {
  const { data, error } = await supabase
    .from("verification_requests")
    .select("*")
    .eq("status", "pending")
    .order("submitted_at", { ascending: true });
  if (error) throw error;
  return ((data as Row[] | null) ?? []).map(mapRow);
}

export async function createVerificationRequest(
  supabase: SupabaseClient,
  userId: string,
  documentType: DocumentType,
  documentStoragePath: string,
): Promise<void> {
  const { error } = await supabase.from("verification_requests").insert({
    user_id: userId,
    document_type: documentType,
    document_storage_path: documentStoragePath,
  });
  if (error) throw error;
}
