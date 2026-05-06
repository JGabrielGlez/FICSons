-- Migration: Initial schema with RLS policies
-- Date: 2026-05-05
-- SPEC-002: Backend API Core LMS

-- ============================================================================
-- 1) Authentication and profiles (core identity)
-- ============================================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('super_admin', 'admin', 'instructor', 'student')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_own_profile"
  ON profiles FOR SELECT
  USING (auth.uid()::text = id::text);

CREATE POLICY "profiles_view_public"
  ON profiles FOR SELECT
  USING (true);

-- ============================================================================
-- 2) Organizational structure
-- ============================================================================

CREATE TABLE IF NOT EXISTS organizational_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES organizational_units(id) ON DELETE SET NULL,
  unit_type TEXT NOT NULL CHECK (unit_type IN ('institution', 'faculty', 'department', 'program')),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE organizational_units ENABLE ROW LEVEL SECURITY;

CREATE POLICY "organizational_units_view_all"
  ON organizational_units FOR SELECT
  USING (is_active = true);

-- ============================================================================
-- 3) Admin scopes (role-based access control)
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_scopes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organizational_unit_id UUID REFERENCES organizational_units(id) ON DELETE CASCADE,
  scope_level TEXT NOT NULL CHECK (scope_level IN ('super', 'institution', 'faculty', 'program')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE admin_scopes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_scopes_own"
  ON admin_scopes FOR SELECT
  USING (auth.uid()::text = admin_user_id::text);

CREATE POLICY "admin_scopes_admin_can_view"
  ON admin_scopes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
    )
  );

-- ============================================================================
-- 4) Course management
-- ============================================================================

CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  organizational_unit_id UUID REFERENCES organizational_units(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "courses_view_published"
  ON courses FOR SELECT
  USING (status = 'published' OR auth.uid()::text = owner_id::text);

CREATE POLICY "courses_owner_full"
  ON courses FOR ALL
  USING (auth.uid()::text = owner_id::text);

-- ============================================================================
-- 5) Course instructors
-- ============================================================================

CREATE TABLE IF NOT EXISTS course_instructors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  instructor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role_in_course TEXT NOT NULL CHECK (role_in_course IN ('owner', 'collaborator')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (course_id, instructor_id)
);

ALTER TABLE course_instructors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "course_instructors_view"
  ON course_instructors FOR SELECT
  USING (true);

-- ============================================================================
-- 6) Modules and lessons
-- ============================================================================

CREATE TABLE IF NOT EXISTS modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  position INT NOT NULL,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "modules_view"
  ON modules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE id = course_id AND (status = 'published' OR auth.uid()::text = owner_id::text)
    )
  );

CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('video', 'pdf', 'pptx', 'web_note')),
  position INT NOT NULL,
  xp_override INT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lessons_view"
  ON lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM modules m
      JOIN courses c ON m.course_id = c.id
      WHERE m.id = module_id AND (c.status = 'published' OR auth.uid()::text = c.owner_id::text)
    )
  );

-- ============================================================================
-- 7) Content sources
-- ============================================================================

CREATE TABLE IF NOT EXISTS content_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  source_url TEXT NOT NULL,
  embed_url TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE content_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "content_sources_view"
  ON content_sources FOR SELECT
  USING (true);

-- ============================================================================
-- 8) Enrollment and progress
-- ============================================================================

CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'suspended', 'dropped')),
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, course_id)
);

ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "enrollments_own"
  ON enrollments FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "enrollments_instructor_view"
  ON enrollments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM course_instructors ci
      WHERE ci.course_id = enrollments.course_id AND ci.instructor_id = auth.uid()
    )
  );

-- ============================================================================
-- 9) Progress tracking
-- ============================================================================

CREATE TABLE IF NOT EXISTS progress_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  progress_percent INT DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, lesson_id)
);

ALTER TABLE progress_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "progress_tracking_own"
  ON progress_tracking FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "progress_tracking_instructor_view"
  ON progress_tracking FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM lessons l
      JOIN modules m ON l.module_id = m.id
      JOIN courses c ON m.course_id = c.id
      JOIN course_instructors ci ON c.id = ci.course_id
      WHERE l.id = lesson_id AND ci.instructor_id = auth.uid()
    )
  );

-- ============================================================================
-- 10) Learning paths
-- ============================================================================

CREATE TABLE IF NOT EXISTS learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  is_sequential BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;

CREATE POLICY "learning_paths_view_published"
  ON learning_paths FOR SELECT
  USING (status = 'published');

CREATE TABLE IF NOT EXISTS learning_path_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learning_path_id UUID NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  position INT NOT NULL,
  UNIQUE (learning_path_id, course_id)
);

ALTER TABLE learning_path_courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "learning_path_courses_view"
  ON learning_path_courses FOR SELECT
  USING (true);

-- ============================================================================
-- 11) Course prerequisites
-- ============================================================================

CREATE TABLE IF NOT EXISTS course_prerequisites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  prerequisite_course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  min_score INT DEFAULT 70,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (course_id, prerequisite_course_id),
  CHECK (course_id != prerequisite_course_id)
);

ALTER TABLE course_prerequisites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "course_prerequisites_view"
  ON course_prerequisites FOR SELECT
  USING (true);

