"use client";

import { useState, type FormEvent } from "react";
import { Button, Form, FormActions, OtpInput } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import authStyles from "@/styles/features/auth.module.css";
import formStyles from "@/styles/ui/form.module.css";

// Supabase's default email OTP token is 8 digits (not the more common 6).
const OTP_LENGTH = 8;

type Props = {
  emailDisplay: string;
  onVerify: (code: string) => void;
  onBackToCredentials: () => void;
  error?: string;
  pending?: boolean;
};

export function AuthOtpForm({ emailDisplay, onVerify, onBackToCredentials, error, pending }: Props) {
  const [code, setCode] = useState("");
  const { dictionary } = useTranslation();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (code.length === OTP_LENGTH) onVerify(code);
  };

  return (
    <Form stack onSubmit={handleSubmit}>
      <div className={authStyles.verifyTitle}>
        <h2 className={authStyles.verifyHeading}>{dictionary.auth.verifyEmailTitle}</h2>
        <p className={authStyles.verifySub}>
          {dictionary.auth.verifyEmailSub} {emailDisplay}
        </p>
      </div>

      <OtpInput
        length={OTP_LENGTH}
        onChange={setCode}
        onComplete={(completedCode) => onVerify(completedCode)}
        invalid={!!error}
      />

      {error ? <p className={authStyles.errorText}>{error}</p> : null}

      <FormActions className={formStyles.mt6}>
        <Button type="submit" wide disabled={pending || code.length < OTP_LENGTH}>
          {pending ? dictionary.auth.verifying : dictionary.auth.verifyAndContinue}
        </Button>
      </FormActions>

      <button type="button" className={authStyles.textButton} onClick={onBackToCredentials}>
        {dictionary.auth.changeEmail}
      </button>
    </Form>
  );
}
