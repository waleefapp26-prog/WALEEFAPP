"use client";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingSection } from "@/components/landing/LandingSection";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import type { SuccessStory } from "@/lib/queries/successStories";
import styles from "@/styles/features/landing.module.css";
import staticStyles from "@/styles/features/static-page.module.css";

type Props = {
  stories: SuccessStory[];
};

export function SuccessStoriesScreen({ stories }: Props) {
  const { dictionary, locale } = useTranslation();

  return (
    <div className={styles.page}>
      <LandingNav />
      <LandingSection tone="white">
        <SectionHeading title={dictionary.successStories.title} lead={dictionary.successStories.subtitle} />

        {/* No invented placeholders: an empty library says it's empty. */}
        {stories.length === 0 ? (
          <div className={staticStyles.body}>
            <p>{dictionary.successStories.empty}</p>
          </div>
        ) : (
          <div className={styles.testimonialGrid}>
            {stories.map((story) => (
              <Card key={story.id} className={styles.testimonialCard}>
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
            ))}
          </div>
        )}
      </LandingSection>
      <LandingFooter />
    </div>
  );
}