-- ============================================================================
-- 12) Evaluations
-- ============================================================================

CREATE TABLE IF NOT EXISTS evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  passing_score INT DEFAULT 70,
  max_attempts INT DEFAULT 3,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CHECK (
    (course_id IS NOT NULL AND module_id IS NULL AND lesson_id IS NULL) OR
    (course_id IS NULL AND module_id IS NOT NULL AND lesson_id IS NULL) OR
    (course_id IS NULL AND module_id IS NULL AND lesson_id IS NOT NULL)
  )
);

ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "evaluations_view_published"
  ON evaluations FOR SELECT
  USING (is_active = true);

-- ============================================================================
-- 13) Evaluation questions and options
-- ============================================================================

CREATE TABLE IF NOT EXISTS evaluation_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id UUID NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer', 'essay')),
  prompt TEXT NOT NULL,
  position INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE evaluation_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "evaluation_questions_view"
  ON evaluation_questions FOR SELECT
  USING (true);

CREATE TABLE IF NOT EXISTS evaluation_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES evaluation_questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE evaluation_options ENABLE ROW LEVEL SECURITY;

-- CRITICAL: is_correct MUST NOT be exposed to client
CREATE POLICY "evaluation_options_no_correct_for_client"
  ON evaluation_options FOR SELECT
  USING (false);

-- ============================================================================
-- 14) Evaluation attempts
-- ============================================================================

CREATE TABLE IF NOT EXISTS evaluation_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id UUID NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  attempt_number INT NOT NULL DEFAULT 1,
  score INT,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'graded', 'passed', 'failed')),
  started_at TIMESTAMPTZ DEFAULT now(),
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE evaluation_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "evaluation_attempts_own"
  ON evaluation_attempts FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "evaluation_attempts_instructor_view"
  ON evaluation_attempts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM evaluations e
      JOIN courses c ON (e.course_id = c.id OR e.module_id IS NOT NULL OR e.lesson_id IS NOT NULL)
      JOIN course_instructors ci ON c.id = ci.course_id
      WHERE e.id = evaluation_id AND ci.instructor_id = auth.uid()
    )
  );

-- ============================================================================
-- 15) Gamification (badges, trophies)
-- ============================================================================

CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_url TEXT,
  criteria JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "badges_view"
  ON badges FOR SELECT
  USING (true);

CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, badge_id)
);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_badges_view"
  ON user_badges FOR SELECT
  USING (true);

CREATE TABLE IF NOT EXISTS trophies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE trophies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trophies_view"
  ON trophies FOR SELECT
  USING (true);

CREATE TABLE IF NOT EXISTS user_trophies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  trophy_id UUID NOT NULL REFERENCES trophies(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, trophy_id)
);

ALTER TABLE user_trophies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_trophies_view"
  ON user_trophies FOR SELECT
  USING (true);

-- ============================================================================
-- 16) Certificates and diplomas
-- ============================================================================

CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  verification_code TEXT NOT NULL UNIQUE,
  issued_at TIMESTAMPTZ DEFAULT now(),
  public_status BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "certificates_own"
  ON certificates FOR SELECT
  USING (auth.uid()::text = user_id::text OR public_status = true);

CREATE TABLE IF NOT EXISTS diplomas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  learning_path_id UUID NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
  verification_code TEXT NOT NULL UNIQUE,
  issued_at TIMESTAMPTZ DEFAULT now(),
  public_status BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE diplomas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "diplomas_own"
  ON diplomas FOR SELECT
  USING (auth.uid()::text = user_id::text OR public_status = true);

-- ============================================================================
-- 17) AI and notifications
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  context_ref TEXT,
  summary TEXT,
  token_usage INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_conversations_own"
  ON ai_conversations FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  payload JSONB DEFAULT '{}'::JSONB,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_own"
  ON notifications FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- ============================================================================
-- 18) Moderation
-- ============================================================================

CREATE TABLE IF NOT EXISTS moderation_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_review', 'resolved', 'rejected')),
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

ALTER TABLE moderation_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "moderation_flags_creators"
  ON moderation_flags FOR SELECT
  USING (auth.uid()::text = created_by::text OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin')));

-- ============================================================================
-- 19) Operational audit and counter tables (CONSTITUTION REQUIREMENTS)
-- ============================================================================

CREATE TABLE IF NOT EXISTS operational_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  meta JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE operational_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "operational_audit_admins_only"
  ON operational_audit FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
    )
  );

CREATE TABLE IF NOT EXISTS ai_usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tokens_used INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE ai_usage_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_usage_events_admins_only"
  ON ai_usage_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
    )
  );

-- ============================================================================
-- Indexes for performance (RLS-aware)
-- ============================================================================

CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_courses_owner ON courses(owner_id);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_enrollments_user_course ON enrollments(user_id, course_id);
CREATE INDEX idx_enrollments_status ON enrollments(status);
CREATE INDEX idx_evaluation_attempts_user_eval ON evaluation_attempts(user_id, evaluation_id);
CREATE INDEX idx_operational_audit_user ON operational_audit(user_id);
CREATE INDEX idx_operational_audit_action ON operational_audit(action);
CREATE INDEX idx_progress_tracking_user ON progress_tracking(user_id);
