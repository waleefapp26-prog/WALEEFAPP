import { BookOpen, Briefcase, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { MatchPercentage } from "@/components/ui/MatchPercentage";
import { MemberAvatar } from "@/components/ui/MemberAvatar";
import type { Profile } from "@/lib/types/profile";
import styles from "@/styles/features/dashboard-deck.module.css";

type Props = {
  profile: Profile;
  matchPercentage: number;
};

export function MatchProfileCard({ profile, matchPercentage }: Props) {
  const displayName = profile.pseudonym || profile.fullName;

  return (
    <Card variant="match" className={styles.matchCard}>
      <div className={styles.matchBadge}>
        <MatchPercentage percentage={matchPercentage} size="sm" />
      </div>

      <div className={styles.photo}>
        <div className={styles.badges}>
          {profile.verified ? <Badge variant="verified" /> : null}
          {profile.premium ? <Badge variant="premium" /> : null}
        </div>
        <MemberAvatar
          userId={profile.id}
          fallback={displayName}
          alt={displayName ?? ""}
          className={styles.photoLetter}
          imgClassName={styles.photoImg}
        />
      </div>

      <div className={styles.body}>
        <div className={styles.nameRow}>
          <h2 className={styles.name}>
            {displayName}, {profile.age}
          </h2>
          <div className={styles.metaRow}>
            <MapPin size={16} className={styles.metaIcon} aria-hidden />
            <span>{profile.location}</span>
          </div>
        </div>

        <p className={styles.bio}>{profile.bio}</p>

        <div className={styles.details}>
          <div className={styles.detailRow}>
            <BookOpen size={18} className={styles.detailIcon} aria-hidden />
            <span>{profile.education}</span>
          </div>
          <div className={styles.detailRow}>
            <Briefcase size={18} className={styles.detailIcon} aria-hidden />
            <span>{profile.occupation}</span>
          </div>
        </div>

        <div className={styles.tags}>
          {profile.interests.map((interest) => (
            <span key={interest} className={styles.tag}>
              {interest}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}
