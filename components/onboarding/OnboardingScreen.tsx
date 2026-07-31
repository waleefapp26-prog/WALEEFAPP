"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { ONBOARDING_SLIDES, type OnboardingSlideVariant } from "@/lib/config/onboarding";
import styles from "@/styles/features/onboarding.module.css";

const ICON_BG: Record<OnboardingSlideVariant, string> = {
  partner: styles.icon1,
  privacy: styles.icon2,
  family: styles.icon3,
};

export function OnboardingScreen() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const slide = ONBOARDING_SLIDES[index];
  const Icon = slide.icon;
  const isLast = index === ONBOARDING_SLIDES.length - 1;

  const goNext = () => {
    if (isLast) router.push("/signup");
    else setIndex((i) => i + 1);
  };

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <Link className={styles.skip} href="/">
          Back to home
        </Link>
      </div>

      <div className={styles.stage}>
        <div key={index} className={styles.slide}>
          <div className={`${styles.iconCircle} ${ICON_BG[slide.variant]}`}>
            <Icon className={styles.iconSvg} size={64} aria-hidden />
          </div>
          <h1 className={styles.title}>{slide.title}</h1>
          <p className={styles.desc}>{slide.description}</p>
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.dots}>
          {ONBOARDING_SLIDES.map((_, i) => (
            <div key={i} className={cn(styles.dot, i === index && styles.dotActive)} aria-hidden />
          ))}
        </div>

        <Button type="button" wide onClick={goNext}>
          {isLast ? "Get Started" : "Continue"}
        </Button>

        {index > 0 ? (
          <button type="button" className={styles.back} onClick={() => setIndex((i) => i - 1)}>
            Back
          </button>
        ) : null}
      </div>
    </div>
  );
}
