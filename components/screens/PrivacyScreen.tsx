"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, Tag, Toggle } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import { createClient } from "@/lib/supabase/client";
import type { ProfileView } from "@/lib/types/profileView";
import styles from "@/styles/features/privacy.module.css";

type Props = {
  userId: string;
  initialIncognito: boolean;
  initialRetentionDays: number | null;
  profileViews: ProfileView[];
};

export function PrivacyScreen({ userId, initialIncognito, initialRetentionDays, profileViews }: Props) {
  const supabase = createClient();
  const { dictionary } = useTranslation();

  const RETENTION_OPTIONS: { value: number | null; label: string }[] = [
    { value: null, label: dictionary.privacyScreen.keepForever },
    { value: 30, label: dictionary.privacyScreen.days30 },
    { value: 60, label: dictionary.privacyScreen.days60 },
    { value: 90, label: dictionary.privacyScreen.days90 },
  ];
  const [incognito, setIncognito] = useState(initialIncognito);
  const [retentionDays, setRetentionDays] = useState(initialRetentionDays);

  const handleToggleIncognito = async (next: boolean) => {
    setIncognito(next);
    try {
      const { error } = await supabase.from("profiles").update({ incognito: next }).eq("id", userId);
      if (error) throw error;
    } catch (err) {
      console.error("Failed to update incognito setting", err);
      setIncognito(!next);
    }
  };

  const handleRetentionChange = async (value: number | null) => {
    setRetentionDays(value);
    try {
      const { error } = await supabase.from("profiles").update({ chat_retention_days: value }).eq("id", userId);
      if (error) throw error;
    } catch (err) {
      console.error("Failed to update chat retention setting", err);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.title}>{dictionary.privacyScreen.title}</h1>
        <p className={styles.sub}>{dictionary.privacyScreen.sub}</p>

        <section className={styles.section}>
          <Card>
            <div className={styles.toggleRow}>
              <div>
                <p className={styles.toggleLabel}>{dictionary.privacyScreen.incognitoLabel}</p>
                <p className={styles.toggleDesc}>{dictionary.privacyScreen.incognitoDesc}</p>
              </div>
              <Toggle checked={incognito} onChange={(next) => void handleToggleIncognito(next)} />
            </div>
          </Card>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{dictionary.privacyScreen.chatRetention}</h2>
          <div className={styles.tagRow}>
            {RETENTION_OPTIONS.map((option) => (
              <Tag
                key={option.label}
                label={option.label}
                selected={retentionDays === option.value}
                onClick={() => void handleRetentionChange(option.value)}
              />
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{dictionary.privacyScreen.whoViewed}</h2>
          {profileViews.length === 0 ? (
            <p className={styles.sub}>{dictionary.privacyScreen.noViews}</p>
          ) : (
            <div className={styles.cardList}>
              {profileViews.map((view) => (
                <Card key={view.id}>
                  <div className={styles.viewRow}>
                    <div>
                      <p className={styles.viewName}>{view.viewerName ?? dictionary.privacyScreen.aWaleefMember}</p>
                      <p className={styles.viewTime}>{new Date(view.createdAt).toLocaleString()}</p>
                    </div>
                    {view.viewerId ? (
                      <Link href={`/dashboard/profile/${view.viewerId}`}>{dictionary.privacyScreen.view}</Link>
                    ) : null}
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
