"use client";

import { CheckCircle, Clock, Eye, XCircle } from "lucide-react";
import { Card } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import type { WaliInvite } from "@/lib/types/wali";
import styles from "@/styles/features/family-panel.module.css";

type Props = {
  invites: WaliInvite[];
};

export function FamilyPanelScreen({ invites }: Props) {
  const { dictionary } = useTranslation();
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
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
