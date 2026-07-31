"use client";

import { useState } from "react";
import { CheckCircle, MessageSquare, UserCheck, Users } from "lucide-react";
import { Button, Card, ProgressBar } from "@/components/ui";
import { PROPOSAL_APPROACH_OPTIONS, type ProposalApproachId } from "@/lib/content/proposal-flow";
import { cn } from "@/lib/cn";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import styles from "@/styles/features/proposal-flow.module.css";
import { submitProposal } from "@/app/dashboard/proposal/actions";

const icons = {
  self: UserCheck,
  wali: Users,
  mediator: MessageSquare,
} as const;

type Props = {
  matchId: string;
};

export function ProposalFlowScreen({ matchId }: Props) {
  const { dictionary } = useTranslation();
  const APPROACH_TEXT: Record<ProposalApproachId, { title: string; description: string }> = {
    self: { title: dictionary.proposal.approachSelf, description: dictionary.proposal.approachSelfDesc },
    wali: { title: dictionary.proposal.approachWali, description: dictionary.proposal.approachWaliDesc },
    mediator: { title: dictionary.proposal.approachMediator, description: dictionary.proposal.approachMediatorDesc },
  };
  const [step, setStep] = useState(1);
  const [selectedApproach, setSelectedApproach] = useState<ProposalApproachId | null>(null);
  const [waliInfo, setWaliInfo] = useState({ name: "", relation: "", phone: "", email: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>();

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(undefined);
    try {
      const result = await submitProposal({
        matchId,
        approach: selectedApproach ?? "self",
        waliName: waliInfo.name,
        waliRelation: waliInfo.relation,
        waliPhone: waliInfo.phone,
        waliEmail: waliInfo.email,
      });
      if (!result.success) {
        setSubmitError(result.error);
        return;
      }
      setStep(3);
    } catch {
      setSubmitError(dictionary.auth.genericError);
    } finally {
      setSubmitting(false);
    }
  };

  const handleContinue = () => {
    if (step === 2) {
      void handleSubmit();
      return;
    }
    setStep(step + 1);
  };

  const content =
    step === 1 ? (
      <>
        <div className={styles.center}>
          <h2 className={styles.stepTitle}>{dictionary.proposal.chooseApproach}</h2>
          <p className={styles.stepSub}>{dictionary.proposal.howProceed}</p>
        </div>
        <div className={styles.optionList}>
          {PROPOSAL_APPROACH_OPTIONS.map((option) => {
            const Icon = icons[option.id];
            const selected = selectedApproach === option.id;
            const text = APPROACH_TEXT[option.id];
            return (
              <Card
                key={option.id}
                onClick={() => setSelectedApproach(option.id)}
                className={cn(styles.optionCard, selected && styles.optionSelected)}
              >
                <div className={styles.optionRow}>
                  <div className={cn(styles.iconCircle, selected && styles.iconCircleOn)}>
                    <Icon size={24} aria-hidden />
                  </div>
                  <div className={styles.optionBody}>
                    <h3 className={styles.optionHeading}>{text.title}</h3>
                    <p className={styles.optionDesc}>{text.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </>
    ) : step === 2 ? (
      <>
        <div className={styles.center}>
          <h2 className={styles.stepTitle}>{dictionary.proposal.waliInfoTitle}</h2>
          <p className={styles.stepSub}>{dictionary.proposal.provideDetails}</p>
        </div>
        <div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="wali-name">
              {dictionary.proposal.fullName}
            </label>
            <input
              id="wali-name"
              className={styles.control}
              value={waliInfo.name}
              onChange={(e) => setWaliInfo({ ...waliInfo, name: e.target.value })}
              placeholder={dictionary.proposal.fullName}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="wali-relation">
              {dictionary.proposal.relation}
            </label>
            <select
              id="wali-relation"
              className={styles.control}
              value={waliInfo.relation}
              onChange={(e) => setWaliInfo({ ...waliInfo, relation: e.target.value })}
            >
              <option value="">{dictionary.proposal.selectRelation}</option>
              <option value="father">{dictionary.family.relationFather}</option>
              <option value="brother">{dictionary.family.relationBrother}</option>
              <option value="uncle">{dictionary.family.relationUncle}</option>
              <option value="grandfather">{dictionary.family.relationGrandfather}</option>
              <option value="other">{dictionary.family.relationOther}</option>
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="wali-phone">
              {dictionary.proposal.phoneNumber}
            </label>
            <input
              id="wali-phone"
              type="tel"
              className={styles.control}
              value={waliInfo.phone}
              onChange={(e) => setWaliInfo({ ...waliInfo, phone: e.target.value })}
              placeholder={dictionary.proposal.phoneNumber}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="wali-email">
              {dictionary.proposal.emailAddress}
            </label>
            <input
              id="wali-email"
              type="email"
              className={styles.control}
              value={waliInfo.email}
              onChange={(e) => setWaliInfo({ ...waliInfo, email: e.target.value })}
              placeholder={dictionary.proposal.emailAddress}
            />
          </div>
          {submitError ? <p className={styles.stepSub} style={{ color: "#d9364a" }}>{submitError}</p> : null}
        </div>
      </>
    ) : (
      <div className={styles.successWrap}>
        <div className={styles.successIcon}>
          <CheckCircle size={48} aria-hidden />
        </div>
        <h2 className={styles.successTitle}>{dictionary.proposal.requestSubmitted}</h2>
        <p className={styles.successBody}>{dictionary.proposal.sentByEmail}</p>
        <div style={{ maxWidth: "28rem", margin: "0 auto" }}>
          <Card variant="info" className={styles.nextCard}>
            <h4 className={styles.nextTitle}>{dictionary.proposal.whatNext}</h4>
            <ol className={styles.nextList}>
              <li>{dictionary.proposal.nextStep1}</li>
              <li>{dictionary.proposal.nextStep2}</li>
              <li>{dictionary.proposal.nextStep3}</li>
            </ol>
          </Card>
        </div>
      </div>
    );

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        {step < 3 ? (
          <div className={styles.progressWrap}>
            <ProgressBar currentStep={step} totalSteps={3} />
          </div>
        ) : null}
        {content}
        {step < 3 ? (
          <div className={styles.actions}>
            {step > 1 ? (
              <Button
                variant="secondary"
                className={styles.actionBtn}
                onClick={() => setStep(step - 1)}
                disabled={submitting}
              >
                {dictionary.common.back}
              </Button>
            ) : null}
            <Button
              className={styles.actionBtn}
              disabled={(step === 1 && !selectedApproach) || submitting}
              onClick={handleContinue}
            >
              {step === 2
                ? submitting
                  ? dictionary.proposal.submitting
                  : dictionary.proposal.submitRequest
                : dictionary.common.continue}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
