"use client";

import Image from "next/image";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Download,
  LockKeyhole,
  Pencil,
  RotateCcw,
  Share2,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { surveyInstrument } from "@/lib/instrument";
import { exportCrecePdf } from "@/lib/export-review-pdf";
import {
  answerForDisplay,
  cleanVisibleAnswers,
  isQuestionAnswered,
  isQuestionVisible,
  questionError,
} from "@/lib/survey";
import type { AnswerValue, Answers, SurveyQuestion } from "@/lib/types";

const DRAFT_KEY = "crece-taller-mlc-draft-v1";
const CONTACT_FIELDS = new Set([
  "nombre_completo_social",
  "numero_celular",
  "correo_electronico",
]);

type View = "intro" | "survey" | "review" | "submitted";

function QuestionControl({
  question,
  answers,
  onChange,
  invalid,
}: {
  question: SurveyQuestion;
  answers: Answers;
  onChange: (key: string, value: AnswerValue) => void;
  invalid: boolean;
}) {
  const value = answers[question.id];
  const describedBy = invalid ? `${question.id}-error` : undefined;

  if (question.type === "text" || question.type === "textarea") {
    const shared = {
      id: question.id,
      className: "text-input",
      value: typeof value === "string" ? value : "",
      placeholder: question.placeholder,
      inputMode: question.inputMode,
      "aria-invalid": invalid,
      "aria-describedby": describedBy,
      maxLength: question.maxLength,
      onChange: (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      ) => {
        const nextValue =
          question.inputMode === "tel"
            ? event.target.value.replace(/\D/g, "").slice(0, question.maxLength)
            : event.target.value;
        onChange(question.id, nextValue);
      },
    };
    return question.type === "textarea" ? (
      <textarea {...shared} rows={4} />
    ) : (
      <input
        {...shared}
        type={question.inputMode === "email" ? "email" : "text"}
      />
    );
  }

  const isMultiple = question.type === "multiple";
  const selectedValues = Array.isArray(value) ? value : [];
  return (
    <div
      className="option-grid"
      role={isMultiple ? "group" : "radiogroup"}
      aria-describedby={describedBy}
    >
      {question.options?.map((option) => {
        const selected = isMultiple
          ? selectedValues.includes(option.value)
          : value === option.value;
        const otherValue = answers[`${question.id}__otro`];
        return (
          <div className="option-wrap" key={option.value}>
            <label
              className={`option ${isMultiple ? "checkbox-option" : ""} ${selected ? "selected" : ""}`}
            >
              <input
                type={isMultiple ? "checkbox" : "radio"}
                name={question.id}
                value={option.value}
                checked={selected}
                onChange={() => {
                  if (!isMultiple) {
                    onChange(question.id, option.value);
                    return;
                  }
                  let next = selected
                    ? selectedValues.filter((item) => item !== option.value)
                    : [...selectedValues, option.value];
                  if (option.value === "Prefiero no responder" && !selected) {
                    next = [option.value];
                  } else if (option.value !== "Prefiero no responder") {
                    next = next.filter(
                      (item) => item !== "Prefiero no responder",
                    );
                  }
                  onChange(question.id, next);
                }}
              />
              <span className="radio-mark" aria-hidden="true" />
              <span>{option.label}</span>
            </label>
            {selected && option.hasTextInput ? (
              <input
                className="text-input other-input"
                type="text"
                value={typeof otherValue === "string" ? otherValue : ""}
                placeholder="Especifique"
                aria-label={`Especifique la respuesta para ${question.prompt}`}
                onChange={(event) =>
                  onChange(`${question.id}__otro`, event.target.value)
                }
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function Header() {
  return (
    <header className="site-header">
      <div className="header-copy">
        <p className="eyebrow">PROYECTO CRECE · CONVOCATORIA</p>
        <h1>Taller de Monitoreo Liderado por la Comunidad</h1>
        <p className="header-lead">
          Manifestación de interés para líderes y lideresas de organizaciones de
          base comunitaria.
        </p>
      </div>
      <div
        className="brand-lockup"
        aria-label="ONUSIDA Perú, Proyecto CRECE y Canadá"
      >
        <Image
          className="onusida-logo"
          src="/assets/logo-onusida-es-color.png"
          width={255}
          height={42}
          priority
          alt="ONUSIDA"
        />
        <Image
          className="crece-logo"
          src="/assets/logo-crece.png"
          width={215}
          height={218}
          priority
          alt="Proyecto CRECE"
        />
        <div className="canada-logo-frame">
          <Image
            className="canada-logo"
            src="/assets/logo-canada.png"
            width={1890}
            height={1417}
            priority
            alt="Canadá"
          />
        </div>
      </div>
    </header>
  );
}

export default function QuestionnaireApp() {
  const [view, setView] = useState<View>("intro");
  const [sectionIndex, setSectionIndex] = useState(0);
  const [consented, setConsented] = useState(false);
  const [answers, setAnswers] = useState<Answers>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [previewSubmission, setPreviewSubmission] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const allQuestions = useMemo(
    () => surveyInstrument.sections.flatMap((section) => section.questions),
    [],
  );
  const currentSection = surveyInstrument.sections[sectionIndex];
  const visibleQuestions = currentSection.questions.filter((question) =>
    isQuestionVisible(question, answers),
  );
  const overallVisibleQuestions = allQuestions.filter((question) =>
    isQuestionVisible(question, answers),
  );
  const answeredCount = overallVisibleQuestions.filter((question) =>
    isQuestionAnswered(question, answers),
  ).length;
  const progress =
    Math.round((answeredCount / overallVisibleQuestions.length) * 100) || 0;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const rawDraft = window.localStorage.getItem(DRAFT_KEY);
      if (!rawDraft) return;
      try {
        const draft = JSON.parse(rawDraft) as {
          answers?: Answers;
          sectionIndex?: number;
          consented?: boolean;
        };
        if (draft.answers) setAnswers(draft.answers);
        if (typeof draft.sectionIndex === "number") {
          setSectionIndex(
            Math.min(draft.sectionIndex, surveyInstrument.sections.length - 1),
          );
        }
        if (draft.consented) setConsented(true);
      } catch {
        window.localStorage.removeItem(DRAFT_KEY);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!consented || view === "submitted") return;
    window.localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ answers, sectionIndex, consented }),
    );
  }, [answers, consented, sectionIndex, view]);

  function updateAnswer(key: string, value: AnswerValue) {
    setAnswers((current) => ({ ...current, [key]: value }));
    setTouched((current) => {
      const next = new Set(current);
      next.delete(key.replace(/__otro$/, ""));
      return next;
    });
  }

  function moveToTop() {
    requestAnimationFrame(() =>
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  }

  function continueSection() {
    const invalid = visibleQuestions.filter((question) =>
      questionError(question, answers),
    );
    if (invalid.length > 0) {
      setTouched(
        (current) =>
          new Set([...current, ...invalid.map((question) => question.id)]),
      );
      requestAnimationFrame(() =>
        document.querySelector<HTMLElement>(".question.has-error")?.focus(),
      );
      return;
    }
    if (sectionIndex === surveyInstrument.sections.length - 1)
      setView("review");
    else setSectionIndex((current) => current + 1);
    moveToTop();
  }

  function previousSection() {
    if (sectionIndex === 0) setView("intro");
    else setSectionIndex((current) => current - 1);
    moveToTop();
  }

  function editSection(index: number) {
    setSectionIndex(index);
    setView("survey");
    moveToTop();
  }

  async function downloadPdf() {
    await exportCrecePdf({
      title: surveyInstrument.title,
      subtitle: "Manifestación de interés · Vista previa antes del envío",
      fileName: "manifestacion-interes-taller-mlc-crece",
      metadata: [
        { label: "Fechas", value: "17 al 21 de noviembre de 2026" },
        {
          label: "Modalidad",
          value: "Dos jornadas virtuales y tres presenciales",
        },
      ],
      sections: surveyInstrument.sections.map((section) => ({
        title: section.title,
        rows: section.questions
          .filter((question) => isQuestionVisible(question, answers))
          .map((question) => ({
            label: question.prompt,
            value: answerForDisplay(question, answers),
          })),
      })),
    });
  }

  async function submitSurvey() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const cleaned = cleanVisibleAnswers(answers, allQuestions);
      const contact = {
        preferredName: String(cleaned.nombre_completo_social ?? ""),
        phone: String(cleaned.numero_celular ?? ""),
        email: String(cleaned.correo_electronico ?? ""),
      };
      const analyticalAnswers = Object.fromEntries(
        Object.entries(cleaned).filter(([key]) => !CONTACT_FIELDS.has(key)),
      );

      const response = await fetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instrumentId: surveyInstrument.id,
          instrumentVersion: surveyInstrument.version,
          consented: true,
          context: { campaign: "taller-mlc-noviembre-2026" },
          answers: analyticalAnswers,
          contact,
        }),
      });
      const responseText = await response.text();
      let payload: {
        error?: string;
        preview?: boolean;
        submissionId?: string;
      } = {};
      try {
        payload = responseText ? JSON.parse(responseText) : {};
      } catch {
        payload = {};
      }
      if (!response.ok || !payload.submissionId) {
        throw new Error("No se pudo registrar la respuesta.");
      }
      setPreviewSubmission(Boolean(payload.preview));
      setSubmissionId(payload.submissionId ?? null);
      setView("submitted");
      window.localStorage.removeItem(DRAFT_KEY);
      moveToTop();
    } catch (error) {
      console.error("Unable to submit MLC workshop application", error);
      setSubmitError(
        "No pudimos registrar su respuesta. Sus respuestas siguen en pantalla; intente nuevamente en unos minutos.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function resetSurvey() {
    window.localStorage.removeItem(DRAFT_KEY);
    setAnswers({});
    setTouched(new Set());
    setConsented(false);
    setSectionIndex(0);
    setSubmissionId(null);
    setPreviewSubmission(false);
    setView("intro");
    moveToTop();
  }

  return (
    <main className="page-shell">
      <div ref={topRef} />
      <Header />

      {view === "intro" ? (
        <section className="intro-layout" aria-labelledby="intro-title">
          <div className="intro-copy">
            <p className="section-kicker">
              Manifestación de interés · 5 a 7 minutos
            </p>
            <h2 id="intro-title">Taller práctico de MLC</h2>
            <p>{surveyInstrument.description}</p>
            <div className="activity-context schedule-card">
              <strong>Fechas y horarios</strong>
              <span>
                <b>Martes 17:</b> 5:00 a 8:00 p. m. · virtual
              </span>
              <span>
                <b>Miércoles 18:</b> 5:00 a 8:00 p. m. · virtual
              </span>
              <span>
                <b>Jueves 19:</b> 4:00 a 9:00 p. m. · presencial
              </span>
              <span>
                <b>Viernes 20:</b> 4:00 a 9:00 p. m. · presencial
              </span>
              <span>
                <b>Sábado 21:</b> 10:00 a. m. a 7:00 p. m. · presencial
              </span>
              <small>Noviembre de 2026</small>
            </div>
          </div>
          <div className="privacy-panel">
            <ShieldCheck aria-hidden="true" />
            <h3>Participación voluntaria</h3>
            <p>
              Sus respuestas serán utilizadas por ONUSIDA Perú y el proyecto
              CRECE para organizar el taller y, si las postulaciones superan los
              30 cupos, realizar la selección. Se admitirá una persona por OBC.
              El envío del formulario no confirma una vacante; el equipo
              comunicará el resultado a cada postulante.
            </p>
            <label className="consent-check">
              <input
                type="checkbox"
                checked={consented}
                onChange={(event) => setConsented(event.target.checked)}
              />
              <span>He leído la información y acepto participar.</span>
            </label>
            <button
              className="button primary wide"
              type="button"
              disabled={!consented}
              onClick={() => {
                setView("survey");
                moveToTop();
              }}
            >
              Comenzar <ArrowRight aria-hidden="true" />
            </button>
          </div>
        </section>
      ) : null}

      {view === "survey" ? (
        <div className="survey-layout">
          <aside className="stepper" aria-label="Secciones del cuestionario">
            <div className="progress-copy">
              <span>Avance</span>
              <strong>{progress}%</strong>
            </div>
            <div className="progress-track" aria-hidden="true">
              <span style={{ width: `${progress}%` }} />
            </div>
            <ol>
              {surveyInstrument.sections.map((section, index) => (
                <li
                  className={
                    index === sectionIndex
                      ? "active"
                      : index < sectionIndex
                        ? "done"
                        : ""
                  }
                  key={section.id}
                >
                  <span className="step-number">
                    {index < sectionIndex ? (
                      <Check aria-hidden="true" />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <span>{section.shortTitle}</span>
                </li>
              ))}
            </ol>
            <p className="draft-note">
              <LockKeyhole aria-hidden="true" /> El avance se conserva en este
              navegador hasta que envíe el formulario.
            </p>
          </aside>

          <section className="form-panel" aria-labelledby="section-title">
            <div className="form-heading">
              <p className="section-kicker">
                Sección {sectionIndex + 1} de {surveyInstrument.sections.length}
              </p>
              <h2 id="section-title">{currentSection.title}</h2>
              <p>{currentSection.description}</p>
              <p className="required-note">
                <span aria-hidden="true">*</span> Pregunta obligatoria
              </p>
            </div>
            <div className="question-list">
              {visibleQuestions.map((question, index) => {
                const error = touched.has(question.id)
                  ? questionError(question, answers)
                  : null;
                return (
                  <div
                    className={`question ${error ? "has-error" : ""}`}
                    key={question.id}
                    tabIndex={error ? -1 : undefined}
                  >
                    <div className="question-heading">
                      <span className="question-index">{index + 1}</span>
                      <div>
                        <label
                          htmlFor={
                            question.type === "text" ||
                            question.type === "textarea"
                              ? question.id
                              : undefined
                          }
                        >
                          {question.prompt}{" "}
                          {question.required ? (
                            <span className="required-mark">*</span>
                          ) : null}
                        </label>
                        {question.helper ? <p>{question.helper}</p> : null}
                      </div>
                    </div>
                    <QuestionControl
                      question={question}
                      answers={answers}
                      onChange={updateAnswer}
                      invalid={Boolean(error)}
                    />
                    {error ? (
                      <p className="field-error" id={`${question.id}-error`}>
                        <AlertCircle aria-hidden="true" /> {error}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
            <div className="form-actions">
              <button
                className="button secondary"
                type="button"
                onClick={previousSection}
              >
                <ArrowLeft aria-hidden="true" /> Atrás
              </button>
              <button
                className="button primary"
                type="button"
                onClick={continueSection}
              >
                {sectionIndex === surveyInstrument.sections.length - 1
                  ? "Revisar respuestas"
                  : "Continuar"}
                <ArrowRight aria-hidden="true" />
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {view === "review" ? (
        <section className="review-panel" aria-labelledby="review-title">
          <div className="review-heading">
            <ClipboardCheck aria-hidden="true" />
            <div>
              <p className="section-kicker">Último paso</p>
              <h2 id="review-title">Revise sus respuestas</h2>
              <p>
                Puede volver a cualquier sección antes de enviar el formulario.
              </p>
            </div>
          </div>
          <div className="review-sections">
            {surveyInstrument.sections.map((section, index) => (
              <section className="review-section" key={section.id}>
                <div className="review-section-head">
                  <h3>{section.title}</h3>
                  <button
                    className="icon-text-button"
                    type="button"
                    onClick={() => editSection(index)}
                  >
                    <Pencil aria-hidden="true" /> Editar
                  </button>
                </div>
                <dl>
                  {section.questions
                    .filter((question) => isQuestionVisible(question, answers))
                    .map((question) => (
                      <div key={question.id}>
                        <dt>{question.prompt}</dt>
                        <dd>{answerForDisplay(question, answers)}</dd>
                      </div>
                    ))}
                </dl>
              </section>
            ))}
          </div>
          {submitError ? (
            <p className="submit-error">
              <AlertCircle aria-hidden="true" /> {submitError}
            </p>
          ) : null}
          <div className="form-actions">
            <button
              className="button secondary"
              type="button"
              onClick={() => editSection(surveyInstrument.sections.length - 1)}
            >
              <ArrowLeft aria-hidden="true" /> Atrás
            </button>
            <button
              className="button secondary"
              type="button"
              onClick={downloadPdf}
            >
              <Download aria-hidden="true" /> Descargar PDF
            </button>
            <button
              className="button primary"
              type="button"
              disabled={submitting}
              onClick={submitSurvey}
            >
              {submitting ? "Enviando..." : "Enviar postulación"}{" "}
              <Check aria-hidden="true" />
            </button>
          </div>
        </section>
      ) : null}

      {view === "submitted" ? (
        <section className="success-panel" aria-labelledby="success-title">
          <CheckCircle2 aria-hidden="true" />
          <p className="section-kicker">Formulario completado</p>
          <h2 id="success-title">{surveyInstrument.confirmation}</h2>
          {previewSubmission ? (
            <p className="preview-message">
              Esta es una versión de demostración. La respuesta no fue enviada a
              una base de datos.
            </p>
          ) : (
            <p>
              La información fue registrada correctamente. El equipo comunicará
              posteriormente el resultado del proceso de selección.
            </p>
          )}
          {submissionId ? (
            <small>Referencia: {submissionId.slice(0, 8).toUpperCase()}</small>
          ) : null}
          <div className="success-actions">
            <button
              className="button secondary"
              type="button"
              onClick={resetSurvey}
            >
              <RotateCcw aria-hidden="true" /> Registrar otra respuesta
            </button>
            <a
              className="button primary"
              href="https://portal-herramientas-crece.vercel.app/"
            >
              <Share2 aria-hidden="true" /> Ver herramientas CRECE
            </a>
          </div>
        </section>
      ) : null}

      <footer className="site-footer">
        <span>Proyecto CRECE</span>
        <span>Monitoreo y Evaluación</span>
      </footer>
    </main>
  );
}
