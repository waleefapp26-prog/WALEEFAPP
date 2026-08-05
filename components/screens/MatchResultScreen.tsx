"use client";

import { Heart, MessageCircle, Sparkles, User, Users } from "lucide-react";
import { Button, Card, MatchPercentage } from "@/components/ui";
import { MATCH_CONSIDERATIONS, MATCH_STRONG_POINTS } from "@/lib/content/match-result";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import styles from "@/styles/features/match-result.module.css";

type Props = {
  matchId: string;
  otherProfileId: string;
  name: string;
  percentage: number | null;
  conversationId: string | null;
  strengths?: string[];
  conflicts?: string[];
};

export function MatchResultScreen({
  matchId,
  otherProfileId,
  name,
  percentage,
  conversationId,
  strengths,
  conflicts,
}: Props) {
  const { dictionary } = useTranslation();
  const hasRealStrengths = strengths && strengths.length > 0;
  const hasRealConflicts = conflicts && conflicts.length > 0;

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <div className={styles.heroWrap}>
            <div className={styles.sparkleWrap}>
              <MatchPercentage percentage={percentage} size="lg" />
              <Sparkles className={styles.sparkle} size={32} aria-hidden />
            </div>
          </div>
          <h1 className={styles.title}>{dictionary.matchResult.title}</h1>
          <p className={styles.sub}>{dictionary.matchResult.sub.replace("{name}", name)}</p>
        </div>

        <Card className={styles.cardSpaced}>
          <div className={styles.rowHead}>
            <Heart className={styles.heartIcon} size={24} aria-hidden />
            <h3 className={styles.sectionTitle}>{dictionary.matchResult.strongPoints}</h3>
          </div>
          {hasRealStrengths
            ? strengths.map((text) => (
                <div key={text} className={`${styles.point} ${styles.pointStrong}`}>
                  <p className={styles.pointDesc}>{text}</p>
                </div>
              ))
            : MATCH_STRONG_POINTS.map((point) => (
                <div key={point.label} className={`${styles.point} ${styles.pointStrong}`}>
                  <p className={styles.pointTitle}>{point.label}</p>
                  <p className={styles.pointDesc}>{point.description}</p>
                </div>
              ))}
        </Card>

        <Card className={styles.cardSpaced}>
          <h3 className={styles.sectionTitleSpaced}>{dictionary.matchResult.pointsToDiscuss}</h3>
          {hasRealConflicts
            ? conflicts.map((text) => (
                <div key={text} className={`${styles.point} ${styles.pointSoft}`}>
                  <p className={styles.pointDesc}>{text}</p>
                </div>
              ))
            : MATCH_CONSIDERATIONS.map((point) => (
                <div key={point.label} className={`${styles.point} ${styles.pointSoft}`}>
                  <p className={styles.pointTitle}>{point.label}</p>
                  <p className={styles.pointDesc}>{point.description}</p>
                </div>
              ))}
        </Card>

        <Button
          href={`/dashboard/profile/${otherProfileId}`}
          variant="outline"
          wide
          className={styles.viewProfileBtn}
        >
          <User size={20} aria-hidden />
          {dictionary.matchResult.viewProfile}
        </Button>

        <div className={styles.actions}>
          <Button href={`/dashboard/proposal/${matchId}`} variant="secondary" className={styles.actionBtn}>
            <Users size={20} aria-hidden />
            {dictionary.matchResult.involveFamily}
          </Button>
          <Button href={conversationId ? `/dashboard/chats/${conversationId}` : "/dashboard/chats"} className={styles.actionBtn}>
            <MessageCircle size={20} aria-hidden />
            {dictionary.matchResult.startConversation}
          </Button>
        </div>

        <p className={styles.footnote}>{dictionary.matchResult.footnote}</p>
      </div>
    </div>
  );
}
