import type { SurveyInstrument, SurveyOption } from "@/lib/types";

const yesNo: SurveyOption[] = [
  { value: "Sí", label: "Sí" },
  { value: "No", label: "No" },
];

export const surveyInstrument: SurveyInstrument = {
  id: "crece-taller-mlc-interes",
  version: "2026-10-v1",
  title: "Taller de Monitoreo Liderado por la Comunidad",
  description:
    "Este formulario registra el interés y la disponibilidad de líderes y lideresas de organizaciones de base comunitaria para participar en el taller.",
  confirmation: "Su manifestación de interés fue registrada",
  sections: [
    {
      id: "persona",
      title: "Datos de la persona y su organización",
      shortTitle: "Persona y OBC",
      description:
        "El taller contará con una persona participante por organización de base comunitaria.",
      questions: [
        {
          id: "nombre_completo_social",
          type: "text",
          prompt: "Nombre completo o nombre social y apellidos",
          required: true,
          maxLength: 200,
          placeholder: "Escriba el nombre con el que desea ser identificadx",
        },
        {
          id: "numero_celular",
          type: "text",
          prompt: "Número de celular",
          helper: "Utilizaremos este número para comunicar el resultado de la selección.",
          required: true,
          inputMode: "tel",
          maxLength: 9,
          placeholder: "Ejemplo: 987654321",
          validate: (value) =>
            typeof value === "string" && /^9\d{8}$/.test(value)
              ? null
              : "Ingrese un número de celular peruano válido de 9 dígitos, empezando con 9.",
        },
        {
          id: "correo_electronico",
          type: "text",
          prompt: "Correo electrónico",
          required: true,
          inputMode: "email",
          maxLength: 254,
          placeholder: "nombre@correo.com",
          validate: (value) =>
            typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
              ? null
              : "Ingrese un correo electrónico válido.",
        },
        {
          id: "cargo_obc",
          type: "text",
          prompt: "Cargo o función dentro de su OBC",
          required: true,
          maxLength: 180,
          placeholder: "Ejemplo: coordinadorx, promotorx o integrantx",
        },
        {
          id: "nombre_obc",
          type: "text",
          prompt: "Nombre de su organización de base comunitaria (OBC)",
          required: true,
          maxLength: 220,
          placeholder: "Escriba el nombre completo de la organización",
        },
      ],
    },
    {
      id: "experiencia",
      title: "Experiencia e interés en MLC",
      shortTitle: "Experiencia",
      description:
        "La información permitirá conocer el punto de partida de las organizaciones interesadas.",
      questions: [
        {
          id: "plan_incluye_mlc",
          type: "single",
          prompt: "¿El plan de trabajo de su OBC incluye acciones de Monitoreo Liderado por la Comunidad (MLC)?",
          required: true,
          options: yesNo,
        },
        {
          id: "interes_capacitacion",
          type: "single",
          prompt: "¿Su OBC está interesada en recibir capacitación sobre MLC?",
          required: true,
          options: yesNo,
        },
        {
          id: "capacitacion_previa",
          type: "single",
          prompt: "¿Su OBC ha recibido previamente capacitación sobre MLC por parte de otra organización?",
          required: true,
          options: yesNo,
        },
        {
          id: "organizacion_capacitadora",
          type: "multiple",
          prompt: "¿Qué organización brindó la capacitación?",
          helper: "Puede marcar más de una opción.",
          required: true,
          showWhen: (answers) => answers.capacitacion_previa === "Sí",
          options: [
            { value: "Socios en Salud", label: "Socios en Salud" },
            { value: "Universidad Peruana Cayetano Heredia", label: "Universidad Peruana Cayetano Heredia" },
            { value: "Otro", label: "Otra organización", hasTextInput: true },
          ],
        },
        {
          id: "aprendizaje_previo",
          type: "textarea",
          prompt: "¿Qué contenidos o herramientas de MLC conoce o ha aplicado su OBC?",
          required: false,
          maxLength: 1200,
          placeholder: "Describa brevemente la experiencia previa de la organización",
          showWhen: (answers) => answers.capacitacion_previa === "Sí" || answers.plan_incluye_mlc === "Sí",
        },
      ],
    },
    {
      id: "disponibilidad",
      title: "Disponibilidad y aplicación",
      shortTitle: "Disponibilidad",
      description:
        "El taller combina sesiones virtuales y presenciales. La participación requiere asistir a las cinco jornadas.",
      questions: [
        {
          id: "disponibilidad_cinco_jornadas",
          type: "single",
          prompt: "¿Cuenta con disponibilidad para asistir a las cinco jornadas del taller?",
          helper: "Revise las fechas y horarios antes de responder.",
          required: true,
          options: yesNo,
        },
        {
          id: "restriccion_disponibilidad",
          type: "textarea",
          prompt: "Indique qué jornada no podría atender o qué restricción tendría",
          required: true,
          maxLength: 800,
          placeholder: "Precise la fecha y la dificultad",
          showWhen: (answers) => answers.disponibilidad_cinco_jornadas === "No",
        },
        {
          id: "plan_accion_seis_meses",
          type: "textarea",
          prompt: "¿Cuál es el plan de acción de su OBC en materia de MLC para los próximos seis meses?",
          helper: "Describa las acciones previstas, la población involucrada y el resultado que espera alcanzar.",
          required: true,
          maxLength: 2400,
          placeholder: "Describa brevemente el plan de acción",
        },
        {
          id: "aplicacion_aprendizajes",
          type: "textarea",
          prompt: "¿Cómo aplicaría o compartiría en su OBC lo aprendido durante el taller?",
          required: true,
          maxLength: 1600,
          placeholder: "Describa una acción concreta de aplicación o réplica",
        },
        {
          id: "ajuste_accesibilidad",
          type: "textarea",
          prompt: "¿Requiere algún ajuste de accesibilidad o apoyo para participar?",
          required: false,
          maxLength: 800,
          placeholder: "Indíquelo para que podamos considerarlo",
        },
      ],
    },
  ],
};
