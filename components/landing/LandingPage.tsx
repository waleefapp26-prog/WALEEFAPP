import type { SuccessStory } from "@/lib/queries/successStories";
import styles from "@/styles/features/landing.module.css";
import { LandingCta } from "./LandingCta";
import { LandingFaq } from "./LandingFaq";
import { LandingFeatureGrid } from "./LandingFeatureGrid";
import { LandingFooter } from "./LandingFooter";
import { LandingHero } from "./LandingHero";
import { LandingNav } from "./LandingNav";
import { LandingPricing } from "./LandingPricing";
import { LandingSteps } from "./LandingSteps";
import { LandingTestimonials } from "./LandingTestimonials";
import { LandingTrust } from "./LandingTrust";

type Props = {
  /** Real published stories; the section hides itself when there are none. */
  successStories: SuccessStory[];
};

export function LandingPage({ successStories }: Props) {
  return (
    <div className={styles.page}>
      <LandingNav />
      <LandingHero />
      <LandingFeatureGrid />
      <LandingSteps />
      <LandingTrust />
      <LandingTestimonials stories={successStories} />
      <LandingPricing />
      <LandingFaq />
      <LandingCta />
      <LandingFooter />
    </div>
  );
}
