import { motion } from "motion/react";
import { useEffect, useState } from "react";

interface MatchPercentageProps {
  percentage: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function MatchPercentage({
  percentage,
  size = "md",
  className = "",
}: MatchPercentageProps) {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercentage(percentage);
    }, 300);
    return () => clearTimeout(timer);
  }, [percentage]);

  const sizes = {
    sm: { circle: 80, stroke: 6, text: "text-xl" },
    md: { circle: 120, stroke: 8, text: "text-3xl" },
    lg: { circle: 180, stroke: 10, text: "text-5xl" },
  };

  const { circle, stroke, text } = sizes[size];
  const radius = (circle - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animatedPercentage / 100) * circumference;

  const getColor = (percent: number) => {
    if (percent >= 80) return "#22C55E";
    if (percent >= 60) return "#D4AF37";
    return "#FF8A5C";
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={circle} height={circle} className="transform -rotate-90">
        <circle
          cx={circle / 2}
          cy={circle / 2}
          r={radius}
          stroke="#F5F1E8"
          strokeWidth={stroke}
          fill="none"
        />
        <motion.circle
          cx={circle / 2}
          cy={circle / 2}
          r={radius}
          stroke={getColor(percentage)}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className={`${text} font-bold bg-gradient-to-r from-[#FF6B9D] to-[#FF8A5C] bg-clip-text text-transparent`}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {animatedPercentage}%
        </motion.span>
        <span className="text-xs text-[#6B6B6B] mt-1">Match</span>
      </div>
    </div>
  );
}
