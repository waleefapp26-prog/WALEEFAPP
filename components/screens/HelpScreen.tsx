"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingSection } from "@/components/landing/LandingSection";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/cn";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import styles from "@/styles/features/landing.module.css";

export function HelpScreen() {
  const { dictionary } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className={styles.page}>
      <LandingNav />
      <LandingSection tone="white">
        <SectionHeading title={dictionary.helpPage.title} lead={dictionary.helpPage.intro} />
        <div className={styles.faqList}>
          {dictionary.helpPage.items.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <Card key={item.question} className={styles.faqItem}>
                <button
                  type="button"
                  className={styles.faqQuestion}
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <span>{item.question}</span>
                  <ChevronDown className={cn(styles.faqIcon, isOpen && styles.faqIconOpen)} size={20} aria-hidden />
                </button>
                {isOpen ? <p className={styles.faqAnswer}>{item.answer}</p> : null}
              </Card>
            );
          })}
        </div>
      </LandingSection>
      <LandingFooter />
    </div>
  );
}
