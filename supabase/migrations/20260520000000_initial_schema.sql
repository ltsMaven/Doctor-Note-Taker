-- Doctor Note Taker initial Supabase schema.
-- Run this in the Supabase SQL editor or with the Supabase CLI.
-- The policies below are permissive for a local prototype. Replace them with
-- authenticated, per-user policies before storing real patient data.

create extension if not exists pgcrypto;

create table if not exists public.app_users (
  id text primary key,
  role text not null check (role in ('doctor', 'patient')),
  name text not null,
  title text,
  email text not null unique,
  patient_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.patient_directory (
  patient_id text primary key,
  display_name text not null,
  added_at timestamptz not null default now()
);

create table if not exists public.patient_intake_profiles (
  patient_id text primary key references public.patient_directory(patient_id) on delete cascade,
  name text not null,
  age text not null,
  sex text not null,
  date_of_birth text not null,
  symptoms text not null default '',
  doctor_notes text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.transcription_results (
  id uuid primary key default gen_random_uuid(),
  patient_id text references public.patient_directory(patient_id) on delete set null,
  transcript text not null,
  confidence text not null check (confidence in ('high', 'medium', 'low')),
  warnings jsonb not null default '[]'::jsonb,
  source text,
  model text,
  audio_received boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.medical_summaries (
  patient_id text primary key references public.patient_directory(patient_id) on delete cascade,
  patient_name text,
  patient_summary text not null default '',
  tasks jsonb not null default '[]'::jsonb,
  medications jsonb not null default '[]'::jsonb,
  follow_up jsonb not null default '{"required": false, "date": "", "notes": ""}'::jsonb,
  warnings jsonb not null default '[]'::jsonb,
  doctor_approved boolean not null default false,
  approved_at timestamptz,
  source_transcript text,
  review_notes jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.medication_reminders (
  patient_id text not null references public.patient_directory(patient_id) on delete cascade,
  reminder_id text not null,
  medication_name text not null,
  dosage text not null,
  scheduled_date date not null,
  scheduled_time text not null,
  scheduled_label text not null,
  duration_day integer not null default 1,
  instructions text not null default '',
  status text not null default 'Pending' check (status in ('Pending', 'Taken', 'Skipped')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (patient_id, reminder_id)
);

create table if not exists public.reminder_preferences (
  patient_id text primary key references public.patient_directory(patient_id) on delete cascade,
  enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  doctor_user_id text references public.app_users(id) on delete set null,
  patient_id text references public.patient_directory(patient_id) on delete cascade,
  appointment_date date not null,
  start_time time not null,
  end_time time,
  reason text not null default '',
  status text not null default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_medical_summaries_updated_at on public.medical_summaries;
create trigger set_medical_summaries_updated_at
before update on public.medical_summaries
for each row execute function public.set_updated_at();

drop trigger if exists set_medication_reminders_updated_at on public.medication_reminders;
create trigger set_medication_reminders_updated_at
before update on public.medication_reminders
for each row execute function public.set_updated_at();

drop trigger if exists set_reminder_preferences_updated_at on public.reminder_preferences;
create trigger set_reminder_preferences_updated_at
before update on public.reminder_preferences
for each row execute function public.set_updated_at();

drop trigger if exists set_appointments_updated_at on public.appointments;
create trigger set_appointments_updated_at
before update on public.appointments
for each row execute function public.set_updated_at();

alter table public.app_users enable row level security;
alter table public.patient_directory enable row level security;
alter table public.patient_intake_profiles enable row level security;
alter table public.transcription_results enable row level security;
alter table public.medical_summaries enable row level security;
alter table public.medication_reminders enable row level security;
alter table public.reminder_preferences enable row level security;
alter table public.appointments enable row level security;

drop policy if exists "prototype anon all app_users" on public.app_users;
create policy "prototype anon all app_users" on public.app_users for all to anon using (true) with check (true);

drop policy if exists "prototype anon all patient_directory" on public.patient_directory;
create policy "prototype anon all patient_directory" on public.patient_directory for all to anon using (true) with check (true);

drop policy if exists "prototype anon all patient_intake_profiles" on public.patient_intake_profiles;
create policy "prototype anon all patient_intake_profiles" on public.patient_intake_profiles for all to anon using (true) with check (true);

drop policy if exists "prototype anon all transcription_results" on public.transcription_results;
create policy "prototype anon all transcription_results" on public.transcription_results for all to anon using (true) with check (true);

drop policy if exists "prototype anon all medical_summaries" on public.medical_summaries;
create policy "prototype anon all medical_summaries" on public.medical_summaries for all to anon using (true) with check (true);

drop policy if exists "prototype anon all medication_reminders" on public.medication_reminders;
create policy "prototype anon all medication_reminders" on public.medication_reminders for all to anon using (true) with check (true);

drop policy if exists "prototype anon all reminder_preferences" on public.reminder_preferences;
create policy "prototype anon all reminder_preferences" on public.reminder_preferences for all to anon using (true) with check (true);

drop policy if exists "prototype anon all appointments" on public.appointments;
create policy "prototype anon all appointments" on public.appointments for all to anon using (true) with check (true);

insert into public.app_users (id, role, name, title, email, patient_id)
values
  ('doctor-rivera', 'doctor', 'Dr Maya Rivera', 'General practitioner', 'doctor@example.com', null),
  ('patient-ava', 'patient', 'Ava Thompson', 'Patient', 'patient@example.com', 'patient-ava')
on conflict (id) do update set
  role = excluded.role,
  name = excluded.name,
  title = excluded.title,
  email = excluded.email,
  patient_id = excluded.patient_id;

insert into public.patient_directory (patient_id, display_name, added_at)
values ('patient-ava', 'Ava Thompson', now())
on conflict (patient_id) do update set display_name = excluded.display_name;

insert into public.reminder_preferences (patient_id, enabled)
values ('patient-ava', true)
on conflict (patient_id) do nothing;
