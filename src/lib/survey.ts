import type { Answers, SurveyQuestion } from "@/lib/types";

export function isQuestionVisible(question: SurveyQuestion, answers: Answers) {
  return question.showWhen ? question.showWhen(answers) : true;
}

function hasOtherDetail(question: SurveyQuestion, answers: Answers, selectedValues: string[]) {
  const otherSelected = question.options?.some(
    (option) => option.hasTextInput && selectedValues.includes(option.value),
  );
  if (!otherSelected) return true;
  const detail = answers[`${question.id}__otro`];
  return typeof detail === "string" && detail.trim().length > 0;
}

export function isQuestionAnswered(question: SurveyQuestion, answers: Answers) {
  const value = answers[question.id];

  if (question.type === "multiple") {
    if (!Array.isArray(value) || value.length === 0) return false;
    return hasOtherDetail(question, answers, value);
  }

  if (typeof value !== "string" || value.trim() === "") return false;
  return hasOtherDetail(question, answers, [value]);
}

export function questionError(question: SurveyQuestion, answers: Answers) {
  const answered = isQuestionAnswered(question, answers);
  if (question.required && !answered) {
    if (question.type === "multiple") return "Seleccione al menos una opción.";
    return "Esta pregunta es obligatoria.";
  }
  if (answered && question.validate) return question.validate(answers[question.id]);
  return null;
}

export function cleanVisibleAnswers(answers: Answers, questions: SurveyQuestion[]) {
  const visibleIds = new Set(
    questions.filter((question) => isQuestionVisible(question, answers)).map((question) => question.id),
  );
  return Object.fromEntries(
    Object.entries(answers).filter(([key]) => visibleIds.has(key.replace(/__otro$/, ""))),
  );
}

export function answerForDisplay(question: SurveyQuestion, answers: Answers) {
  const value = answers[question.id];
  if (question.type === "multiple" && Array.isArray(value)) {
    const detail = answers[`${question.id}__otro`];
    return value
      .map((item) => (item === "Otro" && typeof detail === "string" ? detail : item))
      .join("; ");
  }
  if (typeof value !== "string" || !value) return "Sin respuesta";
  const detail = answers[`${question.id}__otro`];
  return value === "Otro" && typeof detail === "string" ? detail : value;
}
