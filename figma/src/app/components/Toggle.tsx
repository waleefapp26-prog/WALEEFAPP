import { motion } from "motion/react";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}

export function Toggle({ checked, onChange, label, className = "" }: ToggleProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {label && <span className="text-sm text-[#6B6B6B]">{label}</span>}
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-14 h-8 rounded-full transition-all duration-300 ${
          checked
            ? "bg-gradient-to-r from-[#FF6B9D] to-[#FF8A5C]"
            : "bg-gray-300"
        }`}
      >
        <motion.div
          animate={{
            x: checked ? 26 : 2,
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
        />
      </button>
    </div>
  );
}
