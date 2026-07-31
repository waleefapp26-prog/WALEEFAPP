"use client";

import { useState, useTransition } from "react";
import { Button, Card, Textarea } from "@/components/ui";
import { respondToVerification } from "@/app/admin/verifications/actions";
import type { VerificationRequest } from "@/lib/types/verification";
import styles from "@/styles/features/admin.module.css";

type Props = {
  requests: VerificationRequest[];
};

export function AdminVerificationsScreen({ requests: initialRequests }: Props) {
  const [requests, setRequests] = useState(initialRequests);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  const handleRespond = (id: string, status: "approved" | "rejected" | "changes_requested") => {
    startTransition(async () => {
      try {
        await respondToVerification(id, status, notes[id] ?? "");
        setRequests((prev) => prev.filter((r) => r.id !== id));
      } catch (err) {
        console.error("Failed to respond to verification request", err);
      }
    });
  };

  const handleViewDocument = async (requestId: string) => {
    try {
      const res = await fetch(`/api/admin/verification-requests/${requestId}/document`);
      const data = await res.json();
      if (data.url) window.open(data.url, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error("Failed to load document", err);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.title}>Verification Queue</h1>
        <p className={styles.sub}>{requests.length} pending</p>

        {requests.length === 0 ? (
          <p className={styles.sub}>No pending requests.</p>
        ) : (
          <div className={styles.cardList}>
            {requests.map((request) => (
              <Card key={request.id}>
                <p className={styles.rowName}>{request.documentType.replace(/_/g, " ")}</p>
                <p className={styles.rowMeta}>Submitted {new Date(request.submittedAt).toLocaleString()}</p>
                <div style={{ margin: "0.75rem 0" }}>
                  <Button size="md" variant="outline" onClick={() => void handleViewDocument(request.id)}>
                    View Document
                  </Button>
                </div>
                <Textarea
                  placeholder="Notes (optional)"
                  value={notes[request.id] ?? ""}
                  onChange={(e) => setNotes((prev) => ({ ...prev, [request.id]: e.target.value }))}
                />
                <div className={styles.rowActions} style={{ marginTop: "0.75rem" }}>
                  <Button
                    size="md"
                    variant="secondary"
                    disabled={pending}
                    onClick={() => handleRespond(request.id, "rejected")}
                  >
                    Reject
                  </Button>
                  <Button
                    size="md"
                    variant="outline"
                    disabled={pending}
                    onClick={() => handleRespond(request.id, "changes_requested")}
                  >
                    Request Changes
                  </Button>
                  <Button size="md" disabled={pending} onClick={() => handleRespond(request.id, "approved")}>
                    Approve
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
