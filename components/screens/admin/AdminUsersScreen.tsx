import { Badge, Card } from "@/components/ui";
import type { Profile } from "@/lib/types/profile";
import styles from "@/styles/features/admin.module.css";

type Props = {
  profiles: Profile[];
};

export function AdminUsersScreen({ profiles }: Props) {
  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.title}>Users</h1>
        <p className={styles.sub}>{profiles.length} total</p>

        <div className={styles.cardList}>
          {profiles.map((profile) => (
            <Card key={profile.id}>
              <div className={styles.row}>
                <div className={styles.rowMain}>
                  <p className={styles.rowName}>{profile.fullName ?? "Unnamed"}</p>
                  <p className={styles.rowMeta}>
                    {profile.age ? `${profile.age} · ` : ""}
                    {profile.location ?? "No location"} · Joined {new Date(profile.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className={styles.rowActions}>
                  {profile.verified ? <Badge variant="verified" /> : null}
                  {profile.subscriptionTier !== "free" ? <Badge variant="premium" /> : null}
                  {profile.isAdmin ? <span className={`${styles.pill} ${styles.pillMuted}`}>Admin</span> : null}
                  <span
                    className={`${styles.pill} ${profile.onboardingComplete ? styles.pillOk : styles.pillPending}`}
                  >
                    {profile.onboardingComplete ? "Onboarded" : "Incomplete"}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
