"use client";

import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import type { SuccessStory } from "@/lib/queries/successStories";
import styles from "@/styles/features/landing.module.css";
import { LandingSection } from "./LandingSection";

type Props = {
  stories: SuccessStory[];
};

/** Real, consented, admin-approved stories only.
 *
 *  This section used to render three hardcoded couples with invented quotes
 *  and invented match percentages. When there are no real stories yet it now
 *  renders nothing, rather than filling the space with fiction. */
export function LandingTestimonials({ stories }: Props) {
  const { dictionary, locale } = useTranslation();

  if (stories.length === 0) return null;

  return (
    <LandingSection id="success-stories" tone="tint">
      <SectionHeading title={dictionary.successStories.title} lead={dictionary.successStories.subtitle} />
      <div className={styles.testimonialGrid}>
        {stories.map((story) => (
          <Reveal key={story.id}>
            <Card className={styles.testimonialCard}>
              <p className={styles.quote}>
                &ldquo;{(locale === "ar" && story.storyAr) || story.storyEn}&rdquo;
              </p>
              <div className={styles.testimonialFooter}>
                <div>
                  <p className={styles.floatTitle}>
                    {(locale === "ar" && story.coupleNameAr) || story.coupleName}
                  </p>
                  {story.location ? (
                    <p className={styles.loc}>{(locale === "ar" && story.locationAr) || story.location}</p>
                  ) : null}
                </div>
              </div>
            </Card>
          </Reveal>
        ))}
      </div>
    </LandingSection>
  );
}
