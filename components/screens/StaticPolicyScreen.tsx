"use client";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingSection } from "@/components/landing/LandingSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import styles from "@/styles/features/landing.module.css";
import staticStyles from "@/styles/features/static-page.module.css";

type Props = {
  pageKey: "privacyPage" | "termsPage";
};

export function StaticPolicyScreen({ pageKey }: Props) {
  const { dictionary } = useTranslation();
  const page = dictionary[pageKey];

  return (
    <div className={styles.page}>
      <LandingNav />
      <LandingSection tone="white">
        <SectionHeading title={page.title} lead={page.intro} />
        <div className={staticStyles.body}>
          {page.sections.map((section) => (
            <section key={section.heading}>
              <h3 className={staticStyles.heading}>{section.heading}</h3>
              <p>{section.body}</p>
            </section>
          ))}
        </div>
      </LandingSection>
      <LandingFooter />
    </div>
  );
}
