import { CheckCircle, Crown } from "lucide-react";

interface BadgeProps {
  variant: "verified" | "premium";
  className?: string;
}

export function Badge({ variant, className = "" }: BadgeProps) {
  const styles = {
    verified: {
      bg: "bg-gradient-to-r from-blue-500 to-cyan-500",
      icon: CheckCircle,
      text: "Verified",
    },
    premium: {
      bg: "bg-gradient-to-r from-[#D4AF37] to-[#E8C870]",
      icon: Crown,
      text: "Premium",
    },
  };

  const { bg, icon: Icon, text } = styles[variant];

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${bg} text-white shadow-md ${className}`}
    >
      <Icon size={14} />
      <span className="text-xs font-medium">{text}</span>
    </div>
  );
}
