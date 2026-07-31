import { cn } from "@/lib/cn";
import styles from "@/styles/ui/section-heading.module.css";

type Props = {
  title: string;
  lead?: string;
  className?: string;
};

export function SectionHeading({ title, lead, className }: Props) {
  return (
    <header className={cn(styles.head, className)}>
      <h2 className={styles.title}>{title}</h2>
      {lead ? <p className={styles.lead}>{lead}</p> : null}
    </header>
  );
}
