"use client";

import { useState } from "react";
import { Button, Card } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import { createClient } from "@/lib/supabase/client";
import styles from "@/styles/features/wali-review.module.css";

export type WaliInviteDetails = {
  status: "pending" | "approved" | "declined";
  waliName: string;
  requesterName: string | null;
  matchOtherName: string | null;
};

type Props = {
  token: string;
  invite: WaliInviteDetails;
};

export function WaliReviewScreen({ token, invite }: Props) {
  const supabase = createClient();
  const { dictionary } = useTranslation();
  const [status, setStatus] = useState(invite.status);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  const respond = async (nextStatus: "approved" | "declined") => {
    setPending(true);
    setError(undefined);
    try {
      const { error: rpcError } = await supabase.rpc("respond_to_wali_invite", {
        p_token: token,
        p_status: nextStatus,
      });
      if (rpcError) {
        setError(rpcError.message);
        return;
      }
      setStatus(nextStatus);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.heading}>{dictionary.waliReview.heading}</h1>
        <Card>
          <div className={styles.body}>
            <p>
              {dictionary.waliReview.assalamu} {invite.waliName},
            </p>
            <p>
              {invite.requesterName ?? "Waleef"} {dictionary.waliReview.requestedInvolvement}
              {invite.matchOtherName ? ` ${invite.matchOtherName}` : ""}.
            </p>
          </div>

          {status === "pending" ? (
            <div className={styles.actions}>
              <Button
                variant="secondary"
                className={styles.actionBtn}
                disabled={pending}
                onClick={() => void respond("declined")}
              >
                {dictionary.waliReview.decline}
              </Button>
              <Button className={styles.actionBtn} disabled={pending} onClick={() => void respond("approved")}>
                {dictionary.waliReview.approve}
              </Button>
            </div>
          ) : (
            <p className={styles.statusText}>
              {status === "approved" ? dictionary.waliReview.approvedMsg : dictionary.waliReview.declinedMsg}
            </p>
          )}

          {error ? <p className={styles.errorText}>{error}</p> : null}
        </Card>
      </div>
    </div>
  );
}
