"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/cn";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import styles from "@/styles/features/landing.module.css";
import { LandingSection } from "./LandingSection";

export function LandingFaq() {
  const { dictionary } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <LandingSection id="faq" tone="tint">
      <SectionHeading title={dictionary.faq.title} lead={dictionary.faq.subtitle} />
      <div className={styles.faqList}>
        {dictionary.faq.items.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <Reveal key={item.question}>
              <Card className={styles.faqItem}>
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
            </Reveal>
          );
        })}
      </div>
    </LandingSection>
  );
}
