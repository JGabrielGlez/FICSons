# System Contracts - SPEC-002 Backend API Core LMS

## 1. Objetivo
Definir los contratos funcionales externos e internos del backend LMS para Supabase o un espejo Express sin cambiar el contrato funcional.

## 2. Contratos de Edge Functions

### 2.1 `update-user-role`
- Purpose: Mutar roles con jerarquia numerica y auditoria.
- Input: JWT valido + `target_user_id`, `new_role`
- Output: `user_id`, `previous_role`, `new_role`, `updated_at`
- Security: impide elevacion indebida y autoasignacion.

### 2.2 `enroll-course`
- Purpose: Inscribir validando prerequisitos y estado del curso.
- Input: JWT valido + `course_id`
- Output: `enrollment_status`, `missing_prerequisites[]`
- Security: rechaza prerequisitos incompletos o ciclos.

### 2.3 `submit-evaluation`
- Purpose: Calificar intentos de evaluacion de forma segura.
- Input: JWT valido + `attempt_id`, `answers[]`
- Output: `score`, `passed`, `xp_earned`, `feedback`
- Security: solo server-side lee respuestas correctas; `is_correct` no sale al cliente.

### 2.4 `issue-certificate`
- Purpose: Emitir certificado o diploma verificable.
- Input: identidad con permisos + `user_id`, `course_id|learning_path_id`
- Output: `verification_code`, `certificate_url`, `issued_at`
- Security: genera artefacto privado con campos publicos limitados.

### 2.5 `check-achievements`
- Purpose: Calcular XP, badges y trofeos a partir de eventos.
- Input: `user_id`, `event_type`, `event_payload`
- Output: `xp_delta`, `badges_awarded[]`, `trophies_awarded[]`

### 2.6 `ai-chat`
- Purpose: Tutor socratico server-side.
- Input: JWT valido + `message`, `lesson_id`, `course_id`, `conversation_id`
- Output: stream SSE con respuesta socratica y metadatos
- Security: kill-switch durante evaluaciones activas y rate limit diario.

### 2.7 `ai-summarize`
- Purpose: Generar resumen cacheable de una leccion.
- Input: JWT valido + `lesson_id`, `course_id`, `force_regenerate`
- Output: `summary`, `key_points`, `glossary`, `cached`

### 2.8 `ai-generate-quiz`
- Purpose: Generar quiz de leccion con validacion server-side.
- Input: JWT valido de instructor + `lesson_id`, `question_count`, `difficulty`
- Output: quiz persistido con exactamente una respuesta correcta por pregunta

### 2.9 `ai-data-advisor`
- Purpose: Consulta conversacional de datos academicos.
- Input: JWT valido + query estructurada
- Output: respuesta estructurada y segura sobre datos permitidos

## 3. Contratos de RPC de Base de Datos

### 3.1 `verify_certificate(code)`
- Input: verification_code
- Output: solo datos publicos de validez
- Privacy: nunca expone el registro completo.

### 3.2 `can_enroll(user, course)`
- Input: user_id, course_id
- Output: `{ allowed: boolean, missing: course_id[] }`

### 3.3 `has_prerequisite_cycle(course, prereq)`
- Input: course_id, prerequisite_course_id
- Output: `true|false`
- Purpose: prevenir loops en prerequisitos antes de insertar.

## 4. Contratos de Realtime
- Canales permitidos: `notifications`, `progress_tracking`, `user_badges`, `user_trophies`, `evaluation_attempts`.
- Reglas: solo eventos autorizados por RLS; no publicar datos sensibles.

## 5. Contrato de Verificacion Publica
- Ruta funcional: `/certificates/:code`
- Comportamiento: devolver valido/invalido y datos publicos.
- Rate limit: limitar abuso por IP.

## 6. Criterios de Conformidad de Contratos
- Ningun contrato expone secretos o datos de evaluacion sensible.
- Todo contrato sensible requiere JWT valido y controles de rol/alcance.
- Todo contrato debe ser trazable con logs y metadatos de auditoria.