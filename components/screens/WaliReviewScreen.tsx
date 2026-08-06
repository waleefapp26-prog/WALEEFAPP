"use client";

import { useState } from "react";
import { Button, Card } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import { createClient } from "@/lib/supabase/client";
import type { WaliChatPermission } from "@/lib/types/wali";
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
  /** What the family member has granted this guardian, if anything. */
  permission: WaliChatPermission;
};

const PERMISSION_KEY: Record<Exclude<WaliChatPermission, "none">, "accessRead" | "accessReact" | "accessChat"> = {
  read: "accessRead",
  react: "accessReact",
  chat: "accessChat",
};

export function WaliReviewScreen({ token, invite, permission }: Props) {
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

          {/* After approving, this page used to be a dead end: a guardian had
              no way to learn whether the family member had granted them chat
              access, and no link to it. The only route in was the separate
              email-code dashboard at /wali, which nothing pointed them to. */}
          {status === "approved" ? (
            <div className={styles.accessBox}>
              <p className={styles.accessLabel}>{dictionary.waliReview.accessTitle}</p>
              {permission === "none" ? (
                <p className={styles.accessNone}>{dictionary.waliReview.accessNone}</p>
              ) : (
                <>
                  <p className={styles.accessLevel}>{dictionary.waliReview[PERMISSION_KEY[permission]]}</p>
                  <Button href={`/wali/${token}/chat`} variant="outline">
                    {dictionary.waliReview.openChat}
                  </Button>
                </>
              )}
            </div>
          ) : null}

          {error ? <p className={styles.errorText}>{error}</p> : null}
        </Card>
      </div>
    </div>
  );
}
