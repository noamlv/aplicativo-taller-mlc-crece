create extension if not exists pgcrypto;

create table if not exists public.survey_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  instrument_id text not null,
  instrument_version text not null,
  source text not null default 'web_app',
  status text not null default 'received'
    check (status in ('received', 'reviewed', 'integrated', 'rejected')),
  context jsonb not null default '{}'::jsonb,
  answers jsonb not null,
  reviewed_at timestamptz,
  review_notes text
);

create index if not exists survey_submissions_created_at_idx
  on public.survey_submissions (created_at desc);
create index if not exists survey_submissions_status_idx
  on public.survey_submissions (status);
create index if not exists survey_submissions_answers_gin_idx
  on public.survey_submissions using gin (answers);

alter table public.survey_submissions enable row level security;

comment on table public.survey_submissions is
  'Zona de recepción del cuestionario CRECE. Las respuestas se revisan antes de integrarse a las bases analíticas de personas beneficiarias y atenciones.';

-- No se crean políticas para anon o authenticated. La aplicación inserta únicamente
-- desde la ruta de servidor mediante SUPABASE_SERVICE_ROLE_KEY.
