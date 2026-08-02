"use client";

import { Lock } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { respondToQuestionsRequest } from "@/app/dashboard/profile/actions";
import { Button, Card, ProgressBar, Tag } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import { upsertAnswer } from "@/lib/queries/questionnaire";
import { evaluateShowIf } from "@/lib/questionnaire/showIf";
import { createClient } from "@/lib/supabase/client";
import type { QuestionnaireAccessRequest } from "@/lib/queries/questionnaireAccess";
import type { AnswerMap, CompatibilityQuestion } from "@/lib/types/questionnaire";
import styles from "@/styles/features/questionnaire.module.css";

const BUCKET_LABELS: Record<string, { en: string; ar: string }> = {
  religion: { en: "Religion & Practice", ar: "الدين والممارسة" },
  finance: { en: "Finance", ar: "المالية" },
  lifestyle: { en: "Lifestyle", ar: "أسلوب الحياة" },
  family: { en: "Family & Children", ar: "الأسرة والأطفال" },
  personality: { en: "Personality", ar: "الشخصية" },
  general: { en: "More About You", ar: "المزيد عنك" },
};

type Step =
  | { kind: "locked" }
  | { kind: "optionalLocked" }
  | { kind: "questions"; section: "compatibility" | "optional"; bucket: string; questions: CompatibilityQuestion[] };

type Props = {
  userId: string;
  questions: CompatibilityQuestion[];
  initialAnswers: AnswerMap;
  hasMatch: boolean;
  profileFacts: Record<string, string>;
  /** Matches who have asked this user to answer the optional questions. */
  accessRequests: QuestionnaireAccessRequest[];
};

