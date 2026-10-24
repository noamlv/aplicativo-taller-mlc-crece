export type AnswerValue = string | string[];
export type Answers = Record<string, AnswerValue>;

export type SurveyOption = {
  value: string;
  label: string;
  hasTextInput?: boolean;
};

export type SurveyQuestion = {
  id: string;
  type: "text" | "textarea" | "single" | "multiple";
  prompt: string;
  helper?: string;
  placeholder?: string;
  required: boolean;
  options?: SurveyOption[];
  inputMode?: "text" | "email" | "tel" | "numeric";
  maxLength?: number;
  validate?: (value: AnswerValue) => string | null;
  showWhen?: (answers: Answers) => boolean;
};

export type SurveySection = {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  questions: SurveyQuestion[];
};

export type SurveyInstrument = {
  id: "crece-taller-mlc-interes";
  version: string;
  title: string;
  description: string;
  confirmation: string;
  sections: SurveySection[];
};
