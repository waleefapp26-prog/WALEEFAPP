import { cn } from "@/lib/cn";
import styles from "@/styles/ui/match-percentage.module.css";

type Size = "sm" | "md" | "lg";

type Props = {
  percentage: number;
  size?: Size;
  className?: string;
};

function strokeColor(percent: number): string {
  if (percent >= 80) return "#22c55e";
  if (percent >= 60) return "#d4af37";
  return "#ff8a5c";
}

const sizeMap: Record<
  Size,
  {
    circle: number;
    stroke: number;
    percentClass: string;
  }
> = {
  sm: { circle: 80, stroke: 6, percentClass: styles.percentSm },
  md: { circle: 120, stroke: 8, percentClass: styles.percentMd },
  lg: { circle: 180, stroke: 10, percentClass: styles.percentLg },
};

export function MatchPercentage({ percentage, size = "md", className }: Props) {
  const { circle, stroke, percentClass } = sizeMap[size];
  const radius = (circle - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;
  const color = strokeColor(percentage);

  return (
    <div className={cn(styles.wrap, className)}>
      <svg className={styles.svg} width={circle} height={circle} viewBox={`0 0 ${circle} ${circle}`}>
        <circle cx={circle / 2} cy={circle / 2} r={radius} stroke="#f5f1e8" strokeWidth={stroke} fill="none" />
        <circle
          cx={circle / 2}
          cy={circle / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
        >
          <animate
            attributeName="stroke-dashoffset"
            from={circumference}
            to={offset}
            dur="1.5s"
            fill="freeze"
            calcMode="spline"
            keySplines="0.4 0 0.2 1"
            keyTimes="0;1"
          />
        </circle>
      </svg>
      <div className={styles.labelStack}>
        <span className={cn(styles.percent, percentClass)}>{percentage}%</span>
        <span className={styles.caption}>Match</span>
      </div>
    </div>
  );
}