export function QuestionnaireScreen({
  userId,
  questions,
  initialAnswers,
  hasMatch,
  profileFacts,
  accessRequests,
}: Props) {
  const router = useRouter();
  const supabase = createClient();
  const { locale, dictionary } = useTranslation();
  const [answers, setAnswers] = useState<AnswerMap>(initialAnswers);
  const [step, setStep] = useState(0);
  const [requests, setRequests] = useState(accessRequests);
  const [requestPending, setRequestPending] = useState<string | null>(null);

  const pendingRequests = requests.filter((r) => r.status === "pending");
  // The optional bank is per-viewer by design: it opens only once a match has
  // actually asked for it, rather than sitting in front of every user from
  // day one.
  const optionalUnlocked = requests.some((r) => r.status === "pending" || r.status === "approved");

  const answerRequest = async (requestId: string, status: "approved" | "declined") => {
    setRequestPending(requestId);
    const result = await respondToQuestionsRequest(requestId, status);
    setRequestPending(null);
    if (result.success) {
      setRequests((prev) => prev.map((r) => (r.id === requestId ? { ...r, status } : r)));
    }
  };

  const visible = questions.filter((q) => evaluateShowIf(q.showIf, profileFacts));
  const compatQuestions = visible.filter((q) => q.section === "compatibility");
  const optionalQuestions = visible.filter((q) => q.section === "optional");

  const compatBuckets = hasMatch ? Array.from(new Set(compatQuestions.map((q) => q.bucket))) : [];
  const optionalBuckets = optionalUnlocked ? Array.from(new Set(optionalQuestions.map((q) => q.bucket))) : [];

  const steps: Step[] = [
    ...(!hasMatch && compatQuestions.length > 0 ? [{ kind: "locked" as const }] : []),
    ...compatBuckets.map((bucket) => ({
      kind: "questions" as const,
      section: "compatibility" as const,
      bucket,
      questions: compatQuestions.filter((q) => q.bucket === bucket),
    })),
    ...optionalBuckets.map((bucket) => ({
      kind: "questions" as const,
      section: "optional" as const,
      bucket,
      questions: optionalQuestions.filter((q) => q.bucket === bucket),
    })),
    ...(!optionalUnlocked && optionalQuestions.length > 0 ? [{ kind: "optionalLocked" as const }] : []),
  ];

  const isLastStep = step === steps.length - 1;
  const currentStep = steps[step];

  const selectAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    upsertAnswer(supabase, userId, questionId, value).catch((err) => {
      console.error("Failed to save answer", err);
    });
  };

  const handleNext = () => {
    if (isLastStep) {
      router.push("/dashboard");
      router.refresh();
      return;
    }
    setStep((s) => s + 1);
  };

  if (steps.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.inner}>
          <p className={styles.stepLead}>{dictionary.questionnaireScreen.noQuestions}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.progressWrap}>
          <ProgressBar currentStep={step + 1} totalSteps={steps.length} />
        </div>

        {/* Incoming asks sit above the wizard so they are actionable from the
            moment the notification lands, rather than buried behind steps. */}
        {pendingRequests.length > 0 ? (
          <Card className={styles.requestCard}>
            <h3 className={styles.requestTitle}>{dictionary.questionnaireScreen.requestTitle}</h3>
            {pendingRequests.map((request) => (
              <div key={request.id} className={styles.requestRow}>
                <p className={styles.requestName}>
                  {dictionary.questionnaireScreen.requestFrom.replace(
                    "{name}",
                    request.viewerName ?? dictionary.questionnaireScreen.aMatch,
                  )}
                </p>
                <div className={styles.requestActions}>
                  <Button
                    size="md"
                    disabled={requestPending === request.id}
                    onClick={() => void answerRequest(request.id, "approved")}
                  >
                    {dictionary.questionnaireScreen.requestApprove}
                  </Button>
                  <Button
                    size="md"
                    variant="outline"
                    disabled={requestPending === request.id}
                    onClick={() => void answerRequest(request.id, "declined")}
                  >
                    {dictionary.questionnaireScreen.requestDecline}
                  </Button>
                </div>
              </div>
            ))}
          </Card>
        ) : null}

        {currentStep.kind === "locked" ? (
          <div className={styles.questionList}>
            <Lock size={32} aria-hidden />
            <h2 className={styles.stepTitle}>{dictionary.questionnaireScreen.lockedTitle}</h2>
            <p className={styles.stepLead}>{dictionary.questionnaireScreen.lockedBody}</p>
          </div>
        ) : currentStep.kind === "optionalLocked" ? (
          <div className={styles.questionList}>
            <Lock size={32} aria-hidden />
            <h2 className={styles.stepTitle}>{dictionary.questionnaireScreen.optionalLockedTitle}</h2>
            <p className={styles.stepLead}>{dictionary.questionnaireScreen.optionalLockedBody}</p>
          </div>
        ) : (
          <>
            <h2 className={styles.stepTitle}>
              {(locale === "ar" ? BUCKET_LABELS[currentStep.bucket]?.ar : BUCKET_LABELS[currentStep.bucket]?.en) ??
                currentStep.bucket}
            </h2>
            <p className={styles.stepLead}>
              {currentStep.section === "optional"
                ? dictionary.questionnaireScreen.optionalHint
                : dictionary.questionnaireScreen.answerHonestly}
            </p>

            <div className={styles.questionList}>
              {currentStep.questions.map((question) => (
                <div key={question.id} className={styles.questionBlock}>
                  <span className={styles.fieldLabel}>
                    {(locale === "ar" && question.promptAr) || question.promptEn}
                  </span>
                  <div className={styles.tagRow}>
                    {question.options.map((option) => (
                      <Tag
                        key={option.value}
                        label={(locale === "ar" && option.label_ar) || option.label_en}
                        selected={answers[question.id] === option.value}
                        onClick={() => selectAnswer(question.id, option.value)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className={styles.actions}>
          {step > 0 ? (
            <Button variant="secondary" className={styles.btnFlex} onClick={() => setStep((s) => s - 1)}>
              {dictionary.questionnaireScreen.back}
            </Button>
          ) : null}
          <Button className={styles.btnFlex} onClick={handleNext}>
            {isLastStep
              ? dictionary.questionnaireScreen.finish
              : currentStep.kind === "questions" && currentStep.section === "optional"
                ? dictionary.questionnaireScreen.skipContinue
                : dictionary.questionnaireScreen.continue}
          </Button>
        </div>
      </div>
    </div>
  );
}
