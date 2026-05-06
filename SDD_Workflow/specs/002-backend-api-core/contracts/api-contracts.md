# API Contracts - SPEC-002 Backend API Core LMS

Purpose: formalizar los contratos backend por modulo para Supabase Edge Functions o un espejo Node.js/Express con el mismo esquema.

## 1. Auth / Profile
- POST `/api/auth/signup`
- POST `/api/auth/login`
- GET `/api/users/me`
- PATCH `/api/admin/users/:id/role`

## 2. Courses
- GET `/api/courses`
- GET `/api/courses/:id`
- POST `/api/instructor/courses`
- PUT `/api/instructor/courses/:id`
- DELETE `/api/instructor/courses/:id`
- GET/POST `/api/instructor/courses/:id/team`
- POST `/api/courses/:id/reorder-modules`

## 3. Lessons / Progress
- GET `/api/courses/:courseId/lessons`
- GET `/api/courses/:courseId/lessons/:id`
- POST `/api/instructor/courses/:courseId/lessons`
- PUT `/api/instructor/lessons/:id`
- DELETE `/api/instructor/lessons/:id`
- POST `/api/progress`
- POST `/api/lessons/:id/mark-complete`
- POST `/api/lessons/:id/timestamp`

## 4. Enrollment / Prerequisites
- POST `/api/enrollments`
- GET `/api/enrollments`
- GET `/api/courses/:id/can-enroll`
- GET `/api/course-prerequisites-check?course_id={uuid}`

## 5. Evaluations
- POST `/api/instructor/courses/:courseId/evaluations`
- GET `/api/evaluations/:id`
- POST `/api/evaluations/:id/attempts`
- POST `/api/evaluations/:id/submit`
- GET `/api/users/:id/evaluation-history`

## 6. AI
- POST `/api/ai-chat`
- POST `/api/ai-summarize`
- POST `/api/ai-generate-quiz`
- POST `/api/ai-data-advisor`

## 7. Gamification / Certificates
- POST `/api/gamification/check-achievements`
- POST `/api/certificates/issue`
- GET `/api/certificates/:code`

## 8. Notifications / Moderation / Admin
- GET `/api/notifications`
- POST `/api/notifications/:id/mark-read`
- GET `/api/admin/stats`
- GET `/api/moderation/flags`
- POST `/api/moderation/flags/:id/resolve`

## Contract Principles
- JWT requerido en rutas protegidas.
- Respuestas de error estandarizadas con code, message y details.
- `is_correct` nunca sale en respuestas de cliente.
- La IA nunca se invoca sin verificacion server-side de evaluacion activa.
- La verificacion publica de certificados solo expone campos publicos.
- Todo cambio de rol pasa por `update-user-role`.

## Notes
- Estos contratos definen el backend canónico; el espejo Express debe reproducirlos sin cambiar payloads funcionales.
- Si se formaliza OpenAPI mas adelante, este documento debe ser la base del esquema.