"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/cn";
import { DASHBOARD_NAV_ITEMS } from "@/lib/config/dashboard";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import navStyles from "@/styles/features/dashboard-nav.module.css";

export function DashboardNav() {
  const pathname = usePathname();
  const { dictionary } = useTranslation();

  return (
    <div className={navStyles.dockWrap}>
      <nav className={navStyles.dock} aria-label="Dashboard">
        {/* Brand sits at the top of the side rail and goes home. Hidden on
            mobile, where the bottom bar has no vertical room and the top bar
            carries the brand instead. */}
        <Link href="/dashboard" className={navStyles.dockBrand} aria-label="Waleef">
          <Logo variant="footer" />
        </Link>

        {DASHBOARD_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          const label = dictionary.dashboardNav[item.labelKey];
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={label}
              className={cn(navStyles.dockItem, active && navStyles.dockActive)}
            >
              <Icon size={20} aria-hidden />
              <span>{label}</span>
            </Link>
          );
        })}
        <LanguageToggle className={navStyles.dockLangToggle} />
      </nav>
    </div>
  );
}
