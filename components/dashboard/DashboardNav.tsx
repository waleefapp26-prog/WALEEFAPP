"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/cn";
import { DASHBOARD_NAV_ITEMS } from "@/lib/config/dashboard";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import navStyles from "@/styles/features/dashboard-nav.module.css";
import { NotificationBell } from "./NotificationBell";
import { useNavUnreadCounts } from "./NotificationCountProvider";
import { SignOutButton } from "./SignOutButton";

type Props = {
  /** False for the signed-out shell, where there is no session to badge. */
  signedIn?: boolean;
};

export function DashboardNav({ signedIn = false }: Props) {
  const pathname = usePathname();
  const { dictionary } = useTranslation();
  const counts = useNavUnreadCounts();

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
          // Each destination carries its own unread count, so a new message
          // lights up Chats and a wali reply lights up Family -- instead of
          // everything funnelling into one bell that says nothing about where
          // to look.
          const unread = counts[item.labelKey] ?? 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={unread > 0 ? `${label} (${unread})` : label}
              className={cn(navStyles.dockItem, active && navStyles.dockActive)}
            >
              <span className={navStyles.dockIcon}>
                <Icon size={20} aria-hidden />
                {unread > 0 ? <span className={navStyles.dockBadge}>{unread > 9 ? "9+" : unread}</span> : null}
              </span>
              <span>{label}</span>
            </Link>
          );
        })}

        {/* Notifications, language and sign-out live at the foot of the rail.
            The bell is rail-only: on mobile it stays in the top bar, since the
            bottom bar is already carrying six destinations. */}
        <div className={navStyles.dockFooter}>
          {signedIn ? <NotificationBell variant="rail" className={navStyles.dockBell} /> : null}
          <LanguageToggle className={navStyles.dockLangToggle} />
          {signedIn ? <SignOutButton className={navStyles.dockSignOut} /> : null}
        </div>
      </nav>
    </div>
  );
}
