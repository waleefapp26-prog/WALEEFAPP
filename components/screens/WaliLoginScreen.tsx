"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, Card, TextField } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import { createClient } from "@/lib/supabase/client";
import styles from "@/styles/features/wali-review.module.css";

type WaliInviteRow = {
  id: string;
  status: "pending" | "approved" | "declined";
  wali_name: string;
  requester_name: string | null;
  match_other_name: string | null;
  chat_involved: boolean;
  created_at: string;
  token: string;
};

export function WaliLoginScreen() {
  const supabase = createClient();
  const { dictionary } = useTranslation();
  const [stage, setStage] = useState<"email" | "code" | "results">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [invites, setInvites] = useState<WaliInviteRow[]>([]);

  const requestCode = async () => {
    setPending(true);
    setError(undefined);
    try {
      await fetch("/api/wali/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStage("code");
    } catch {
      setError(dictionary.auth.genericError);
    } finally {
      setPending(false);
    }
  };

  const verifyCode = async () => {
    setPending(true);
    setError(undefined);
    try {
      const { data, error: rpcError } = await supabase.rpc("get_wali_invites_for_email", {
        p_email: email.trim().toLowerCase(),
        p_code: code.trim(),
      });
      if (rpcError) {
        setError(dictionary.waliLogin.invalidCode);
        return;
      }
      setInvites((data as WaliInviteRow[] | null) ?? []);
      setStage("results");
    } catch {
      setError(dictionary.auth.genericError);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.heading}>{dictionary.waliLogin.heading}</h1>
        <Card>
          {stage === "email" ? (
            <div className={styles.body}>
              <p>{dictionary.waliLogin.emailPrompt}</p>
              <TextField
                label={dictionary.waliLogin.emailLabel}
                type="email"
                value={email}
                onValueChange={setEmail}
                placeholder="wali@example.com"
              />
              <div className={styles.actions}>
                <Button className={styles.actionBtn} disabled={pending || !email.trim()} onClick={() => void requestCode()}>
                  {pending ? dictionary.waliLogin.sending : dictionary.waliLogin.sendCode}
                </Button>
              </div>
            </div>
          ) : null}

          {stage === "code" ? (
            <div className={styles.body}>
              <p>
                {dictionary.waliLogin.codePrompt} {email}.
              </p>
              <TextField
                label={dictionary.waliLogin.codeLabel}
                value={code}
                onValueChange={setCode}
                placeholder="123456"
                maxLength={6}
              />
              <div className={styles.actions}>
                <Button
                  className={styles.actionBtn}
                  disabled={pending || code.trim().length < 6}
                  onClick={() => void verifyCode()}
                >
                  {pending ? dictionary.waliLogin.checking : dictionary.waliLogin.viewRequests}
                </Button>
              </div>
            </div>
          ) : null}

          {stage === "results" ? (
            <div className={styles.list}>
              {invites.length === 0 ? (
                <p className={styles.body}>{dictionary.waliLogin.noRequests}</p>
              ) : (
                invites.map((invite) => (
                  <div key={invite.id} className={styles.listItem}>
                    <p>
                      {invite.requester_name ?? "Waleef"}
                      {invite.match_other_name ? ` & ${invite.match_other_name}` : ""}
                    </p>
                    <div className={styles.listMeta}>
                      <span className={styles.statusPill}>{invite.status}</span>
                      <Link href={`/wali/${invite.token}`}>{dictionary.waliLogin.review}</Link>
                      {invite.chat_involved ? (
                        <Link href={`/wali/${invite.token}/chat`}>{dictionary.waliLogin.viewChat}</Link>
                      ) : null}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : null}

          {error ? <p className={styles.errorText}>{error}</p> : null}
        </Card>
      </div>
    </div>
  );
}
