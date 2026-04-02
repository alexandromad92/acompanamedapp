-- ================================================================
-- AcompañaMed — Schema completo para Supabase
-- Ejecutar completo en el SQL Editor de Supabase
-- ================================================================

-- ── ENUMS ────────────────────────────────────────────────────────
create type protocol_tipo as enum ('GLP-1', 'TRT', 'Hormonal Femenino', 'Suplementación');
create type lab_status as enum ('Revisado por médico', 'Pendiente de revisión');
create type message_sender as enum ('medico', 'paciente');
create type subscription_status as enum ('active', 'trialing', 'past_due', 'canceled', 'incomplete');
create type user_role as enum ('medico', 'paciente');

-- ── FUNCIÓN updated_at automático ────────────────────────────────
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── PROFILES (extiende auth.users 1:1) ───────────────────────────
create table public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  role            user_role not null default 'paciente',
  nombre          text not null,
  apellido        text,
  email           text not null,
  avatar_initials text,
  created_at      timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "Perfil propio — lectura"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Perfil propio — actualización"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Médico lee todos los perfiles"
  on public.profiles for select
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'medico')
  );

-- ── PATIENTS ─────────────────────────────────────────────────────
create table public.patients (
  id                    uuid primary key references public.profiles(id) on delete cascade,
  edad                  int,
  pais                  text,
  peso_actual           numeric(5,2),
  altura                int,
  imc                   numeric(4,1),
  medicamentos_actuales text,
  supervision_actual    text,
  frustracion_principal text,
  sintomas              text[] default '{}',
  energia               int check (energia between 1 and 10),
  sueno                 int check (sueno between 1 and 10),
  libido                int check (libido between 1 and 10),
  intentos_anteriores   text,
  por_que_fallaron      text,
  condiciones_medicas   text,
  objetivo_principal    text,
  objetivos_3_meses     text,
  resultado_ideal       text,
  fecha_registro        timestamptz not null default now()
);
alter table public.patients enable row level security;

create policy "Paciente lee sus datos"
  on public.patients for select using (auth.uid() = id);

create policy "Paciente actualiza sus datos"
  on public.patients for update using (auth.uid() = id);

create policy "Médico lee todos los pacientes"
  on public.patients for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'medico')
  );

create policy "Médico actualiza pacientes"
  on public.patients for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'medico')
  );

create policy "Médico inserta pacientes"
  on public.patients for insert with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'medico')
  );

-- ── PROTOCOLS ────────────────────────────────────────────────────
create table public.protocols (
  id                   uuid primary key default gen_random_uuid(),
  patient_id           uuid not null references public.patients(id) on delete cascade,
  titulo               text not null,
  tipo                 protocol_tipo not null,
  resumen_caso         text,
  diagnostico          text,
  plan_medicacion      text,
  plan_nutricion       text,
  plan_suplementacion  text[] default '{}',
  plan_ejercicio       text,
  plan_seguimiento     text,
  que_esperar          text,
  que_evitar           text,
  senales_alerta       text,
  proxima_revision     date,
  version              int not null default 1,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
alter table public.protocols enable row level security;

create trigger protocols_updated_at
  before update on public.protocols
  for each row execute function update_updated_at();

create policy "Paciente lee su protocolo"
  on public.protocols for select using (patient_id = auth.uid());

create policy "Médico acceso total a protocolos"
  on public.protocols for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'medico')
  );

-- ── MESSAGES ─────────────────────────────────────────────────────
create table public.messages (
  id          uuid primary key default gen_random_uuid(),
  patient_id  uuid not null references public.patients(id) on delete cascade,
  sender      message_sender not null,
  texto       text not null,
  created_at  timestamptz not null default now(),
  read_at     timestamptz
);
alter table public.messages enable row level security;

-- Activar Realtime para mensajes
alter publication supabase_realtime add table public.messages;

create policy "Paciente lee sus mensajes"
  on public.messages for select using (patient_id = auth.uid());

create policy "Paciente envía mensajes"
  on public.messages for insert with check (
    patient_id = auth.uid() and sender = 'paciente'
  );

create policy "Médico acceso total a mensajes"
  on public.messages for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'medico')
  );

-- ── LAB FILES ────────────────────────────────────────────────────
create table public.lab_files (
  id            uuid primary key default gen_random_uuid(),
  patient_id    uuid not null references public.patients(id) on delete cascade,
  nombre        text not null,
  storage_path  text not null,
  tipo          text,
  estado        lab_status not null default 'Pendiente de revisión',
  created_at    timestamptz not null default now(),
  reviewed_at   timestamptz
);
alter table public.lab_files enable row level security;

create policy "Paciente lee sus análisis"
  on public.lab_files for select using (patient_id = auth.uid());

create policy "Paciente sube análisis"
  on public.lab_files for insert with check (patient_id = auth.uid());

create policy "Médico acceso total a análisis"
  on public.lab_files for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'medico')
  );

-- ── PROGRESS ENTRIES ─────────────────────────────────────────────
create table public.progress_entries (
  id          uuid primary key default gen_random_uuid(),
  patient_id  uuid not null references public.patients(id) on delete cascade,
  fecha       date not null default current_date,
  mes         text not null,
  peso        numeric(5,2) not null,
  energia     int not null check (energia between 1 and 10),
  sueno       int not null check (sueno between 1 and 10),
  libido      int not null check (libido between 1 and 10),
  notas       text,
  created_at  timestamptz not null default now()
);
alter table public.progress_entries enable row level security;

create policy "Paciente lee su progreso"
  on public.progress_entries for select using (patient_id = auth.uid());

create policy "Paciente registra progreso"
  on public.progress_entries for insert with check (patient_id = auth.uid());

create policy "Médico lee todo el progreso"
  on public.progress_entries for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'medico')
  );

-- ── SUBSCRIPTIONS (MercadoPago) ───────────────────────────────────
create table public.subscriptions (
  id                  uuid primary key default gen_random_uuid(),
  patient_id          uuid not null references public.patients(id) on delete cascade,
  mp_preapproval_id   text unique,           -- ID de suscripción de MercadoPago
  mp_payer_email      text,                  -- Email del pagador
  status              subscription_status not null default 'incomplete',
  current_period_end  timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
alter table public.subscriptions enable row level security;

create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function update_updated_at();

create policy "Paciente lee su suscripción"
  on public.subscriptions for select using (patient_id = auth.uid());

create policy "Médico lee todas las suscripciones"
  on public.subscriptions for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'medico')
  );

-- ── STORAGE POLICIES (ejecutar después de crear el bucket "lab-files") ──
-- Crear el bucket "lab-files" como PRIVADO en: Storage > New bucket > lab-files > Private

create policy "Paciente sube sus archivos"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'lab-files' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Paciente descarga sus archivos"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'lab-files' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Médico descarga todos los archivos"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'lab-files' and
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'medico')
  );

create policy "Médico elimina archivos"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'lab-files' and
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'medico')
  );
