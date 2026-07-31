"use client";

import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import { LANDING_FEATURES } from "@/lib/config/landing";
import styles from "@/styles/features/landing.module.css";
import { LandingSection } from "./LandingSection";

export function LandingFeatureGrid() {
  const { dictionary, locale } = useTranslation();

  return (
    <LandingSection id="features" tone="white">
      <SectionHeading title={dictionary.features.title} lead={dictionary.features.subtitle} />
      <div className={styles.featureGrid}>
        {LANDING_FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <Reveal key={feature.title}>
              <Card className={styles.featureCard}>
                <div className={styles.featureIconWrap}>
                  <Icon className={styles.featureIcon} size={28} aria-hidden />
                </div>
                <h3 className={styles.featureTitle}>{locale === "ar" ? feature.titleAr : feature.title}</h3>
                <p className={styles.featureText}>
                  {locale === "ar" ? feature.descriptionAr : feature.description}
                </p>
              </Card>
            </Reveal>
          );
        })}
      </div>
    </LandingSection>
  );
}
