import styles from "@/styles/features/dashboard-header.module.css";
import { NotificationBell } from "./NotificationBell";

type Props = {
  userId: string;
  unreadCount: number;
};

export function DashboardHeader({ userId, unreadCount }: Props) {
  return (
    <div className={styles.header}>
      <NotificationBell userId={userId} initialUnreadCount={unreadCount} />
    </div>
  );
}
