"use client";

import { Lock, ShieldCheck, Users } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import styles from "@/styles/features/landing.module.css";
import { LandingSection } from "./LandingSection";

export function LandingTrust() {
  const { dictionary } = useTranslation();
  const items = [
    { icon: ShieldCheck, ...dictionary.trust.verification },
    { icon: Lock, ...dictionary.trust.privacy },
    { icon: Users, ...dictionary.trust.wali },
  ];

  return (
    <LandingSection id="trust" tone="white">
      <SectionHeading title={dictionary.trust.title} lead={dictionary.trust.subtitle} />
      <div className={styles.trustGrid}>
        {items.map((item) => (
          <Reveal key={item.title}>
            <Card className={styles.trustCard}>
              <div className={styles.trustIconWrap}>
                <item.icon className={styles.trustIcon} size={28} aria-hidden />
              </div>
              <h3 className={styles.trustTitle}>{item.title}</h3>
              <p className={styles.trustText}>{item.description}</p>
            </Card>
          </Reveal>
        ))}
      </div>
    </LandingSection>
  );
}
