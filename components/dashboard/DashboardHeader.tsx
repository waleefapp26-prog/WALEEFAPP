import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import styles from "@/styles/features/dashboard-header.module.css";
import { NotificationBell } from "./NotificationBell";

export function DashboardHeader() {
  return (
    // Mobile-only top bar. On laptop the side rail carries the brand, the bell
    // and sign-out, so this whole strip is hidden rather than left as an empty
    // band above the content.
    <header className={styles.header}>
      <Link href="/dashboard" className={styles.brand} aria-label="Waleef">
        <Logo variant="dashboard" />
      </Link>
      <NotificationBell />
    </header>
  );
}
