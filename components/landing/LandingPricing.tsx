"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/cn";
import { SUBSCRIPTION_PLANS } from "@/lib/content/subscription-plans";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import styles from "@/styles/features/landing.module.css";
import { LandingSection } from "./LandingSection";

export function LandingPricing() {
  const { dictionary, locale } = useTranslation();
  const isAr = locale === "ar";

  return (
    <LandingSection id="pricing" tone="white">
      <SectionHeading title={dictionary.pricing.title} lead={dictionary.pricing.subtitle} />

      <div className={styles.pricingGrid}>
        {SUBSCRIPTION_PLANS.map((plan) => (
          <Reveal key={plan.id}>
            <Card className={cn(styles.pricingCard, plan.featured && styles.pricingCardFeatured)}>
              {plan.featured ? <span className={styles.pricingRibbon}>{dictionary.pricing.mostPopular}</span> : null}

              <h3 className={styles.pricingName}>{isAr ? plan.nameAr : plan.name}</h3>
              <p className={styles.pricingDesc}>{isAr ? plan.descriptionAr : plan.description}</p>

              {/* Price is derived from amountQar -- the same figure Stripe is
                  charged -- so the marketing page can't drift from billing. */}
              <p className={styles.pricingPrice}>
                {plan.amountQar ? (
                  <>
                    <span className={styles.pricingAmount}>{plan.amountQar}</span>
                    <span className={styles.pricingCurrency}>QAR</span>
                    <span className={styles.pricingPeriod}>{dictionary.pricing.perMonth}</span>
                  </>
                ) : (
                  <>
                    <span className={styles.pricingAmount}>0</span>
                    <span className={styles.pricingCurrency}>QAR</span>
                    <span className={styles.pricingPeriod}>{dictionary.pricing.forever}</span>
                  </>
                )}
              </p>

              <ul className={styles.pricingFeatures}>
                {plan.features.slice(0, 5).map((feature) => (
                  <li key={feature} className={styles.pricingFeature}>
                    <Check size={16} className={styles.pricingCheck} aria-hidden />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button href="/onboarding" variant={plan.featured ? "primary" : "outline"} wide>
                {plan.amountQar ? dictionary.pricing.ctaPaid : dictionary.pricing.ctaFree}
              </Button>
            </Card>
          </Reveal>
        ))}
      </div>

      <p className={styles.pricingNote}>{dictionary.pricing.note}</p>
    </LandingSection>
  );
}
