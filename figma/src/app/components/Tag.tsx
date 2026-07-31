import { motion } from "motion/react";

interface TagProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Tag({
  label,
  selected = false,
  onClick,
  className = "",
}: TagProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
        ${
          selected
            ? "bg-gradient-to-r from-[#FF6B9D] to-[#FF8A5C] text-white shadow-md"
            : "bg-white border-2 border-gray-200 text-[#6B6B6B] hover:border-[#FF6B9D]"
        }
        ${className}
      `}
    >
      {label}
    </motion.button>
  );
}
