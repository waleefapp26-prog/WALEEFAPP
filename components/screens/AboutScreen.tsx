"use client";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingSection } from "@/components/landing/LandingSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import styles from "@/styles/features/landing.module.css";
import staticStyles from "@/styles/features/static-page.module.css";

export function AboutScreen() {
  const { dictionary } = useTranslation();
  const { about } = dictionary;

  return (
    <div className={styles.page}>
      <LandingNav />
      <LandingSection tone="white">
        <SectionHeading title={about.title} lead={about.intro} />
        <div className={staticStyles.body}>
          <section>
            <h3 className={staticStyles.heading}>{about.mission}</h3>
            <p>{about.missionBody}</p>
          </section>
          <section>
            <h3 className={staticStyles.heading}>{about.values}</h3>
            <p>{about.valuesBody}</p>
          </section>
          <section>
            <h3 className={staticStyles.heading}>{about.qatar}</h3>
            <p>{about.qatarBody}</p>
          </section>
        </div>
      </LandingSection>
      <LandingFooter />
    </div>
  );
}
