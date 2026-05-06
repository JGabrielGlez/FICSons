# Supabase Queries Base — SPEC-001

Purpose: base de consultas para implementar la app LMS de forma tradicional en Supabase, alineada al modelo de datos de `data-model.md` y al mapa de módulos de `SPEC-002`.

Regla general:
- CRUD simple: `select`, `insert`, `update`, `delete`
- Lógica sensible: RPC/función SQL (`can_enroll`, `submit_evaluation`, `verify_certificate`, etc.)
- Seguridad: RLS desde el inicio, sin exponer datos sensibles al cliente

---

## 1. Auth / Usuarios
Tablas: `profiles`, `admin_scopes`

### Queries mínimas
- `select * from profiles where id = auth.uid()`
- `select * from profiles where role = 'admin'`
- `insert into profiles (...) values (...)`
- `update profiles set ... where id = auth.uid()`
- `update profiles set role = ... where id = :user_id` (solo vía Edge Function / backend)
- `delete from profiles where id = :user_id` o soft delete

### Casos de uso
- Mi perfil
- Lista de usuarios
- Cambiar rol
- Desactivar usuario

### RPCs / funciones recomendadas
- `update_user_role(target_user_id, new_role)`
- `get_user_profile(user_id)`

---

## 2. Courses
Tablas: `courses`, `course_instructors`, `modules`, `organizational_units`

### Courses
- `select * from courses where status = 'published'`
- `select * from courses where id = :course_id`
- `insert into courses (...) values (...)`
- `update courses set ... where id = :course_id`
- `delete from courses where id = :course_id`

### Course instructors
- `select * from course_instructors where course_id = :course_id`
- `insert into course_instructors (course_id, instructor_id, role_in_course) values (...)`
- `delete from course_instructors where course_id = :course_id and instructor_id = :instructor_id`

### Modules
- `select * from modules where course_id = :course_id order by position`
- `insert into modules (...) values (...)`
- `update modules set ... where id = :module_id`
- `delete from modules where id = :module_id`
- `update modules set position = ... where course_id = :course_id` (reorder)

### Organizational units
- `select * from organizational_units where is_active = true`
- `select * from organizational_units where parent_id = :parent_id`

### RPCs / funciones recomendadas
- `reorder_modules(course_id, ordered_module_ids)`
- `get_course_detail(course_id)`

---

## 3. Lessons / Contenido / Progreso
Tablas: `lessons`, `content_sources`, `progress_tracking`

### Lessons
- `select * from lessons where module_id = :module_id order by position`
- `select * from lessons where id = :lesson_id`
- `insert into lessons (...) values (...)`
- `update lessons set ... where id = :lesson_id`
- `delete from lessons where id = :lesson_id`

### Content sources
- `select * from content_sources where lesson_id = :lesson_id`
- `insert into content_sources (...) values (...)`
- `update content_sources set ... where lesson_id = :lesson_id`
- `delete from content_sources where lesson_id = :lesson_id`

### Progress tracking
- `select * from progress_tracking where user_id = auth.uid() and lesson_id = :lesson_id`
- `insert into progress_tracking (...) values (...)`
- `update progress_tracking set progress_percent = :value, updated_at = now() where user_id = auth.uid() and lesson_id = :lesson_id`

### RPCs / funciones recomendadas
- `save_video_timestamp(user_id, lesson_id, timestamp)`
- `mark_lesson_complete(user_id, lesson_id)`
- `get_user_progress(user_id, course_id)`

---

## 4. Enrollment / Prerequisitos
Tablas: `enrollments`, `course_prerequisites`, `learning_paths`, `learning_path_courses`

### Enrollments
- `select * from enrollments where user_id = auth.uid()`
- `select * from enrollments where user_id = auth.uid() and course_id = :course_id`
- `insert into enrollments (...) values (...)`
- `update enrollments set status = 'completed', completed_at = now() where id = :enrollment_id`
- `delete from enrollments where id = :enrollment_id`

### Course prerequisites
- `select * from course_prerequisites where course_id = :course_id`
- `insert into course_prerequisites (...) values (...)`
- `delete from course_prerequisites where course_id = :course_id and prerequisite_course_id = :prerequisite_course_id`

### Learning paths
- `select * from learning_paths where status = 'active'`
- `select * from learning_path_courses where learning_path_id = :path_id order by position`
- `insert into learning_paths (...) values (...)`
- `insert into learning_path_courses (...) values (...)`

### RPCs / funciones recomendadas
- `can_enroll(user_id, course_id)`
- `path_progress(user_id, path_id)`
- `has_prerequisite_cycle(course_id, prerequisite_course_id)`

---

## 5. Evaluations
Tablas: `evaluations`, `evaluation_questions`, `evaluation_options`, `evaluation_attempts`

### Evaluations
- `select * from evaluations where course_id = :course_id and is_active = true`
- `select * from evaluations where id = :evaluation_id`
- `insert into evaluations (...) values (...)`
- `update evaluations set ... where id = :evaluation_id`
- `delete from evaluations where id = :evaluation_id`

### Questions
- `select * from evaluation_questions where evaluation_id = :evaluation_id order by position`
- `insert into evaluation_questions (...) values (...)`
- `update evaluation_questions set ... where id = :question_id`
- `delete from evaluation_questions where id = :question_id`

