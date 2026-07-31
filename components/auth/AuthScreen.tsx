"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import { createClient } from "@/lib/supabase/client";
import styles from "@/styles/features/auth.module.css";
import { AuthBrand } from "./AuthBrand";
import { AuthCredentialsForm } from "./AuthCredentialsForm";
import { AuthModeToggle } from "./AuthModeToggle";
import { AuthOtpForm } from "./AuthOtpForm";

type Mode = "login" | "signup";

type Props = {
  mode: Mode;
};

export function AuthScreen({ mode }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const { dictionary } = useTranslation();
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [googlePending, setGooglePending] = useState(false);
  const [credentialsError, setCredentialsError] = useState<string>();
  const [otpError, setOtpError] = useState<string>();

  const handleGoogleSignIn = async () => {
    setCredentialsError(undefined);
    setGooglePending(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) {
        setCredentialsError(error.message);
        setGooglePending(false);
      }
      // On success the browser is redirected away to Google, so no further
      // state update is needed here.
    } catch {
      setCredentialsError(dictionary.auth.genericError);
      setGooglePending(false);
    }
  };

  const handleSendCode = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCredentialsError(undefined);
    setPending(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: mode === "signup" },
      });
      if (error) {
        setCredentialsError(error.message);
        return;
      }
      setStep("otp");
    } catch {
      setCredentialsError(dictionary.auth.genericError);
    } finally {
      setPending(false);
    }
  };

  const handleVerify = async (code: string) => {
    setOtpError(undefined);
    setPending(true);

    try {
      const { error } = await supabase.auth.verifyOtp({ email, token: code, type: "email" });
      if (error) {
        setOtpError(error.message);
        return;
      }
      router.push(mode === "signup" ? "/profile/create" : "/dashboard");
      router.refresh();
    } catch {
      setOtpError("Something went wrong reaching the server. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <AuthBrand />

        <div className={styles.card}>
          <AuthModeToggle mode={mode} />

          {step === "credentials" ? (
            <AuthCredentialsForm
              mode={mode}
              email={email}
              onEmailChange={setEmail}
              onSubmit={handleSendCode}
              onGoogleSignIn={handleGoogleSignIn}
              error={credentialsError}
              pending={pending}
              googlePending={googlePending}
            />
          ) : (
            <AuthOtpForm
              emailDisplay={email || "your email"}
              onVerify={handleVerify}
              onBackToCredentials={() => setStep("credentials")}
              error={otpError}
              pending={pending}
            />
          )}
        </div>
      </div>
    </div>
  );
}
