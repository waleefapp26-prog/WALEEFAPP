"use client";

import { Logo } from "@/components/ui/Logo";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import { LANDING_FOOTER_COLUMNS } from "@/lib/config/landing";
import styles from "@/styles/features/landing.module.css";

export function LandingFooter() {
  const { dictionary, locale } = useTranslation();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerGrid}>
          <div>
            <Logo variant="footer" as="span" />
            <p className={styles.footerBlurb}>{dictionary.footer.tagline}</p>
          </div>
          {LANDING_FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className={styles.footerColTitle}>{locale === "ar" ? col.titleAr : col.title}</h4>
              <ul className={styles.footerList}>
                {col.links.map((item) => (
                  <li key={item.label}>
                    {item.href ? (
                      <a className={styles.footerLink} href={item.href}>
                        {locale === "ar" ? item.labelAr : item.label}
                      </a>
                    ) : (
                      <span>{locale === "ar" ? item.labelAr : item.label}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className={styles.footerBottom}>
          <p>&copy; 2026 Waleef. {dictionary.footer.rights}</p>
        </div>
      </div>
    </footer>
  );
}
