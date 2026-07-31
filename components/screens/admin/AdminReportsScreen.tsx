import { Card } from "@/components/ui";
import type { Report } from "@/lib/types/report";
import styles from "@/styles/features/admin.module.css";

type Props = {
  reports: Report[];
};

export function AdminReportsScreen({ reports }: Props) {
  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.title}>Reports</h1>
        <p className={styles.sub}>{reports.length} total</p>

        {reports.length === 0 ? (
          <p className={styles.sub}>No reports yet.</p>
        ) : (
          <div className={styles.cardList}>
            {reports.map((report) => (
              <Card key={report.id}>
                <div className={styles.rowMain}>
                  <p className={styles.rowName}>
                    {report.reporterName ?? "Unknown"} reported {report.reportedName ?? "Unknown"}
                  </p>
                  <p className={styles.rowMeta}>{report.reason}</p>
                  <p className={styles.rowMeta}>{new Date(report.createdAt).toLocaleString()}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
