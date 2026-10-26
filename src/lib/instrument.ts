import type { SurveyInstrument, SurveyOption } from "@/lib/types";

const yesNo: SurveyOption[] = [
  { value: "Sí", label: "Sí" },
  { value: "No", label: "No" },
];

export const surveyInstrument: SurveyInstrument = {
  id: "crece-taller-mlc-interes",
  version: "2026-10-v4",
  title: "Taller de Monitoreo Liderado por la Comunidad",
  description:
    "Este es un formulario para evaluar el interés en participar en un taller teórico-práctico de MLC con enfoque de género y derechos, que se llevará a cabo entre el 17 y el 21 de noviembre en Lima. El formulario le tomará entre 5 y 7 minutos y estará activo hasta el domingo 1 de noviembre a las 11:59 p. m.",
  confirmation: "Su solicitud de expresión de interés fue registrada",
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
          id: "dni",
          type: "text",
          prompt: "Número de DNI",
          helper: "Si cuenta con DNI peruano, escriba sus ocho dígitos.",
          required: false,
          inputMode: "numeric",
          maxLength: 8,
          placeholder: "Ejemplo: 12345678",
          validate: (value) =>
            typeof value === "string" && /^\d{8}$/.test(value)
              ? null
              : "El DNI debe tener ocho dígitos.",
        },
        {
          id: "numero_celular",
          type: "text",
          prompt: "Número de celular",
          helper:
            "Podremos comunicarnos con usted si necesitamos precisar algún dato de su postulación.",
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
            typeof value === "string" &&
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
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
        {
          id: "territorio_obc",
          type: "text",
          prompt: "¿En qué territorio se encuentra su OBC?",
          required: true,
          maxLength: 160,
          placeholder: "Indique distrito, provincia o región",
        },
        {
          id: "poblaciones_crece",
          type: "multiple",
          prompt:
            "¿Con cuál o cuáles de las siguientes poblaciones del proyecto CRECE se identifica?",
          helper:
            "Puede marcar más de una opción o seleccionar «Prefiero no responder».",
          required: true,
          options: [
            { value: "Persona joven", label: "Persona joven" },
            { value: "Persona trans", label: "Persona trans" },
            { value: "Persona LGTBIQ+", label: "Persona LGTBIQ+" },
            { value: "Persona migrante", label: "Persona migrante" },
            {
              value: "Persona que vive con VIH",
              label: "Persona que vive con VIH",
            },
            {
              value: "Persona que realiza o realizó trabajo sexual",
              label: "Persona que realiza o realizó trabajo sexual",
            },
            {
              value: "Persona aliada de las poblaciones del proyecto",
              label: "Persona aliada de las poblaciones del proyecto",
            },
            { value: "Otro", label: "Otra población", hasTextInput: true },
            {
              value: "Prefiero no responder",
              label: "Prefiero no responder",
            },
          ],
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
          prompt:
            "¿El plan de trabajo de su OBC incluye acciones de Monitoreo Liderado por la Comunidad (MLC)?",
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
          id: "interes_personal_taller",
          type: "single",
          prompt:
            "¿Tiene interés personal en participar en el taller de Monitoreo Liderado por la Comunidad?",
          required: true,
          options: yesNo,
        },
        {
          id: "capacitacion_previa",
          type: "single",
          prompt:
            "¿Su OBC ha recibido previamente capacitación sobre MLC por parte de otra organización?",
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
            {
              value: "Universidad Peruana Cayetano Heredia",
              label: "Universidad Peruana Cayetano Heredia",
            },
            { value: "Hivos", label: "Hivos" },
            { value: "Otro", label: "Otra organización", hasTextInput: true },
          ],
        },
        {
          id: "aprendizaje_previo",
          type: "textarea",
          prompt:
            "¿Qué contenidos o herramientas de MLC conoce o ha aplicado su OBC?",
          required: false,
          maxLength: 1200,
          placeholder:
            "Describa brevemente la experiencia previa de la organización",
          showWhen: (answers) =>
            answers.capacitacion_previa === "Sí" ||
            answers.plan_incluye_mlc === "Sí",
        },
      ],
    },
    {
      id: "disponibilidad",
      title: "Disponibilidad y aplicación",
      shortTitle: "Disponibilidad",
      description:
        "El taller combina sesiones virtuales y presenciales. Confirme su disponibilidad para las cinco jornadas.",
      questions: [
        {
          id: "disponibilidad_cinco_jornadas",
          type: "single",
          prompt: "¿Puede asistir a todas las jornadas del taller?",
          required: true,
          options: yesNo,
        },
        {
          id: "jornadas_disponibles",
          type: "multiple",
          prompt: "¿A cuáles jornadas del taller puede asistir?",
          helper: "Puede marcar más de una opción. Todas las fechas corresponden a noviembre de 2026.",
          required: true,
          showWhen: (answers) => answers.disponibilidad_cinco_jornadas === "No",
          options: [
            {
              value: "Martes 17: 5:00 a 8:00 p. m. - virtual",
              label: "Martes 17: 5:00 a 8:00 p. m. - virtual",
            },
            {
              value: "Miércoles 18: 5:00 a 8:00 p. m. - virtual",
              label: "Miércoles 18: 5:00 a 8:00 p. m. - virtual",
            },
            {
              value: "Jueves 19: 4:00 a 9:00 p. m. - presencial",
              label: "Jueves 19: 4:00 a 9:00 p. m. - presencial",
            },
            {
              value: "Viernes 20: 4:00 a 9:00 p. m. - presencial",
              label: "Viernes 20: 4:00 a 9:00 p. m. - presencial",
            },
            {
              value: "Sábado 21: 10:00 a. m. a 7:00 p. m. - presencial",
              label: "Sábado 21: 10:00 a. m. a 7:00 p. m. - presencial",
            },
          ],
        },
        {
          id: "plan_accion_seis_meses",
          type: "textarea",
          prompt:
            "¿Cuál es el plan de acción de su OBC en materia de MLC para los próximos seis meses?",
          helper:
            "Describa las acciones previstas, la población involucrada y el resultado que espera alcanzar.",
          required: true,
          maxLength: 2400,
          placeholder: "Describa brevemente el plan de acción",
        },
        {
          id: "aplicacion_aprendizajes",
          type: "textarea",
          prompt:
            "¿Cómo aplicaría o compartiría en su OBC lo aprendido durante el taller?",
          required: true,
          maxLength: 1600,
          placeholder: "Describa una acción concreta de aplicación o réplica",
        },
      ],
    },
  ],
};
