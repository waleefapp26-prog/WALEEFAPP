import { motion } from "motion/react";
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  variant?: "default" | "profile" | "match" | "info";
  className?: string;
  onClick?: () => void;
}

export function Card({
  children,
  variant = "default",
  className = "",
  onClick,
}: CardProps) {
  const baseStyles = "bg-white rounded-[20px] transition-all duration-300";

  const variants = {
    default: "p-6 shadow-sm hover:shadow-md",
    profile:
      "p-6 shadow-lg hover:shadow-xl border border-gray-100 hover:border-pink-100",
    match:
      "p-8 shadow-xl hover:shadow-2xl border-2 border-transparent hover:border-pink-100",
    info: "p-5 shadow-sm bg-gradient-to-br from-white to-[#FFF8F0]",
  };

  const Component = onClick ? motion.div : "div";
  const motionProps = onClick
    ? {
        whileHover: { scale: 1.02, y: -4 },
        whileTap: { scale: 0.98 },
      }
    : {};

  return (
    <Component
      className={`${baseStyles} ${variants[variant]} ${className} ${
        onClick ? "cursor-pointer" : ""
      }`}
      onClick={onClick}
      {...motionProps}
    >
      {children}
    </Component>
  );
}
