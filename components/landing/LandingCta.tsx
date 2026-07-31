"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import styles from "@/styles/features/landing.module.css";

export function LandingCta() {
  const { dictionary } = useTranslation();

  return (
    <section className={styles.section}>
      <div className={styles.ctaWrap}>
        <div className={`${styles.ctaBox} animateFadeUp`}>
          <h2 className={styles.ctaTitle}>{dictionary.cta.title}</h2>
          <p className={styles.ctaLead}>{dictionary.cta.subtitle}</p>
          <Button href="/onboarding" variant="ctaOnGradient" size="lg">
            {dictionary.cta.button}
            <ArrowRight size={20} aria-hidden />
          </Button>
          <p className={styles.ctaNote}>Free to join • No credit card required</p>
        </div>
      </div>
    </section>
  );
}
