"use client";

import { useCallback, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { cn } from "@/lib/cn";
import styles from "@/styles/ui/input.module.css";

export type OtpInputProps = {
  length?: number;
  /** Called whenever the combined code string changes (may include empty slots). */
  onChange?: (code: string) => void;
  /** Called when all slots contain a digit. */
  onComplete?: (code: string) => void;
  invalid?: boolean;
  className?: string;
  "aria-label"?: string;
};

export function OtpInput({
  length = 6,
  onChange,
  onComplete,
  invalid,
  className,
  "aria-label": ariaLabel = "One-time code",
}: OtpInputProps) {
  const [digits, setDigits] = useState<string[]>(() => Array.from({ length }, () => ""));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const wasCompleteRef = useRef(false);

  const emit = useCallback(
    (next: string[]) => {
      const code = next.join("");
      onChange?.(code);
      const complete = next.every((d) => d.length === 1);
      if (complete && !wasCompleteRef.current) {
        wasCompleteRef.current = true;
        onComplete?.(code);
      }
      if (!complete) wasCompleteRef.current = false;
    },
    [onChange, onComplete],
  );

  const setAt = (index: number, value: string) => {
    const char = value.replace(/\D/g, "").slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = char;
      emit(next);
      return next;
    });
    return char;
  };

  const handleChange = (index: number, raw: string) => {
    const char = setAt(index, raw);
    if (char && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && e.currentTarget.value === "" && index > 0) {
      inputsRef.current[index - 1]?.focus();
      setAt(index - 1, "");
      e.preventDefault();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
      e.preventDefault();
    }
    if (e.key === "ArrowRight" && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
      e.preventDefault();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    const next = Array.from({ length }, (_, i) => pasted[i] ?? "");
    setDigits(next);
    emit(next);
    const focusIndex = Math.min(pasted.length, length) - 1;
    inputsRef.current[Math.max(0, focusIndex)]?.focus();
  };

  return (
    <div className={cn(styles.otpRow, className)} role="group" aria-label={ariaLabel}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          name={`otp-${index + 1}`}
          maxLength={1}
          value={digit}
          aria-invalid={invalid || undefined}
          className={cn(styles.otpInput, invalid && styles.otpInputInvalid)}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
        />
      ))}
    </div>
  );
}
