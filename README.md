# Taller de Monitoreo Liderado por la Comunidad

Formulario de manifestación de interés para líderes y lideresas de organizaciones de base comunitaria que deseen participar en el Taller de Monitoreo Liderado por la Comunidad del proyecto CRECE.

La versión `2026-10-v1` registra una candidatura por OBC, experiencia previa, disponibilidad para las cinco jornadas y el plan de aplicación de los aprendizajes. Incluye vista previa, descarga en PDF y guardado persistente del borrador en el navegador.

## Desarrollo local

```bash
npm install
npm run dev
```

Sin variables de entorno, la aplicación funciona en modo de demostración y no almacena respuestas.

## Fechas del taller

- 17 y 18 de noviembre de 2026: sesiones virtuales.
- 19, 20 y 21 de noviembre de 2026: sesiones presenciales.
- Capacidad prevista: 30 participantes, con una persona por OBC.

## Almacenamiento

Las respuestas se registran en `survey_submissions` con el identificador `crece-taller-mlc-interes`. Los datos de contacto se conservan en el contexto privado del envío y no se incluyen en el JSON analítico de respuestas.

Las variables `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` deben configurarse únicamente en el servidor.
