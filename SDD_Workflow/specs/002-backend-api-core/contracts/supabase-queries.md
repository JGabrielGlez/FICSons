# Supabase Queries Base - SPEC-002 Backend API Core LMS

Purpose: base de consultas para implementar el backend LMS en Supabase con RLS desde el inicio.

## 1. Auth / Usuarios
Tablas: `profiles`, `admin_scopes`
- `select * from profiles where id = auth.uid()`
- `insert into profiles (...) values (...)`
- `update profiles set ... where id = auth.uid()`
- `select * from admin_scopes where admin_user_id = auth.uid()`
- RPCs: `update_user_role(target_user_id, new_role)`, `get_user_profile(user_id)`

## 2. Courses
Tablas: `courses`, `course_instructors`, `modules`, `organizational_units`
- `select * from courses where status = 'published'`
- `select * from courses where id = :course_id`
- `insert into courses (...) values (...)`
- `update courses set ... where id = :course_id`
- `select * from course_instructors where course_id = :course_id`
- `insert into course_instructors (...) values (...)`
- `select * from modules where course_id = :course_id order by position`
- RPCs: `reorder_modules(course_id, ordered_module_ids)`, `get_course_detail(course_id)`

## 3. Lessons / Progress
Tablas: `lessons`, `content_sources`, `progress_tracking`
- `select * from lessons where module_id = :module_id order by position`
- `select * from content_sources where lesson_id = :lesson_id`
- `select * from progress_tracking where user_id = auth.uid() and lesson_id = :lesson_id`
- `insert into progress_tracking (...) values (...)`
- `update progress_tracking set progress_percent = :value, updated_at = now() ...`
- RPCs: `save_video_timestamp(user_id, lesson_id, timestamp)`, `mark_lesson_complete(user_id, lesson_id)`, `get_user_progress(user_id, course_id)`

## 4. Enrollment / Prerequisitos
Tablas: `enrollments`, `course_prerequisites`, `learning_paths`, `learning_path_courses`
- `select * from enrollments where user_id = auth.uid()`
- `insert into enrollments (...) values (...)`
- `select * from course_prerequisites where course_id = :course_id`
- `insert into course_prerequisites (...) values (...)`
- `delete from course_prerequisites where course_id = :course_id and prerequisite_course_id = :prerequisite_course_id`
- RPCs: `can_enroll(user_id, course_id)`, `has_prerequisite_cycle(course_id, prerequisite_course_id)`, `path_progress(user_id, path_id)`

## 5. Evaluations
Tablas: `evaluations`, `evaluation_questions`, `evaluation_options`, `evaluation_attempts`
- `select * from evaluations where course_id = :course_id and is_active = true`
- `select * from evaluation_questions where evaluation_id = :evaluation_id order by position`
- `select id, question_id, option_text from evaluation_options where question_id = :question_id`
- `select * from evaluation_attempts where user_id = auth.uid() and evaluation_id = :evaluation_id`
- RPCs: `submit_evaluation(evaluation_id, answers, attempt_context)`, `start_evaluation_attempt(user_id, evaluation_id)`, `get_quiz_options(question_id)` sin `is_correct`

## 6. Gamification / Certificados
Tablas: `badges`, `user_badges`, `trophies`, `user_trophies`, `certificates`, `diplomas`, `xp_events`
- `select * from badges`
- `select * from user_badges where user_id = auth.uid()`
- `select * from certificates where verification_code = :code`
- `select * from diplomas where user_id = auth.uid()`
- RPCs: `check_achievements(user_id, event_type, event_payload)`, `issue_certificate(user_id, course_id | learning_path_id)`, `verify_certificate(code)`

## 7. Notifications / Moderation
Tablas: `notifications`, `moderation_flags`
- `select * from notifications where user_id = auth.uid() order by created_at desc`
- `update notifications set read_at = now() where id = :notification_id and user_id = auth.uid()`
- `select * from moderation_flags where status = 'open' order by created_at desc`
- `update moderation_flags set status = 'resolved', resolved_by = auth.uid() where id = :flag_id`

## 8. IA / Operacion
Tablas: `ai_conversations`, `app_settings`, `ai_usage_events`
- `select * from ai_conversations where user_id = auth.uid() order by created_at desc`
- `select * from ai_usage_events where user_id = auth.uid() order by created_at desc`
- RPCs / funciones: `ai-chat`, `ai-summarize`, `ai-generate-quiz`, `ai-data-advisor`

## Security Notes
- `evaluation_options.is_correct` debe quedar fuera de todo SELECT publico.
- RLS debe bloquear acceso no autorizado aun si una consulta es conocida.
- Los RPCs sensibles deben correr con seguridad de servidor y logs de auditoria.
- El control de roles debe pasar por funciones dedicadas, nunca por update directo desde cliente.