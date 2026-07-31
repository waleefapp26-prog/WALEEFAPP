export type QuestionOption = {
  value: string;
  label_en: string;
  label_ar?: string;
};

export type ShowIf = {
  depends_on: string;
  operator: "equals" | "not_equals";
  value: string;
};

export type CompatibilityQuestion = {
  id: string;
  slug: string;
  bucket: string;
  section: "compatibility" | "optional";
  promptEn: string;
  promptAr: string | null;
  options: QuestionOption[];
  orderIndex: number;
  showIf: ShowIf | null;
};

export type AnswerMap = Record<string, string>; // questionId -> selected value

export type OnboardingQuestion = {
  id: string;
  slug: string;
  stepKey: string;
  type: "date" | "select" | "text" | "number";
  required: boolean;
  promptEn: string;
  promptAr: string | null;
  options: QuestionOption[];
  orderIndex: number;
  showIf: ShowIf | null;
};
