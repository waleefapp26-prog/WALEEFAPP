"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { Mail } from "lucide-react";
import { Button, Form, FormActions, Input } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import authStyles from "@/styles/features/auth.module.css";
import formStyles from "@/styles/ui/form.module.css";

type Mode = "login" | "signup";

type Props = {
  mode: Mode;
  email: string;
  onEmailChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onGoogleSignIn: () => void;
  error?: string;
  pending?: boolean;
  googlePending?: boolean;
};

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.4 0 10.3-2.1 14-5.4l-6.5-5.5C29.5 34.8 26.9 36 24 36c-5.2 0-9.6-3.3-11.2-7.9l-6.5 5C9.6 39.6 16.3 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.5 5.5C41.6 35.9 44 30.5 44 24c0-1.2-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}

export function AuthCredentialsForm({
  mode,
  email,
  onEmailChange,
  onSubmit,
  onGoogleSignIn,
  error,
  pending,
  googlePending,
}: Props) {
  const { dictionary } = useTranslation();
  const otherHref = mode === "login" ? "/signup" : "/login";
  const otherLabel = mode === "login" ? dictionary.auth.signUp : dictionary.auth.login;

  return (
    <>
      <button
        type="button"
        className={authStyles.googleButton}
        onClick={onGoogleSignIn}
        disabled={googlePending}
      >
        <GoogleIcon />
        {googlePending ? dictionary.auth.redirecting : dictionary.auth.continueWithGoogle}
      </button>

      <div className={authStyles.divider}>
        <span className={authStyles.dividerLine} />
        <span>{dictionary.auth.or}</span>
        <span className={authStyles.dividerLine} />
      </div>

      <Form stack onSubmit={onSubmit}>
        <Input
          startAdornment={<Mail size={20} aria-hidden />}
          type="email"
          name="email"
          autoComplete="email"
          placeholder={dictionary.auth.emailPlaceholder}
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
        />

        {error ? <p className={authStyles.errorText}>{error}</p> : null}

        <FormActions className={formStyles.mt6}>
          <Button type="submit" wide disabled={pending}>
            {pending ? dictionary.auth.sendingCode : dictionary.common.continue}
          </Button>
        </FormActions>

        <p className={authStyles.legal}>{dictionary.auth.agreeTerms}</p>

        <p className={authStyles.legal}>
          {mode === "login" ? dictionary.auth.newHere : dictionary.auth.alreadyHaveAccount}{" "}
          <Link href={otherHref} className={authStyles.legalAccent}>
            {otherLabel}
          </Link>
        </p>
      </Form>
    </>
  );
}
