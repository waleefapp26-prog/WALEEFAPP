"use client";

import { useId, useState } from "react";
import { BookOpen, Briefcase, MapPin, MessageCircle, Users } from "lucide-react";
import { requestOptionalQuestions } from "@/app/dashboard/profile/actions";
import { Badge, Button, Card, MemberAvatar } from "@/components/ui";
import { MatchPercentage } from "@/components/ui/MatchPercentage";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import type { Profile } from "@/lib/types/profile";
import styles from "@/styles/features/profile-view.module.css";

function MiniScoreBar({ score }: { score: number }) {
  const uid = useId().replace(/:/g, "");
  const gradId = `pf-bar-${uid}`;
  return (
    <svg viewBox="0 0 100 2" preserveAspectRatio="none" className={styles.barSvg} aria-hidden>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
          <stop stopColor="#ff6b9d" />
          <stop offset="1" stopColor="#ff8a5c" />
        </linearGradient>
      </defs>
      <rect width="100" height="2" rx="1" fill="#e5e7eb" />
      <rect width={score} height="2" rx="1" fill={`url(#${gradId})`} />
    </svg>
  );
}

type Props = {
  profile: Profile;
  matchPercentage: number | null;
  compatibility: { label: string; score: number }[];
};

export function ProfileViewScreen({ profile, matchPercentage, compatibility }: Props) {
  const { dictionary } = useTranslation();
  const [requestState, setRequestState] = useState<"idle" | "pending" | "sent" | "error">("idle");
  const [requestError, setRequestError] = useState<string>();

  const handleRequestOptional = async () => {
    setRequestState("pending");
    const result = await requestOptionalQuestions(profile.id);
    if (result.success) {
      setRequestState("sent");
    } else {
      setRequestState("error");
      setRequestError(result.error);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroBadges}>
          {profile.verified ? <Badge variant="verified" /> : null}
          {profile.premium ? <Badge variant="premium" /> : null}
        </div>
        <div className={styles.heroMatch}>
          <MatchPercentage percentage={matchPercentage} size="sm" />
        </div>
        <MemberAvatar
          userId={profile.id}
          fallback={profile.pseudonym || profile.fullName}
          alt={profile.pseudonym || profile.fullName || ""}
          className={styles.heroLetter}
          imgClassName={styles.heroImg}
        />
      </div>

      <div className={styles.content}>
        <Card variant="profile" className={styles.cardSpaced}>
          <h1 className={styles.title}>
            {profile.fullName}, {profile.age}
          </h1>
          <div className={styles.meta}>
            <MapPin size={18} aria-hidden />
            <span>{profile.location}</span>
          </div>
          {profile.bio ? <p className={styles.bio}>{profile.bio}</p> : null}
          <div className={styles.interestRow}>
            {profile.interests.map((interest) => (
              <span key={interest} className={styles.interest}>
                {interest}
              </span>
            ))}
          </div>
        </Card>

        <Card className={styles.cardSpaced}>
          <h3 className={styles.sectionTitle}>{dictionary.profileView.professionalBackground}</h3>
          <div className={styles.row}>
            <BookOpen size={24} className={styles.iconPink} aria-hidden />
            <div>
              <p className="font-medium">{dictionary.profileView.education}</p>
              <p className={styles.meta}>{profile.education}</p>
            </div>
          </div>
          <div className={styles.row}>
            <Briefcase size={24} className={styles.iconPink} aria-hidden />
            <div>
              <p className="font-medium">{dictionary.profileView.occupation}</p>
              <p className={styles.meta}>{profile.occupation}</p>
            </div>
          </div>
        </Card>

        {profile.prayerFrequency.length > 0 || profile.hijabPreference ? (
          <Card className={styles.cardSpaced}>
            <h3 className={styles.sectionTitle}>{dictionary.profileView.faithValues}</h3>
            <div className={styles.grid2}>
              {profile.prayerFrequency.length > 0 ? (
                <div className={styles.cell}>
                  <p className={styles.cellLabel}>{dictionary.profileView.prayer}</p>
                  <p className={styles.cellValue}>{profile.prayerFrequency.join(", ")}</p>
                </div>
              ) : null}
              {profile.hijabPreference ? (
                <div className={styles.cell}>
                  <p className={styles.cellLabel}>{dictionary.profileView.hijab}</p>
                  <p className={styles.cellValue}>{profile.hijabPreference}</p>
                </div>
              ) : null}
            </div>
          </Card>
        ) : null}

        {profile.lookingFor ? (
          <Card className={styles.cardSpaced}>
            <h3 className={styles.sectionTitle}>{dictionary.profileView.lookingForTitle}</h3>
            <p className={styles.meta}>{profile.lookingFor}</p>
          </Card>
        ) : null}

        <Card className={styles.cardSpaced}>
          <h3 className={styles.sectionTitle}>{dictionary.profileView.compatibilityBreakdown}</h3>
          <div>
            {compatibility.map((item) => (
              <div key={item.label} className={styles.scoreRow}>
                <div className={styles.scoreHead}>
                  <span className={styles.scoreLabel}>{item.label}</span>
                  <span className={styles.scorePct}>{item.score}%</span>
                </div>
                <MiniScoreBar score={item.score} />
              </div>
            ))}
          </div>
          <Button
            variant="secondary"
            disabled={requestState === "pending" || requestState === "sent"}
            onClick={() => void handleRequestOptional()}
          >
            {requestState === "sent" ? dictionary.profileView.requestSent : dictionary.profileView.requestOptional}
          </Button>
          {requestState === "error" ? <p className={styles.meta}>{requestError}</p> : null}
        </Card>
      </div>

      <div className={styles.bottomBar}>
        <div className={styles.bottomInner}>
          <Button href="/dashboard/family" variant="secondary" className={styles.bottomBtn}>
            <Users size={20} aria-hidden />
            {dictionary.profileView.involveFamily}
          </Button>
          <Button href="/dashboard/chats" className={styles.bottomBtn}>
            <MessageCircle size={20} aria-hidden />
            {dictionary.profileView.expressInterest}
          </Button>
        </div>
      </div>
    </div>
  );
}
