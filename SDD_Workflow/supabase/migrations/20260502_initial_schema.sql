-- Supabase initial schema for LMS Escolar
-- Based on specs/001-spec-fundacional/data-model.md and module map in .drfic/diana-sdk/specs/002-spec-drfic.md

create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- Helper types
-- -----------------------------------------------------------------------------

do $$ begin
    create type public.unit_type_enum as enum ('area', 'department', 'career', 'specialty');
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type public.course_status_enum as enum ('draft', 'published', 'archived');
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type public.course_instructor_role_enum as enum ('owner', 'collaborator');
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type public.enrollment_status_enum as enum ('active', 'completed', 'suspended', 'dropped');
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type public.evaluation_attempt_status_enum as enum ('in_progress', 'submitted', 'graded', 'passed', 'failed');
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type public.content_type_enum as enum ('video', 'pdf', 'pptx', 'web_note');
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type public.notification_type_enum as enum (
        'enrollment', 'progress', 'badge_awarded', 'trophy_awarded',
        'certificate_issued', 'evaluation_graded', 'course_published',
        'reminder', 'ai_response', 'system'
    );
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type public.moderation_flag_status_enum as enum ('open', 'in_review', 'resolved', 'rejected');
exception
    when duplicate_object then null;
end $$;

-- -----------------------------------------------------------------------------
-- Common updated_at trigger
-- -----------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- 1) Identity and organization
-- -----------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  display_name text not null,
  avatar_url text,
  role text not null check (role in ('super_admin', 'admin', 'instructor', 'moderator', 'student', 'alumno', 'moderador')),
  leaderboard_opt_in boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create table if not exists public.organizational_units (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.organizational_units (id) on delete set null,
  unit_type public.unit_type_enum not null,
  name text not null,
  code text unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_organizational_units_updated_at
before update on public.organizational_units
for each row execute function public.set_updated_at();

create index if not exists idx_organizational_units_parent_id on public.organizational_units (parent_id);
create index if not exists idx_organizational_units_unit_type on public.organizational_units (unit_type);

create table if not exists public.admin_scopes (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references public.profiles (id) on delete cascade,
  organizational_unit_id uuid not null references public.organizational_units (id) on delete cascade,
  scope_level text not null default 'unit' check (scope_level in ('unit', 'regional', 'global')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (admin_user_id, organizational_unit_id)
);

create trigger set_admin_scopes_updated_at
before update on public.admin_scopes
for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 2) Academic content
-- -----------------------------------------------------------------------------

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete restrict,
  organizational_unit_id uuid references public.organizational_units (id) on delete set null,
  title text not null,
  slug text not null unique,
  description text,
  tags text[] not null default '{}',
  difficulty text,
  status public.course_status_enum not null default 'draft',
  thumbnail_url text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_courses_updated_at
before update on public.courses
for each row execute function public.set_updated_at();

create index if not exists idx_courses_owner_id on public.courses (owner_id);
create index if not exists idx_courses_org_unit on public.courses (organizational_unit_id);
create index if not exists idx_courses_status on public.courses (status);
create index if not exists idx_courses_tags on public.courses using gin (tags);

create table if not exists public.course_instructors (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  instructor_id uuid not null references public.profiles (id) on delete cascade,
  role_in_course public.course_instructor_role_enum not null,
  created_at timestamptz not null default now(),
  unique (course_id, instructor_id)
);

create index if not exists idx_course_instructors_course_id on public.course_instructors (course_id);
create index if not exists idx_course_instructors_instructor_id on public.course_instructors (instructor_id);

create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  title text not null,
  position integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, position)
);

create trigger set_modules_updated_at
before update on public.modules
for each row execute function public.set_updated_at();

create index if not exists idx_modules_course_id on public.modules (course_id);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules (id) on delete cascade,
  title text not null,
  content_type public.content_type_enum not null,
  position integer not null default 0,
  xp_override integer,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (module_id, position)
);

create trigger set_lessons_updated_at
before update on public.lessons
for each row execute function public.set_updated_at();

create index if not exists idx_lessons_module_id on public.lessons (module_id);
create index if not exists idx_lessons_content_type on public.lessons (content_type);

create table if not exists public.content_sources (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  provider text not null,
  source_url text not null,
  embed_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lesson_id)
);

create trigger set_content_sources_updated_at
before update on public.content_sources
for each row execute function public.set_updated_at();

create index if not exists idx_content_sources_lesson_id on public.content_sources (lesson_id);

-- -----------------------------------------------------------------------------
-- 3) Progress and enrollment
-- -----------------------------------------------------------------------------

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  status public.enrollment_status_enum not null default 'active',
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, course_id)
);

