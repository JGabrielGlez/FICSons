# Data Model - SPEC-002 Backend API Core LMS

## Entidades Principales

### 1) Identidad y control de acceso
- Profile (`profiles`)
  - Campos clave: id, email, display_name, avatar_url, role, created_at, updated_at
  - Regla: role deriva de JWT y no es mutable desde cliente.
- OrganizationalUnit (`organizational_units`)
  - Campos clave: id, parent_id, unit_type, name, code, is_active
  - Relacion: jerarquia institucional.
- AdminScope (`admin_scopes`)
  - Campos clave: admin_user_id, organizational_unit_id, scope_level
  - Regla: define alcance administrativo por unidad.

### 2) Contenido academico
- Course (`courses`)
  - Campos clave: id, owner_id, organizational_unit_id, title, description, tags, status, published_at
  - Validacion: title requerido y status en conjunto permitido.
- CourseInstructor (`course_instructors`)
  - Campos clave: course_id, instructor_id, role_in_course (`owner`|`collaborator`)
  - Regla: exactamente un owner por curso.
- Module (`modules`)
  - Campos clave: id, course_id, title, position, is_published
- Lesson (`lessons`)
  - Campos clave: id, module_id, title, content_type, position, xp_override, is_published
  - Validacion: content_type en {video,pdf,pptx,web_note}.
- ContentSource (`content_sources`)
  - Campos clave: lesson_id, provider, source_url, embed_url, metadata
  - Regla: provider detectado por patron de URL.

### 3) Progreso e inscripcion
- Enrollment (`enrollments`)
  - Campos clave: id, user_id, course_id, status, enrolled_at, completed_at
  - Estados: active, completed, suspended, dropped.
- ProgressTracking (`progress_tracking`)
  - Campos clave: user_id, lesson_id, progress_percent, completed_at, updated_at
  - Validacion: progress_percent entre 0 y 100.
- LearningPath (`learning_paths`)
  - Campos clave: id, title, is_sequential, status
- LearningPathCourse (`learning_path_courses`)
  - Campos clave: learning_path_id, course_id, position
- CoursePrerequisite (`course_prerequisites`)
  - Campos clave: course_id, prerequisite_course_id, min_score
  - Regla: no ciclos.

### 4) Evaluaciones
- Evaluation (`evaluations`)
  - Campos clave: id, course_id|module_id|lesson_id, title, passing_score, max_attempts, is_active
- EvaluationQuestion (`evaluation_questions`)
  - Campos clave: id, evaluation_id, question_type, prompt, position
- EvaluationOption (`evaluation_options`)
  - Campos clave: id, question_id, option_text, is_correct
  - Regla critica: `is_correct` no se expone a cliente.
- EvaluationAttempt (`evaluation_attempts`)
  - Campos clave: id, evaluation_id, user_id, attempt_number, score, status, started_at, submitted_at
  - Estados: in_progress, submitted, graded, passed, failed.

### 5) Gamificacion y acreditaciones
- Badge (`badges`), UserBadge (`user_badges`)
- Trophy (`trophies`), UserTrophy (`user_trophies`)
- Certificate (`certificates`)
  - Campos clave: id, user_id, course_id, verification_code, issued_at, public_status
- Diploma (`diplomas`)
  - Campos clave: id, user_id, learning_path_id, verification_code, issued_at

### 6) IA, notificaciones y operacion
- AIConversation (`ai_conversations`)
  - Campos clave: id, user_id, context_ref, summary, token_usage, created_at
- Notification (`notifications`)
  - Campos clave: id, user_id, type, payload, read_at, created_at
- ModerationFlag (`moderation_flags`)
  - Campos clave: id, entity_type, entity_id, reason, status, created_by, resolved_by

## Relaciones Clave
- `courses` 1:N `modules` 1:N `lessons`
- `courses` N:M `profiles` via `course_instructors`
- `profiles` N:M `courses` via `enrollments`
- `evaluations` 1:N `evaluation_questions` 1:N `evaluation_options`
- `profiles` 1:N `evaluation_attempts`
- `learning_paths` N:M `courses` via `learning_path_courses`
- `courses` N:M `courses` via `course_prerequisites`

## Reglas de Validacion y Seguridad
- RLS obligatorio en todas las tablas.
- Mutacion de roles solo por Edge Function `update-user-role`.
- Grading solo por Edge Function `submit-evaluation`.
- Signed URLs para recursos privados con TTL corto.
- Rate limit de IA por usuario y bloqueo en evaluaciones activas.

## Transiciones de Estado (resumen)
- Enrollment: `active` -> `completed` | `suspended` | `dropped`
- EvaluationAttempt: `in_progress` -> `submitted` -> (`passed` | `failed`)
- Course: `draft` -> `published` -> `archived`
- ModerationFlag: `open` -> `in_review` -> (`resolved` | `rejected`)