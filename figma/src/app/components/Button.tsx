import { motion } from "motion/react";
import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "disabled";
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export function Button({
  children,
  variant = "primary",
  onClick,
  className = "",
  disabled = false,
}: ButtonProps) {
  const baseStyles = "px-8 py-4 rounded-[20px] font-medium transition-all duration-300";

  const variants = {
    primary:
      "bg-gradient-to-r from-[#FF6B9D] to-[#FF8A5C] text-white shadow-lg shadow-pink-200/40 hover:shadow-xl hover:shadow-pink-200/60 hover:scale-[1.02]",
    secondary:
      "bg-[#F5F1E8] text-[#1A1A1A] hover:bg-[#E8E4D8] hover:scale-[1.02]",
    outline:
      "border-2 border-[#FF6B9D] text-[#FF6B9D] bg-transparent hover:bg-gradient-to-r hover:from-[#FF6B9D] hover:to-[#FF8A5C] hover:text-white hover:border-transparent hover:scale-[1.02]",
    disabled: "bg-gray-200 text-gray-400 cursor-not-allowed",
  };

  const variantStyle = disabled ? variants.disabled : variants[variant];

  return (
    <motion.button
      whileTap={disabled ? {} : { scale: 0.98 }}
      className={`${baseStyles} ${variantStyle} ${className}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {children}
    </motion.button>
  );
}