create trigger set_enrollments_updated_at
before update on public.enrollments
for each row execute function public.set_updated_at();

create index if not exists idx_enrollments_user_id on public.enrollments (user_id);
create index if not exists idx_enrollments_course_id on public.enrollments (course_id);
create index if not exists idx_enrollments_status on public.enrollments (status);

create table if not exists public.progress_tracking (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  progress_percent numeric(5,2) not null default 0 check (progress_percent >= 0 and progress_percent <= 100),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create trigger set_progress_tracking_updated_at
before update on public.progress_tracking
for each row execute function public.set_updated_at();

create index if not exists idx_progress_tracking_user_id on public.progress_tracking (user_id);
create index if not exists idx_progress_tracking_lesson_id on public.progress_tracking (lesson_id);

-- -----------------------------------------------------------------------------
-- 4) Evaluations
-- -----------------------------------------------------------------------------

create table if not exists public.evaluations (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses (id) on delete cascade,
  module_id uuid references public.modules (id) on delete cascade,
  lesson_id uuid references public.lessons (id) on delete cascade,
  title text not null,
  passing_score numeric(5,2) not null default 70,
  max_attempts integer not null default 1,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    course_id is not null or module_id is not null or lesson_id is not null
  )
);

create trigger set_evaluations_updated_at
before update on public.evaluations
for each row execute function public.set_updated_at();

create index if not exists idx_evaluations_course_id on public.evaluations (course_id);
create index if not exists idx_evaluations_module_id on public.evaluations (module_id);
create index if not exists idx_evaluations_lesson_id on public.evaluations (lesson_id);

create table if not exists public.evaluation_questions (
  id uuid primary key default gen_random_uuid(),
  evaluation_id uuid not null references public.evaluations (id) on delete cascade,
  question_type text not null,
  prompt text not null,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (evaluation_id, position)
);

create trigger set_evaluation_questions_updated_at
before update on public.evaluation_questions
for each row execute function public.set_updated_at();

create index if not exists idx_evaluation_questions_evaluation_id on public.evaluation_questions (evaluation_id);

create table if not exists public.evaluation_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.evaluation_questions (id) on delete cascade,
  option_text text not null,
  is_correct boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_evaluation_options_updated_at
before update on public.evaluation_options
for each row execute function public.set_updated_at();

create index if not exists idx_evaluation_options_question_id on public.evaluation_options (question_id);

create table if not exists public.evaluation_attempts (
  id uuid primary key default gen_random_uuid(),
  evaluation_id uuid not null references public.evaluations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  attempt_number integer not null default 1,
  score numeric(5,2),
  status public.evaluation_attempt_status_enum not null default 'in_progress',
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (evaluation_id, user_id, attempt_number)
);

create trigger set_evaluation_attempts_updated_at
before update on public.evaluation_attempts
for each row execute function public.set_updated_at();

create index if not exists idx_evaluation_attempts_evaluation_id on public.evaluation_attempts (evaluation_id);
create index if not exists idx_evaluation_attempts_user_id on public.evaluation_attempts (user_id);
create index if not exists idx_evaluation_attempts_status on public.evaluation_attempts (status);

-- -----------------------------------------------------------------------------
-- 5) Gamification and acreditations
-- -----------------------------------------------------------------------------

create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  criteria jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_badges_updated_at
before update on public.badges
for each row execute function public.set_updated_at();

create table if not exists public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  badge_id uuid not null references public.badges (id) on delete cascade,
  awarded_at timestamptz not null default now(),
  unique (user_id, badge_id)
);

create index if not exists idx_user_badges_user_id on public.user_badges (user_id);
create index if not exists idx_user_badges_badge_id on public.user_badges (badge_id);

create table if not exists public.trophies (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  criteria jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_trophies_updated_at
before update on public.trophies
for each row execute function public.set_updated_at();

create table if not exists public.user_trophies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  trophy_id uuid not null references public.trophies (id) on delete cascade,
  awarded_at timestamptz not null default now(),
  unique (user_id, trophy_id)
);

create index if not exists idx_user_trophies_user_id on public.user_trophies (user_id);
create index if not exists idx_user_trophies_trophy_id on public.user_trophies (trophy_id);

