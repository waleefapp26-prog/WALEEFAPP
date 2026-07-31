"use client";

import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StarRow } from "@/components/ui/StarRow";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import { LANDING_TESTIMONIALS } from "@/lib/config/landing";
import styles from "@/styles/features/landing.module.css";
import { LandingSection } from "./LandingSection";

export function LandingTestimonials() {
  const { dictionary, locale } = useTranslation();

  return (
    <LandingSection id="success-stories" tone="tint">
      <SectionHeading title={dictionary.successStories.title} lead={dictionary.successStories.subtitle} />
      <div className={styles.testimonialGrid}>
        {LANDING_TESTIMONIALS.map((t) => (
          <Reveal key={t.name}>
            <Card className={styles.testimonialCard}>
              <div className={styles.starsSm}>
                <StarRow count={5} starSize={16} compact />
              </div>
              <p className={styles.quote}>&ldquo;{locale === "ar" ? t.storyAr : t.story}&rdquo;</p>
              <div className={styles.testimonialFooter}>
                <div>
                  <p className={styles.floatTitle}>{locale === "ar" ? t.nameAr : t.name}</p>
                  <p className={styles.loc}>{locale === "ar" ? t.locationAr : t.location}</p>
                </div>
                <span className={styles.matchTag}>{t.match}</span>
              </div>
            </Card>
          </Reveal>
        ))}
      </div>
    </LandingSection>
  );
}
