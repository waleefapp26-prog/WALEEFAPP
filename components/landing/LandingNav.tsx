"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { Logo } from "@/components/ui/Logo";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import { LANDING_NAV_LINKS } from "@/lib/config/landing";
import styles from "@/styles/features/landing.module.css";

export function LandingNav() {
  const [open, setOpen] = useState(false);
  const { dictionary, locale } = useTranslation();

  return (
    <nav className={styles.nav}>
      <div className={styles.navInner}>
        <div className={styles.navRow}>
          <Logo variant="nav" />

          <div className={styles.desktopMenu}>
            {LANDING_NAV_LINKS.map((link) => (
              <a key={link.href} className={styles.navLink} href={link.href}>
                {locale === "ar" ? link.labelAr : link.label}
              </a>
            ))}
            <LanguageToggle />
            <Button href="/onboarding">{dictionary.common.getStarted}</Button>
          </div>

          <button
            type="button"
            className={styles.mobileToggle}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {open ? (
          <div className={styles.mobileMenu}>
            {LANDING_NAV_LINKS.map((link) => (
              <a
                key={link.href}
                className={styles.mobileLink}
                href={link.href}
                onClick={() => setOpen(false)}
              >
                {locale === "ar" ? link.labelAr : link.label}
              </a>
            ))}
            <LanguageToggle className={styles.mobileLangToggle} />
            <Button href="/onboarding" wide onClick={() => setOpen(false)}>
              {dictionary.common.getStarted}
            </Button>
          </div>
        ) : null}
      </div>
    </nav>
  );
}
