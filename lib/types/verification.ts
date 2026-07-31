export type DocumentType = "national_id" | "passport" | "driver_license" | "selfie";
export type VerificationStatus = "pending" | "approved" | "rejected" | "changes_requested";

export type VerificationRequest = {
  id: string;
  userId: string;
  documentType: DocumentType;
  documentStoragePath: string;
  status: VerificationStatus;
  submittedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  adminNotes: string | null;
};
