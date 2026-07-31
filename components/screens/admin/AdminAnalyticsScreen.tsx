import { Activity, CreditCard, Heart, MessageCircle, TrendingUp, Users } from "lucide-react";
import { Card } from "@/components/ui";
import type { AdminAnalytics } from "@/lib/types/adminAnalytics";
import styles from "@/styles/features/admin.module.css";

type Props = {
  analytics: AdminAnalytics | null;
};

export function AdminAnalyticsScreen({ analytics }: Props) {
  const stats = analytics
    ? [
        { label: "Total Users", value: analytics.totalUsers, icon: Users },
        { label: "Active Users (30d)", value: analytics.activeUsers30d, icon: Activity },
        { label: "Total Matches", value: analytics.totalMatches, icon: Heart },
        { label: "Total Messages", value: analytics.totalMessages, icon: MessageCircle },
        { label: "Paid Subscribers", value: analytics.paidSubscribers, icon: CreditCard },
        { label: "Conversion Rate", value: `${analytics.conversionRate}%`, icon: TrendingUp },
      ]
    : [];

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.title}>Analytics</h1>
        <p className={styles.sub}>Platform overview</p>

        {!analytics ? (
          <p className={styles.sub}>No data available.</p>
        ) : (
          <div className={styles.stats}>
            {stats.map((stat) => (
              <Card key={stat.label} variant="info">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p className={styles.statLabel}>{stat.label}</p>
                    <p className={styles.statValue}>{stat.value}</p>
                  </div>
                  <stat.icon size={28} aria-hidden />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
