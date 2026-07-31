"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button, ProgressBar, Tag, Textarea, TextField } from "@/components/ui";
import { INTEREST_OPTIONS } from "@/lib/config/interests";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import { upsertAnswer } from "@/lib/queries/questionnaire";
import { evaluateShowIf } from "@/lib/questionnaire/showIf";
import { createClient } from "@/lib/supabase/client";
import type { OnboardingQuestion } from "@/lib/types/questionnaire";
import styles from "@/styles/features/profile-creation.module.css";

const STEP_TITLES: Record<string, { en: string; ar: string }> = {
  basic_info: { en: "Basic Information", ar: "المعلومات الأساسية" },
  social_status: { en: "Social Status", ar: "الحالة الاجتماعية" },
  appearance: { en: "Appearance", ar: "المظهر" },
  religion: { en: "Religious Background", ar: "الخلفية الدينية" },
  health: { en: "Health", ar: "الصحة" },
  professional: { en: "Education & Work", ar: "التعليم والعمل" },
  finance: { en: "Financial Status", ar: "الوضع المالي" },
  lifestyle: { en: "Lifestyle", ar: "أسلوب الحياة" },
  family: { en: "Family", ar: "الأسرة" },
  personality: { en: "Personality", ar: "الشخصية" },
};

function computeAge(dateOfBirth: string): number | null {
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) age--;
  return age;
}

type Props = {
  questions: OnboardingQuestion[];
};

