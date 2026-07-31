import { Check, Crown, Shield, Sparkles } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { SUBSCRIPTION_PLANS } from "@/lib/content/subscription-plans";
import { cn } from "@/lib/cn";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import styles from "@/styles/features/subscription.module.css";
import { UpgradeButton } from "./subscription/UpgradeButton";

export function SubscriptionScreen() {
  const { dictionary } = useTranslation();

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <div className={styles.badge}>
            <Crown style={{ color: "#d4af37" }} size={20} aria-hidden />
            <span className={styles.badgeText}>{dictionary.subscription.choosePlan}</span>
          </div>
          <h1 className={styles.title}>{dictionary.subscription.findPartner}</h1>
          <p className={styles.lead}>{dictionary.subscription.invest}</p>
        </header>

        <div className={styles.trust}>
          <div className={styles.trustInner}>
            <div className={styles.trustItem}>
              <Shield style={{ color: "#16a34a" }} size={18} aria-hidden />
              <span>{dictionary.subscription.secure}</span>
            </div>
            <span className={styles.divider} aria-hidden />
            <div className={styles.trustItem}>
              <Sparkles style={{ color: "#d4af37" }} size={18} aria-hidden />
              <span>{dictionary.subscription.islamicValues}</span>
            </div>
            <span className={styles.divider} aria-hidden />
            <div className={styles.trustItem}>
              <Check style={{ color: "#2563eb" }} size={18} aria-hidden />
              <span>{dictionary.subscription.cancelAnytime}</span>
            </div>
          </div>
        </div>

        <div className={styles.plans}>
          {SUBSCRIPTION_PLANS.map((plan) => (
            <div key={plan.id} className={styles.planWrap}>
              <Card className={cn(styles.planCard, plan.featured && styles.planFeatured)}>
                {plan.featured ? (
                  <div className={styles.ribbon}>
                    <span className={styles.ribbonInner}>{dictionary.subscription.mostPopular}</span>
                  </div>
                ) : null}
                <div className={styles.planHead}>
                  <h3 className={styles.planName}>{plan.name}</h3>
                  <p className={styles.planDesc}>{plan.description}</p>
                  <div className={styles.priceRow}>
                    <span className={styles.price}>{plan.price}</span>
                    <span className={styles.period}>/ {plan.period}</span>
                  </div>
                </div>
                <div className={styles.featureList}>
                  {plan.features.map((feature) => (
                    <div key={feature} className={styles.featureRow}>
                      <Check className={styles.check} size={18} aria-hidden />
                      <span style={{ fontSize: "0.875rem" }}>{feature}</span>
                    </div>
                  ))}
                  {plan.notIncluded.map((feature) => (
                    <div key={feature} className={styles.strikeRow}>
                      <div className={styles.strikeMark}>
                        <span className={styles.strikeLine} />
                      </div>
                      <span className={styles.strikeText}>{feature}</span>
                    </div>
                  ))}
                </div>
                {plan.id === "free" ? (
                  <Button variant="outline" className={styles.cta} disabled>
                    {dictionary.subscription.currentPlan}
                  </Button>
                ) : (
                  <UpgradeButton planId={plan.id} featured={plan.featured} className={styles.cta} />
                )}
              </Card>
            </div>
          ))}
        </div>

        <Card className={styles.commitment}>
          <h3 className={styles.commitmentTitle}>{dictionary.subscription.commitmentTitle}</h3>
          <p className={styles.commitmentBody}>{dictionary.subscription.commitmentBody}</p>
        </Card>
      </div>
    </div>
  );
}