create table if not exists public.learning_paths (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  is_sequential boolean not null default true,
  status text not null default 'active' check (status in ('active', 'inactive', 'draft')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_learning_paths_updated_at
before update on public.learning_paths
for each row execute function public.set_updated_at();

create table if not exists public.learning_path_courses (
  id uuid primary key default gen_random_uuid(),
  learning_path_id uuid not null references public.learning_paths (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  unique (learning_path_id, course_id),
  unique (learning_path_id, position)
);

create index if not exists idx_learning_path_courses_learning_path_id on public.learning_path_courses (learning_path_id);
create index if not exists idx_learning_path_courses_course_id on public.learning_path_courses (course_id);

create table if not exists public.course_prerequisites (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  prerequisite_course_id uuid not null references public.courses (id) on delete cascade,
  min_score numeric(5,2) not null default 0,
  created_at timestamptz not null default now(),
  unique (course_id, prerequisite_course_id),
  check (course_id <> prerequisite_course_id)
);

create index if not exists idx_course_prerequisites_course_id on public.course_prerequisites (course_id);
create index if not exists idx_course_prerequisites_prerequisite_course_id on public.course_prerequisites (prerequisite_course_id);

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id uuid references public.courses (id) on delete cascade,
  learning_path_id uuid references public.learning_paths (id) on delete cascade,
  verification_code text not null unique,
  issued_at timestamptz not null default now(),
  public_status text not null default 'valid' check (public_status in ('valid', 'revoked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (course_id is not null or learning_path_id is not null)
);

create trigger set_certificates_updated_at
before update on public.certificates
for each row execute function public.set_updated_at();

create index if not exists idx_certificates_user_id on public.certificates (user_id);
create index if not exists idx_certificates_course_id on public.certificates (course_id);
create index if not exists idx_certificates_learning_path_id on public.certificates (learning_path_id);

create table if not exists public.diplomas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  learning_path_id uuid not null references public.learning_paths (id) on delete cascade,
  verification_code text not null unique,
  issued_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, learning_path_id)
);

create trigger set_diplomas_updated_at
before update on public.diplomas
for each row execute function public.set_updated_at();

create index if not exists idx_diplomas_user_id on public.diplomas (user_id);
create index if not exists idx_diplomas_learning_path_id on public.diplomas (learning_path_id);

create table if not exists public.xp_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  category text not null check (category in ('lesson', 'evaluation', 'streak', 'bonus')),
  xp_delta integer not null,
  event_type text,
  event_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_xp_events_user_id on public.xp_events (user_id);
create index if not exists idx_xp_events_category on public.xp_events (category);

-- -----------------------------------------------------------------------------
-- 6) Notifications / operation
-- -----------------------------------------------------------------------------

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type public.notification_type_enum not null,
  title text not null,
  body text,
  payload jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_notifications_updated_at
before update on public.notifications
for each row execute function public.set_updated_at();

create index if not exists idx_notifications_user_id on public.notifications (user_id);
create index if not exists idx_notifications_read_at on public.notifications (read_at);

create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  context_ref text,
  summary text,
  token_usage jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_ai_conversations_updated_at
before update on public.ai_conversations
for each row execute function public.set_updated_at();

create index if not exists idx_ai_conversations_user_id on public.ai_conversations (user_id);

create table if not exists public.moderation_flags (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  reason text not null,
  status public.moderation_flag_status_enum not null default 'open',
  created_by uuid not null references public.profiles (id) on delete cascade,
  resolved_by uuid references public.profiles (id) on delete set null,
  resolved_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_moderation_flags_updated_at
before update on public.moderation_flags
for each row execute function public.set_updated_at();

create index if not exists idx_moderation_flags_status on public.moderation_flags (status);
create index if not exists idx_moderation_flags_entity on public.moderation_flags (entity_type, entity_id);

create table if not exists public.app_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null default '{}'::jsonb,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_app_settings_updated_at
before update on public.app_settings
for each row execute function public.set_updated_at();

create table if not exists public.ai_usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  feature text not null,
  prompt_tokens integer,
  completion_tokens integer,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_ai_usage_events_user_id on public.ai_usage_events (user_id);
create index if not exists idx_ai_usage_events_feature on public.ai_usage_events (feature);

-- -----------------------------------------------------------------------------
-- Suggested RPC placeholders (to implement later)
-- -----------------------------------------------------------------------------
-- can_enroll(user_id uuid, course_id uuid)
-- verify_certificate(code text)
-- submit_evaluation(evaluation_id uuid, answers jsonb, attempt_context jsonb)
-- check_achievements(user_id uuid, event_type text, event_payload jsonb)
-- issue_certificate(user_id uuid, course_id uuid, learning_path_id uuid)
-- reorder_modules(course_id uuid, ordered_module_ids uuid[])
-- save_video_timestamp(user_id uuid, lesson_id uuid, timestamp_seconds integer)
-- mark_lesson_complete(user_id uuid, lesson_id uuid)

-- -----------------------------------------------------------------------------
-- Optional: enable RLS later per table.
-- -----------------------------------------------------------------------------
