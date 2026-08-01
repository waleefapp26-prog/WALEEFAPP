import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import styles from "@/styles/features/dashboard-header.module.css";
import { NotificationBell } from "./NotificationBell";

type Props = {
  userId: string;
  unreadCount: number;
};

export function DashboardHeader({ userId, unreadCount }: Props) {
  return (
    // A real top bar rather than a lone bell floating in an empty strip.
    // The brand is hidden on laptop, where the side rail already carries it.
    <header className={styles.header}>
      <Link href="/dashboard" className={styles.brand} aria-label="Waleef">
        <Logo variant="dashboard" />
      </Link>
      <NotificationBell userId={userId} initialUnreadCount={unreadCount} />
    </header>
  );
}
