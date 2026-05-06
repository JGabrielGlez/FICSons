-- =========================================
-- LMS Enrollment - Schema mínimo funcional
-- =========================================

create extension if not exists pgcrypto;

-- 1) Cursos
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  status text not null default 'published',
  created_at timestamptz not null default now()
);

create index if not exists idx_courses_status
  on public.courses (status);

-- 2) Inscripciones
create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  course_id uuid not null references public.courses(id) on delete cascade,
  status text not null default 'active'
    check (status in ('active', 'completed', 'suspended', 'dropped')),
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, course_id)
);

create index if not exists idx_enrollments_user_id
  on public.enrollments (user_id);

create index if not exists idx_enrollments_course_id
  on public.enrollments (course_id);

create index if not exists idx_enrollments_status
  on public.enrollments (status);

-- 3) Prerrequisitos de curso
create table if not exists public.course_prerequisites (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  prerequisite_course_id uuid not null references public.courses(id) on delete cascade,
  min_score numeric(5,2) not null default 0,
  created_at timestamptz not null default now(),
  unique (course_id, prerequisite_course_id),
  check (course_id <> prerequisite_course_id)
);

create index if not exists idx_course_prereq_course_id
  on public.course_prerequisites (course_id);

create index if not exists idx_course_prereq_prereq_course_id
  on public.course_prerequisites (prerequisite_course_id);

-- 4) Evaluaciones
create table if not exists public.evaluations (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_evaluations_course_id
  on public.evaluations (course_id);

-- 5) Intentos de evaluación
create table if not exists public.evaluation_attempts (
  id uuid primary key default gen_random_uuid(),
  evaluation_id uuid not null references public.evaluations(id) on delete cascade,
  user_id uuid not null,
  score numeric(5,2) null,
  status text not null
    check (status in ('in_progress', 'submitted', 'graded', 'passed', 'failed')),
  created_at timestamptz not null default now()
);

create index if not exists idx_eval_attempts_eval_id
  on public.evaluation_attempts (evaluation_id);

create index if not exists idx_eval_attempts_user_id
  on public.evaluation_attempts (user_id);

create index if not exists idx_eval_attempts_status
  on public.evaluation_attempts (status);


  -- Usuario fake (el mismo que pongas en DEV_FAKE_USER_ID)
-- ejemplo: 11111111-1111-1111-1111-111111111111

insert into public.courses (id, title, status) values
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Curso Base', 'published'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Curso Avanzado', 'published')
on conflict (id) do nothing;

insert into public.course_prerequisites (course_id, prerequisite_course_id, min_score)
values ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 70)
on conflict (course_id, prerequisite_course_id) do nothing;

insert into public.evaluations (id, course_id, title)
values ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Examen Curso Base')
on conflict (id) do nothing;

insert into public.evaluation_attempts (evaluation_id, user_id, score, status)
values ('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 85, 'passed')
on conflict do nothing;