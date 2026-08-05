"use client";

import { useState } from "react";
import { CheckCircle, Clock, Eye, UserPlus, XCircle } from "lucide-react";
import { setWaliChatPermission } from "@/app/dashboard/family/actions";
import { Button, Card } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import type { MatchWithPartner } from "@/lib/queries/matches";
import type { WaliChatPermission, WaliInvite } from "@/lib/types/wali";
import styles from "@/styles/features/family-panel.module.css";

type Props = {
  invites: WaliInvite[];
  /** Guardians are invited per match, so this drives the invite entry point. */
  matches: MatchWithPartner[];
};

const PERMISSION_LEVELS: WaliChatPermission[] = ["none", "read", "react", "chat"];

export function FamilyPanelScreen({ invites: initialInvites, matches }: Props) {
  const { dictionary } = useTranslation();
  const [invites, setInvites] = useState(initialInvites);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);

  const permissionLabel: Record<WaliChatPermission, string> = {
    none: dictionary.family.permissionNone,
    read: dictionary.family.permissionRead,
    react: dictionary.family.permissionReact,
    chat: dictionary.family.permissionChat,
  };

  const handlePermissionChange = async (inviteId: string, permission: WaliChatPermission) => {
    setSavingId(inviteId);
    setErrorId(null);
    setSavedId(null);
    const result = await setWaliChatPermission(inviteId, permission);
    setSavingId(null);
    if (result.success) {
      setInvites((prev) => prev.map((i) => (i.id === inviteId ? { ...i, chatPermission: result.permission } : i)));
      setSavedId(inviteId);
      setTimeout(() => setSavedId((current) => (current === inviteId ? null : current)), 2000);
    } else {
      setErrorId(inviteId);
    }
  };

  const pending = invites.filter((i) => i.status === "pending").length;
  const approved = invites.filter((i) => i.status === "approved").length;

  const RELATION_LABELS: Record<string, string> = {
    father: dictionary.family.relationFather,
    brother: dictionary.family.relationBrother,
    uncle: dictionary.family.relationUncle,
    grandfather: dictionary.family.relationGrandfather,
    other: dictionary.family.relationOther,
  };

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.title}>{dictionary.family.title}</h1>
        <p className={styles.sub}>{dictionary.family.sub}</p>

        <div className={styles.stats}>
          <Card variant="info">
            <div className={styles.statRow}>
              <div>
                <p className={styles.statLabel}>{dictionary.family.pending}</p>
                <p className={`${styles.statValue} ${styles.statOrange}`}>{pending}</p>
              </div>
              <Clock className={styles.statOrange} size={32} aria-hidden />
            </div>
          </Card>
          <Card variant="info">
            <div className={styles.statRow}>
              <div>
                <p className={styles.statLabel}>{dictionary.family.approved}</p>
                <p className={`${styles.statValue} ${styles.statGreen}`}>{approved}</p>
              </div>
              <CheckCircle className={styles.statGreen} size={32} aria-hidden />
            </div>
          </Card>
          <Card variant="info">
            <div className={styles.statRow}>
              <div>
                <p className={styles.statLabel}>{dictionary.family.totalRequests}</p>
                <p className={`${styles.statValue} ${styles.statMuted}`}>{invites.length}</p>
              </div>
              <Eye className={styles.statMuted} size={32} aria-hidden />
            </div>
          </Card>
        </div>

        {/* The only route into the proposal flow used to be the match-result
            screen, shown once when a match is created. Members who navigated
            away had no way back, and this panel -- the obvious place to look --
            was read-only. */}
        <section className={styles.inviteSection}>
          <h2 className={styles.sectionTitle}>{dictionary.family.inviteTitle}</h2>
          {matches.length === 0 ? (
            <p className={styles.sub}>{dictionary.family.inviteNeedsMatch}</p>
          ) : (
            <>
              <p className={styles.sub}>{dictionary.family.inviteHelp}</p>
              <div className={styles.inviteList}>
                {matches.map((match) => (
                  <Button
                    key={match.matchId}
                    href={`/dashboard/proposal/${match.matchId}`}
                    variant="outline"
                    className={styles.inviteBtn}
                  >
                    <UserPlus size={18} aria-hidden />
                    {dictionary.family.inviteFor.replace(
                      "{name}",
                      match.partnerName ?? dictionary.chatList.yourMatch,
                    )}
                  </Button>
                ))}
              </div>
            </>
          )}
        </section>

        <section>
          <h2 className={styles.sectionTitle}>{dictionary.family.yourRequests}</h2>
          {invites.length === 0 ? (
            <p className={styles.sub}>{dictionary.family.noGuardianYet}</p>
          ) : (
            <div className={styles.cardList}>
              {invites.map((invite) => (
                <Card key={invite.id}>
                  <div className={styles.historyCard}>
                    <div className={styles.historyLeft}>
                      <div className={styles.avatarSm}>{invite.waliName[0]}</div>
                      <div>
                        <p style={{ margin: 0, fontWeight: 500 }}>{invite.waliName}</p>
                        <p className={styles.meta}>{RELATION_LABELS[invite.waliRelation] ?? invite.waliRelation}</p>
                        <p className={styles.metaSmall}>
                          {dictionary.family.requestedOn} {new Date(invite.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className={styles.historyRight}>
                      {invite.status === "approved" ? (
                        <span className={`${styles.pill} ${styles.pillOk}`}>
                          <CheckCircle size={16} aria-hidden />
                          {dictionary.family.approvedStatus}
                        </span>
                      ) : invite.status === "declined" ? (
                        <span className={`${styles.pill} ${styles.pillNo}`}>
                          <XCircle size={16} aria-hidden />
                          {dictionary.family.declinedStatus}
                        </span>
                      ) : (
                        <span className={`${styles.pill} ${styles.pillPending}`}>
                          <Clock size={16} aria-hidden />
                          {dictionary.family.pendingStatus}
                        </span>
                      )}
                    </div>
                  </div>

                  {invite.status === "approved" ? (
                    <div className={styles.permissionRow}>
                      <div className={styles.permissionLabelWrap}>
                        <label className={styles.permissionLabel} htmlFor={`permission-${invite.id}`}>
                          {dictionary.family.chatAccessLabel}
                        </label>
                        <p className={styles.permissionHelp}>{dictionary.family.permissionHelp}</p>
                      </div>
                      <div className={styles.permissionControl}>
                        <select
                          id={`permission-${invite.id}`}
                          className={styles.permissionSelect}
                          value={invite.chatPermission}
                          disabled={savingId === invite.id}
                          onChange={(e) => void handlePermissionChange(invite.id, e.target.value as WaliChatPermission)}
                        >
                          {PERMISSION_LEVELS.map((level) => (
                            <option key={level} value={level}>
                              {permissionLabel[level]}
                            </option>
                          ))}
                        </select>
                        {savedId === invite.id ? (
                          <span className={styles.permissionSaved}>{dictionary.family.permissionSaved}</span>
                        ) : null}
                        {errorId === invite.id ? (
                          <span className={styles.permissionError}>{dictionary.auth.genericError}</span>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
