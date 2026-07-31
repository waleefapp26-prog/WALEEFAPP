"use client";

import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import { LANDING_STEPS } from "@/lib/config/landing";
import styles from "@/styles/features/landing.module.css";
import { LandingSection } from "./LandingSection";

export function LandingSteps() {
  const { dictionary, locale } = useTranslation();

  return (
    <LandingSection id="how-it-works">
      <SectionHeading title={dictionary.steps.title} lead={dictionary.steps.subtitle} />
      <div className={styles.stepsGrid}>
        {LANDING_STEPS.map((step, index) => (
          <Reveal key={step.number}>
            <div className={styles.stepWrap}>
              <div className={styles.stepNum}>{step.number}</div>
              <h3 className={styles.stepTitle}>{locale === "ar" ? step.titleAr : step.title}</h3>
              <p className={styles.stepText}>{locale === "ar" ? step.descriptionAr : step.description}</p>
              {index < LANDING_STEPS.length - 1 ? (
                <div className={styles.stepArrow} aria-hidden>
                  <ArrowRight size={32} />
                </div>
              ) : null}
            </div>
          </Reveal>
        ))}
      </div>
    </LandingSection>
  );
}