### Options
- `select id, question_id, option_text from evaluation_options where question_id = :question_id`
- `insert into evaluation_options (...) values (...)`
- `update evaluation_options set ... where id = :option_id`
- `delete from evaluation_options where id = :option_id`

Nota: `is_correct` no debe salir al cliente.

### Attempts
- `select * from evaluation_attempts where user_id = auth.uid() and evaluation_id = :evaluation_id`
- `insert into evaluation_attempts (...) values (...)`
- `update evaluation_attempts set status = 'submitted', submitted_at = now() where id = :attempt_id`
- `update evaluation_attempts set score = :score, status = 'graded' where id = :attempt_id`

### RPCs / funciones recomendadas
- `submit_evaluation(evaluation_id, answers, attempt_context)`
- `start_evaluation_attempt(user_id, evaluation_id)`
- `get_quiz_options(question_id)` sin `is_correct`

---

## 6. Gamification / Certificados
Tablas: `badges`, `user_badges`, `trophies`, `user_trophies`, `certificates`, `diplomas`, `xp_events`

### Badges / trophies
- `select * from badges`
- `select * from user_badges where user_id = auth.uid()`
- `insert into user_badges (...) values (...)`
- `select * from trophies`
- `select * from user_trophies where user_id = auth.uid()`
- `insert into user_trophies (...) values (...)`

### Certificates / diplomas
- `select * from certificates where user_id = auth.uid()`
- `select * from certificates where verification_code = :code`
- `insert into certificates (...) values (...)`
- `select * from diplomas where user_id = auth.uid()`
- `insert into diplomas (...) values (...)`

### XP events
- `select * from xp_events where user_id = auth.uid() order by created_at desc`
- `insert into xp_events (...) values (...)`

### RPCs / funciones recomendadas
- `check_achievements(user_id, event_type, event_payload)`
- `issue_certificate(user_id, course_id | learning_path_id)`
- `verify_certificate(code)`

---

## 7. Notifications
Tabla: `notifications`

### Queries
- `select * from notifications where user_id = auth.uid() order by created_at desc`
- `select * from notifications where user_id = auth.uid() and read_at is null`
- `insert into notifications (...) values (...)`
- `update notifications set read_at = now() where id = :notification_id and user_id = auth.uid()`
- `delete from notifications where id = :notification_id and user_id = auth.uid()`

### Helpers
- `count(*)` para badge de no leídas

---

## 8. Admin / Operación
Tablas: `organizational_units`, `admin_scopes`, `profiles`, `app_settings`, `ai_usage_events`

### Queries
- `select * from admin_scopes where admin_user_id = auth.uid()`
- `select * from organizational_units order by name`
- `insert into organizational_units (...) values (...)`
- `update organizational_units set ... where id = :unit_id`
- `delete from organizational_units where id = :unit_id`
- `select * from app_settings`
- `update app_settings set ... where key = :key`
- `select * from ai_usage_events where user_id = auth.uid() order by created_at desc`

### RPCs / funciones recomendadas
- `update_user_role(target_user_id, new_role)`
- `get_admin_dashboard_metrics(scope_id)`

---

## 9. Moderation
Tabla: `moderation_flags`

### Queries
- `select * from moderation_flags where status = 'open' order by created_at desc`
- `select * from moderation_flags where entity_type = :type and entity_id = :id`
- `insert into moderation_flags (...) values (...)`
- `update moderation_flags set status = 'resolved', resolved_by = auth.uid() where id = :flag_id`
- `update moderation_flags set status = 'dismissed', resolved_by = auth.uid() where id = :flag_id`

---

## 10. Consultas base por módulo para el frontend

### Cursos con módulos y lecciones
```sql
select
  c.id,
  c.title,
  c.slug,
  c.status,
  m.id as module_id,
  m.title as module_title,
  l.id as lesson_id,
  l.title as lesson_title,
  l.content_type
from courses c
left join modules m on m.course_id = c.id
left join lessons l on l.module_id = m.id
where c.id = :course_id
order by m.position, l.position;
```

### Progreso del alumno
```sql
select
  e.course_id,
  e.status,
  e.enrolled_at,
  e.completed_at,
  pt.lesson_id,
  pt.progress_percent,
  pt.completed_at as lesson_completed_at
from enrollments e
left join progress_tracking pt
  on pt.user_id = e.user_id
 and pt.lesson_id = :lesson_id
where e.user_id = auth.uid();
```

### Evaluación sin respuestas correctas
```sql
select
  q.id,
  q.prompt,
  q.question_type,
  o.id as option_id,
  o.option_text
from evaluation_questions q
left join evaluation_options o on o.question_id = q.id
where q.evaluation_id = :evaluation_id
order by q.position, o.id;
```

### Certificado público
```sql
select
  verification_code,
  issued_at,
  public_status,
  course_id,
  user_id
from certificates
where verification_code = :code;
```

---

## 11. Resumen de lo que falta como RPC en Supabase
- `submit_evaluation`
- `can_enroll`
- `verify_certificate`
- `check_achievements`
- `issue_certificate`
- `reorder_modules`
- `save_video_timestamp`
- `mark_lesson_complete`
- `get_course_detail`
- `get_user_progress`

---

## 12. Observación final
Si vas a implementar la app de forma tradicional, este archivo te sirve como base de trabajo para:
- modelos
- servicios
- controladores
- rutas
- SQL/RPC en Supabase

La siguiente pieza natural es convertir estas consultas en un OpenAPI o en servicios de backend por módulo.
