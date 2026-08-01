"use client";

import { BadgeCheck, Camera, Crown, MapPin, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button, Card, Textarea, TextField } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types/profile";
import styles from "@/styles/features/my-profile.module.css";

type Props = {
  profile: Profile;
};

export function MyProfileScreen({ profile }: Props) {
  const supabase = createClient();
  const { dictionary } = useTranslation();

  const [pseudonym, setPseudonym] = useState(profile.pseudonym ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [lookingFor, setLookingFor] = useState(profile.lookingFor ?? "");
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string>();

  const save = async () => {
    setState("saving");
    setError(undefined);
    try {
      const { error: err } = await supabase
        .from("profiles")
        .update({
          pseudonym: pseudonym.trim() || null,
          bio: bio.trim() || null,
          looking_for: lookingFor.trim() || null,
        })
        .eq("id", profile.id);
      if (err) {
        setState("error");
        setError(err.message);
        return;
      }
      setState("saved");
    } catch {
      setState("error");
      setError(dictionary.auth.genericError);
    }
  };

  const displayName = profile.pseudonym || profile.fullName || "";

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.hero}>
          <div className={styles.heroGlow} aria-hidden />
          <div className={styles.avatar}>
            {profile.avatarUrl ? (
              <Image src={profile.avatarUrl} alt="" width={88} height={88} className={styles.avatarImg} />
            ) : (
              <span aria-hidden>{displayName[0]?.toUpperCase() ?? "?"}</span>
            )}
          </div>
          <div className={styles.heroText}>
            <h1 className={styles.name}>
              {displayName}
              {profile.age ? <span className={styles.age}>, {profile.age}</span> : null}
            </h1>
            {profile.location ? (
              <p className={styles.meta}>
                <MapPin size={15} aria-hidden /> {profile.location}
              </p>
            ) : null}
            <p className={styles.sub}>{dictionary.myProfile.subtitle}</p>
          </div>
        </header>

        {/* Status at a glance -- these were previously only discoverable by
            visiting each settings screen separately. */}
        <div className={styles.badges}>
          <span className={profile.verified ? styles.badgeOn : styles.badgeOff}>
            <ShieldCheck size={15} aria-hidden />
            {profile.verified ? dictionary.myProfile.idVerified : dictionary.myProfile.notVerified}
          </span>
          <span className={profile.photoVerified ? styles.badgeOn : styles.badgeOff}>
            <BadgeCheck size={15} aria-hidden />
            {profile.photoVerified ? dictionary.myProfile.photoVerified : dictionary.myProfile.notVerified}
          </span>
          <span className={styles.badgePlan}>
            <Crown size={15} aria-hidden />
            {dictionary.myProfile.plan}: {profile.subscriptionTier}
          </span>
        </div>

        <Card className={styles.card}>
          <h2 className={styles.cardTitle}>{dictionary.myProfile.editBasics}</h2>

          <TextField
            label={dictionary.myProfile.displayName}
            value={pseudonym}
            onValueChange={(v) => {
              setPseudonym(v);
              setState("idle");
            }}
            placeholder={profile.fullName ?? ""}
          />

          <div className={styles.field}>
            <span className={styles.fieldLabel}>{dictionary.myProfile.bio}</span>
            <Textarea
              value={bio}
              onChange={(e) => {
                setBio(e.target.value);
                setState("idle");
              }}
              placeholder={dictionary.myProfile.bioPlaceholder}
            />
          </div>

          <div className={styles.field}>
            <span className={styles.fieldLabel}>{dictionary.myProfile.lookingFor}</span>
            <Textarea
              value={lookingFor}
              onChange={(e) => {
                setLookingFor(e.target.value);
                setState("idle");
              }}
              placeholder={dictionary.myProfile.bioPlaceholder}
            />
          </div>

          <div className={styles.saveRow}>
            <Button onClick={() => void save()} disabled={state === "saving"}>
              {state === "saving" ? dictionary.myProfile.saving : dictionary.myProfile.save}
            </Button>
            {state === "saved" ? <span className={styles.savedNote}>{dictionary.myProfile.saved}</span> : null}
            {state === "error" ? <span className={styles.errorNote}>{error}</span> : null}
          </div>
        </Card>

        {profile.interests.length > 0 ? (
          <Card className={styles.card}>
            <h2 className={styles.cardTitle}>{dictionary.profileCreationScreen.interestsHobbies}</h2>
            <div className={styles.chips}>
              {profile.interests.map((i) => (
                <span key={i} className={styles.chip}>
                  {i}
                </span>
              ))}
            </div>
          </Card>
        ) : null}

        <div className={styles.links}>
          <Button href="/dashboard/photos" variant="outline">
            <Camera size={16} aria-hidden />
            {dictionary.quickActions.photos}
          </Button>
          <Button href="/dashboard/verification" variant="outline">
            <ShieldCheck size={16} aria-hidden />
            {dictionary.quickActions.verify}
          </Button>
          <Button href="/dashboard/premium" variant="outline">
            <Crown size={16} aria-hidden />
            {dictionary.myProfile.manage}
          </Button>
        </div>
      </div>
    </div>
  );
}