export function ProfileCreationScreen({ questions }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const { locale, dictionary } = useTranslation();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [pseudonym, setPseudonym] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [lookingFor, setLookingFor] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const stepKeys = useMemo(() => Array.from(new Set(questions.map((q) => q.stepKey))), [questions]);
  const totalSteps = stepKeys.length + 2;
  const isLeadStep = step === 0;
  const isTrailingStep = step === totalSteps - 1;
  const currentStepKey = !isLeadStep && !isTrailingStep ? stepKeys[step - 1] : null;

  const visibleQuestions = currentStepKey
    ? questions
        .filter((q) => q.stepKey === currentStepKey)
        .filter((q) => evaluateShowIf(q.showIf, answers))
    : [];

  const setAnswer = (slug: string, value: string) => setAnswers((prev) => ({ ...prev, [slug]: value }));

  const toggleInterest = (value: string) => {
    setInterests((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  };

  const canContinue = isLeadStep
    ? fullName.trim().length > 0 && phone.trim().length > 0
    : isTrailingStep
      ? true
      : visibleQuestions.every((q) => !q.required || (answers[q.slug]?.trim().length ?? 0) > 0);

  const submitProfile = async () => {
    setSubmitting(true);
    setSubmitError(undefined);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setSubmitError(dictionary.auth.sessionExpired);
        return;
      }

      const educationQuestion = questions.find((q) => q.slug === "onb_professional_education_level");
      const educationLabel = educationQuestion?.options.find(
        (o) => o.value === answers["onb_professional_education_level"],
      )?.label_en;
      const dob = answers["onb_basic_date_of_birth"];
      const city = answers["onb_basic_city"];
      const country = answers["onb_basic_country_of_residence"];

      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: fullName,
        pseudonym: pseudonym.trim() || null,
        phone,
        age: dob ? computeAge(dob) : null,
        gender: answers["onb_basic_gender"] ?? null,
        location: [city, country].filter(Boolean).join(", ") || null,
        education: educationLabel ?? null,
        occupation: answers["onb_professional_job_title_field"] ?? null,
        interests,
        looking_for: lookingFor,
        onboarding_complete: true,
      });

      if (error) {
        setSubmitError(error.message);
        return;
      }

      await Promise.all(
        questions
          .filter((q) => answers[q.slug] !== undefined && evaluateShowIf(q.showIf, answers))
          .map((q) => upsertAnswer(supabase, user.id, q.id, answers[q.slug])),
      );

      router.push("/dashboard");
      router.refresh();
    } catch {
      setSubmitError(dictionary.auth.genericError);
    } finally {
      setSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step < totalSteps - 1) {
      setStep((s) => s + 1);
      return;
    }
    void submitProfile();
  };

  const renderQuestion = (question: OnboardingQuestion) => {
    const prompt = (locale === "ar" && question.promptAr) || question.promptEn;
    const value = answers[question.slug] ?? "";

    if (question.type === "select") {
      return (
        <div key={question.id}>
          <span className={styles.fieldLabel}>{prompt}</span>
          <div className={styles.tagRow}>
            {question.options.map((option) => (
              <Tag
                key={option.value}
                label={(locale === "ar" && option.label_ar) || option.label_en}
                selected={value === option.value}
                onClick={() => setAnswer(question.slug, option.value)}
              />
            ))}
          </div>
        </div>
      );
    }

    return (
      <TextField
        key={question.id}
        label={prompt}
        type={question.type === "date" ? "date" : question.type === "number" ? "number" : "text"}
        value={value}
        onValueChange={(v) => setAnswer(question.slug, v)}
      />
    );
  };

  const renderStep = () => {
    if (isLeadStep) {
      return (
        <div className={styles.stepBlock}>
          <div>
            <h2 className={styles.stepTitle}>{dictionary.profileCreationScreen.tellUsAboutYourself}</h2>
            <p className={styles.stepLead}>{dictionary.profileCreationScreen.letsStart}</p>
          </div>
          <TextField
            label={dictionary.profileCreationScreen.fullNameLabel}
            placeholder={dictionary.profileCreationScreen.fullNameLabel}
            value={fullName}
            onValueChange={setFullName}
          />
          <TextField
            label={dictionary.profileCreationScreen.phoneLabel}
            type="tel"
            placeholder={dictionary.profileCreationScreen.phoneLabel}
            value={phone}
            onValueChange={setPhone}
          />
          <TextField
            label={dictionary.profileCreationScreen.displayNameLabel}
            placeholder={dictionary.profileCreationScreen.displayNamePlaceholder}
            value={pseudonym}
            onValueChange={setPseudonym}
          />
        </div>
      );
    }

    if (isTrailingStep) {
      return (
        <div className={styles.stepBlock}>
          <div>
            <h2 className={styles.stepTitle}>{dictionary.profileCreationScreen.yourPreferences}</h2>
            <p className={styles.stepLead}>{dictionary.profileCreationScreen.whatLookingFor}</p>
          </div>
          <div>
            <span className={styles.fieldLabel}>{dictionary.profileCreationScreen.interestsHobbies}</span>
            <div className={styles.tagRow}>
              {INTEREST_OPTIONS.map((option) => (
                <Tag key={option} label={option} selected={interests.includes(option)} onClick={() => toggleInterest(option)} />
              ))}
            </div>
          </div>
          <div>
            <span className={styles.fieldLabel}>{dictionary.profileCreationScreen.describeIdealMatch}</span>
            <Textarea
              value={lookingFor}
              onChange={(e) => setLookingFor(e.target.value)}
              placeholder={dictionary.profileCreationScreen.describeIdealMatch}
            />
          </div>
          {submitError ? <p className={styles.stepLead}>{submitError}</p> : null}
        </div>
      );
    }

    const stepTitle = STEP_TITLES[currentStepKey ?? ""];

    return (
      <div className={styles.stepBlock}>
        <div>
          <h2 className={styles.stepTitle}>
            {stepTitle ? (locale === "ar" ? stepTitle.ar : stepTitle.en) : currentStepKey}
          </h2>
        </div>
        {visibleQuestions.map(renderQuestion)}
      </div>
    );
  };

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.progressWrap}>
          <ProgressBar currentStep={step + 1} totalSteps={totalSteps} />
        </div>
        {renderStep()}
        <div className={styles.actions}>
          {step > 0 ? (
            <Button type="button" variant="secondary" className={styles.btnFlex} onClick={() => setStep((s) => s - 1)} disabled={submitting}>
              {dictionary.common.back}
            </Button>
          ) : null}
          <Button type="button" className={styles.btnFlex} onClick={nextStep} disabled={submitting || !canContinue}>
            {isTrailingStep
              ? submitting
                ? dictionary.profileCreationScreen.saving
                : dictionary.profileCreationScreen.completeProfile
              : dictionary.common.continue}
          </Button>
        </div>
      </div>
    </div>
  );
}
