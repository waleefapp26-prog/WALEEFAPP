import styles from "@/styles/features/landing.module.css";
import { LandingCta } from "./LandingCta";
import { LandingFaq } from "./LandingFaq";
import { LandingFeatureGrid } from "./LandingFeatureGrid";
import { LandingFooter } from "./LandingFooter";
import { LandingHero } from "./LandingHero";
import { LandingNav } from "./LandingNav";
import { LandingSteps } from "./LandingSteps";
import { LandingTestimonials } from "./LandingTestimonials";
import { LandingTrust } from "./LandingTrust";

export function LandingPage() {
  return (
    <div className={styles.page}>
      <LandingNav />
      <LandingHero />
      <LandingFeatureGrid />
      <LandingSteps />
      <LandingTrust />
      <LandingTestimonials />
      <LandingFaq />
      <LandingCta />
      <LandingFooter />
    </div>
  );
}
