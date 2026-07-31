"use client";

import { useRef, useState } from "react";
import { CheckCircle, Clock, Upload, XCircle } from "lucide-react";
import { Button, Card, Tag } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import { createClient } from "@/lib/supabase/client";
import { createVerificationRequest } from "@/lib/queries/verification";
import type { DocumentType, VerificationRequest } from "@/lib/types/verification";
import type { Dictionary } from "@/lib/i18n/types";
import styles from "@/styles/features/verification.module.css";

type Props = {
  userId: string;
  initialIdRequest: VerificationRequest | null;
  initialSelfieRequest: VerificationRequest | null;
};

function StatusPill({ status, dictionary }: { status: VerificationRequest["status"]; dictionary: Dictionary }) {
  if (status === "approved") {
    return (
      <span className={`${styles.pill} ${styles.pillOk}`}>
        <CheckCircle size={16} aria-hidden /> {dictionary.verificationScreen.approved}
      </span>
    );
  }
  if (status === "rejected" || status === "changes_requested") {
    return (
      <span className={`${styles.pill} ${styles.pillNo}`}>
        <XCircle size={16} aria-hidden />{" "}
        {status === "rejected" ? dictionary.verificationScreen.rejected : dictionary.verificationScreen.changesRequested}
      </span>
    );
  }
  return (
    <span className={`${styles.pill} ${styles.pillPending}`}>
      <Clock size={16} aria-hidden /> {dictionary.verificationScreen.underReview}
    </span>
  );
}

export function VerificationScreen({ userId, initialIdRequest, initialSelfieRequest }: Props) {
  const supabase = createClient();
  const { dictionary } = useTranslation();
  const ID_DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
    { value: "national_id", label: dictionary.verificationScreen.nationalId },
    { value: "passport", label: dictionary.verificationScreen.passport },
    { value: "driver_license", label: dictionary.verificationScreen.driverLicense },
  ];
  const idFileInputRef = useRef<HTMLInputElement>(null);
  const selfieFileInputRef = useRef<HTMLInputElement>(null);
  const [idRequest, setIdRequest] = useState(initialIdRequest);
  const [selfieRequest, setSelfieRequest] = useState(initialSelfieRequest);
  const [idDocumentType, setIdDocumentType] = useState<DocumentType>("national_id");
  const [submittingTier, setSubmittingTier] = useState<"id" | "selfie" | null>(null);
  const [error, setError] = useState<string>();

  const canSubmitId = !idRequest || idRequest.status === "rejected" || idRequest.status === "changes_requested";
  const canSubmitSelfie =
    !selfieRequest || selfieRequest.status === "rejected" || selfieRequest.status === "changes_requested";

  const upload = async (file: File, documentType: DocumentType, tier: "id" | "selfie") => {
    setSubmittingTier(tier);
    setError(undefined);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${userId}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("verification-documents").upload(path, file);
      if (uploadError) throw uploadError;

      await createVerificationRequest(supabase, userId, documentType, path);
      const nextRequest: VerificationRequest = {
        id: "pending-local",
        userId,
        documentType,
        documentStoragePath: path,
        status: "pending",
        submittedAt: new Date().toISOString(),
        reviewedAt: null,
        reviewedBy: null,
        adminNotes: null,
      };
      if (tier === "selfie") setSelfieRequest(nextRequest);
      else setIdRequest(nextRequest);
    } catch (err) {
      console.error("Failed to submit verification request", err);
      setError(dictionary.auth.genericError);
    } finally {
      setSubmittingTier(null);
      if (idFileInputRef.current) idFileInputRef.current.value = "";
      if (selfieFileInputRef.current) selfieFileInputRef.current.value = "";
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.title}>{dictionary.verificationScreen.title}</h1>
        <p className={styles.sub}>{dictionary.verificationScreen.sub}</p>

        <Card className={styles.statusCard}>
          <div className={styles.statusRow}>
            <span>{dictionary.verificationScreen.idTier}</span>
            {idRequest ? (
              <StatusPill status={idRequest.status} dictionary={dictionary} />
            ) : (
              <span className={styles.pill}>{dictionary.verificationScreen.notSubmitted}</span>
            )}
          </div>
          {idRequest?.adminNotes ? (
            <p className={styles.notes}>
              {dictionary.verificationScreen.noteFromTeam} {idRequest.adminNotes}
            </p>
          ) : null}

          {canSubmitId ? (
            <>
              <span className={styles.fieldLabel}>{dictionary.verificationScreen.documentType}</span>
              <div className={styles.tagRow}>
                {ID_DOCUMENT_TYPES.map((option) => (
                  <Tag
                    key={option.value}
                    label={option.label}
                    selected={idDocumentType === option.value}
                    onClick={() => setIdDocumentType(option.value)}
                  />
                ))}
              </div>
              <div className={styles.uploadWrap}>
                <input
                  ref={idFileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void upload(file, idDocumentType, "id");
                  }}
                />
                <Button onClick={() => idFileInputRef.current?.click()} disabled={submittingTier !== null}>
                  <Upload size={16} aria-hidden />{" "}
                  {submittingTier === "id" ? dictionary.verificationScreen.submitting : dictionary.verificationScreen.uploadDocument}
                </Button>
              </div>
            </>
          ) : null}
        </Card>

        <Card className={styles.statusCard}>
          <div className={styles.statusRow}>
            <span>{dictionary.verificationScreen.photoTier}</span>
            {selfieRequest ? (
              <StatusPill status={selfieRequest.status} dictionary={dictionary} />
            ) : (
              <span className={styles.pill}>{dictionary.verificationScreen.notSubmitted}</span>
            )}
          </div>
          {selfieRequest?.adminNotes ? (
            <p className={styles.notes}>
              {dictionary.verificationScreen.noteFromTeam} {selfieRequest.adminNotes}
            </p>
          ) : null}

          {canSubmitSelfie ? (
            <div className={styles.uploadWrap}>
              <input
                ref={selfieFileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void upload(file, "selfie", "selfie");
                }}
              />
              <Button onClick={() => selfieFileInputRef.current?.click()} disabled={submittingTier !== null}>
                <Upload size={16} aria-hidden />{" "}
                {submittingTier === "selfie" ? dictionary.verificationScreen.submitting : dictionary.verificationScreen.uploadSelfie}
              </Button>
            </div>
          ) : null}
        </Card>

        {error ? <p style={{ color: "#d9364a", marginTop: "0.75rem" }}>{error}</p> : null}
      </div>
    </div>
  );
}
