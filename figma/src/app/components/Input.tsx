import { useState } from "react";

interface InputProps {
  label?: string;
  placeholder?: string;
  type?: string;
  error?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function Input({
  label,
  placeholder,
  type = "text",
  error,
  value,
  onChange,
  className = "",
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label className="text-sm text-[#6B6B6B] font-medium">{label}</label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`
          px-6 py-4 rounded-[16px] border-2 transition-all duration-300
          bg-white outline-none
          ${
            error
              ? "border-red-400 focus:border-red-500"
              : isFocused
              ? "border-[#FF6B9D] shadow-lg shadow-pink-100"
              : "border-gray-200 hover:border-gray-300"
          }
        `}
      />
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
}
