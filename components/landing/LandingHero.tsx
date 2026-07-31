"use client";

import { ArrowRight, CheckCircle, Heart } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StarRow } from "@/components/ui/StarRow";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import styles from "@/styles/features/landing.module.css";

export function LandingHero() {
  const { dictionary } = useTranslation();

  return (
    <section className={styles.hero}>
      <div className={styles.heroGrid}>
        <div className="animateFadeUp">
          <div className={styles.pill}>
            <Heart className={styles.pillIcon} size={18} aria-hidden />
            <span className={styles.pillText}>{dictionary.hero.eyebrow}</span>
          </div>

          <h1 className={styles.heroTitle}>{dictionary.hero.title}</h1>
          <p className={styles.heroLead}>{dictionary.hero.subtitle}</p>

          <div className={styles.heroActions}>
            <Button href="/onboarding" size="lg">
              {dictionary.hero.ctaPrimary}
              <ArrowRight size={20} aria-hidden />
            </Button>
            <Button href="#features" variant="outline" size="lg">
              {dictionary.hero.ctaSecondary}
            </Button>
          </div>

          <div className={styles.stats}>
            <div>
              <p className={styles.statValue}>50K+</p>
              <p className={styles.statLabel}>Active Users</p>
            </div>
            <div className={styles.statDivider} aria-hidden />
            <div>
              <p className={styles.statValue}>2,500+</p>
              <p className={styles.statLabel}>Marriages</p>
            </div>
            <div className={styles.statDivider} aria-hidden />
            <StarRow starSize={18} label="4.9/5" />
          </div>
        </div>

        <div className={`${styles.heroVisual} animateFadeUp`}>
          <div className={styles.heroFrame}>
            <div className={styles.heroWatermark}>
              <Image
                src="/images/logo.png"
                alt=""
                width={360}
                height={360}
                className={styles.heroWatermarkImage}
              />
            </div>

            <div className={`${styles.floatCardTop} animateFloat`}>
              <Card>
                <div className={styles.floatCardInner}>
                  <div className={styles.floatRow}>
                    <div className={styles.avatarDot} />
                    <div>
                      <p className={styles.floatTitle}>95% Match</p>
                      <p className={styles.floatSub}>Compatible values</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div className={`${styles.floatCardBottom} animateFloatReverse`}>
              <Card>
                <div className={styles.floatCardInner}>
                  <div className={styles.checkRow}>
                    <CheckCircle className={styles.checkIcon} size={20} aria-hidden />
                    <p className={styles.floatTitle}>Verified Profile</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
