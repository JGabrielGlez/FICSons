# API Contracts — SPEC-001

Purpose: Consolidar contratos existentes y rutas REST propuestas (implementación 100% sin IA posible). Incluye: (A) endpoints contractuales ya definidos en `system-contracts.md` y (B) rutas REST CRUD sugeridas por módulo para implementación práctica.

Sources:
- `specs/001-spec-fundacional/contracts/system-contracts.md`
- ` .drfic/diana-sdk/specs/002-spec-drfic.md` (module map & routes)

PRIORIDAD: ordenadas de mayor a menor importancia para el core de la app.

---

## 1. Usuarios / Auth (Core)

1.1 POST /api/auth/signup
- Propósito: Registrar usuario y crear perfil.
- Fuente: inferido (signup definido en module map).
- Headers: none
- Body: { "email": string, "password": string, "fullName": string, "role?": string }
- Response 201: { "user": { "id", "email", "fullName", "role" }, "token": string }
- Errores: 400 (validation), 409 (email exists)

1.2 POST /api/auth/login
- Propósito: Autenticación y obtención de JWT.
- Headers: none
- Body: { "email": string, "password": string }
- Response 200: { "user": {id,email,fullName,role}, "token": string, "expires_in": number }

1.3 GET /api/users/me
- Propósito: Perfil autenticado.
- Headers: Authorization: Bearer {JWT}
- Response 200: { id,email,fullName,role,profileFields... }

1.4 CRUD usuarios administrativos (inferred)
- GET /api/users[?page,limit,search,role]
- GET /api/users/:id
- PUT /api/users/:id
- DELETE /api/users/:id (soft-delete or deactivate)
- Headers: Authorization: Bearer {JWT (admin or scoped)}
- Responses: 200 list / 200 item / 200 updated / 204 deleted

---

## 2. Cursos (Module: `courses`)

2.1 GET /api/courses
- Propósito: Catálogo público con filtros.
- Query: ?q&page&limit&status&tags&org_unit
- Response 200: { items: [ { id, title, slug, status, difficulty, thumbnail } ], total }

2.2 GET /api/courses/:id
- Propósito: Detalle de curso.
- Response 200: { id,title,description,modules:[...],instructors:[...],prereq:[...] }

2.3 POST /api/instructor/courses
- Propósito: Crear curso (instructor).
- Headers: Authorization: Bearer {JWT (instructor)}
- Body: { title, slug, description, org_unit_id, difficulty, tags, thumbnail_url }
- Response 201: { id, ... }

2.4 PUT /api/instructor/courses/:id
2.5 DELETE /api/instructor/courses/:id
2.6 Team endpoints
- GET/POST /api/instructor/courses/:id/team
- Body for add: { user_id, role }

Nota: `reorder-modules` Edge Function (module map) → POST /api/courses/:id/reorder-modules { order: [moduleId...] }

---

## 3. Lecciones / Contenido / Progreso (Module: `lessons`)

3.1 GET /api/courses/:courseId/lessons
- Response: [ { id,title,content_type,duration,xp_reward } ]

3.2 GET /api/courses/:courseId/lessons/:id
- Response: { id,title,content_url,content_type,metadata }

3.3 POST /api/instructor/courses/:courseId/lessons
- Body: { title, content_type, content_url, xp_reward, prerequisites? }
- Response 201: { id, ... }

3.4 PUT /api/instructor/lessons/:id
3.5 DELETE /api/instructor/lessons/:id

3.6 POST /api/progress
- Propósito: Guardar progreso (cliente).
- Headers: Authorization: Bearer {JWT}
- Body: { courseId, lessonId, progress: { videoTime?, page?, slide? }, timestamp }
- Response 200: { saved: true }

3.7 POST /api/lessons/:id/mark-complete
- Response 200: { completed: true, xp_awarded }

Nota: `save-video-timestamp` (module map) puede implementarse como POST /api/lessons/:id/timestamp { time }

---

## 4. Inscripciones / Enrollment (Module: `enrollment`)

4.1 GET /api/enrollments (user)
- Headers: Authorization: Bearer {JWT}
- Response: [ { courseId, status, enrolled_at, progress_pct } ]

4.2 POST /api/enrollments
- Body: { courseId }
- Response 200: { enrollment_status: 'enrolled'|'blocked', missing_prerequisites: [] }

4.3 GET /api/courses/:id/can-enroll
- Query: ?userId optional (server uses JWT)
- Response 200: { allowed: boolean, missing: [course_ids] }

4.4 DELETE /api/enrollments/:id

Nota: RPC `can_enroll(user, course)` ya está definido en `system-contracts.md` (DB RPC).

---

## 5. Evaluaciones (Module: `evaluations`) — core, grading server-side

5.1 POST /api/instructor/courses/:courseId/evaluations
- Propósito: Crear evaluación (instructor).
- Body: { title, questions: [ { id?, text, type, options[] (no is_correct) } ], passing_score, max_attempts }
- Response 201: { evaluation_id }

5.2 GET /api/evaluations/:id
- Response: { id, title, questions WITHOUT is_correct }

5.3 POST /api/evaluations/:id/attempts
- Body: { context? }
- Response 201: { attempt_id, started_at, expires_at }

5.4 POST /api/evaluations/:id/submit
- Propósito: Envío de respuestas; grading en servidor.
- Headers: Authorization: Bearer {JWT}
- Body: { attempt_id, answers: [ { question_id, answer }] }
- Response 200: { attempt_id, score, passed, feedback_summary }
- Fuente contractual: `submit-evaluation` en `system-contracts.md` (security: grading only server/service role)

5.5 GET /api/users/:id/evaluation-history
- Response: [ { evaluation_title, attempts, best_score, passed, last_attempt_at } ]

---

## 6. Gamification & Certificados (Module: `gamification`)

6.1 POST /api/gamification/check-achievements
- Body: { user_id, event_type, event_payload }
- Response: { xp_delta, badges_awarded[], trophies_awarded[] }
- Fuente: `check-achievements` (system-contracts)

6.2 POST /api/certificates/issue
- Headers: Authorization: Bearer {JWT (issuer)}
- Body: { user_id, course_id | learning_path_id }
- Response 201: { verification_code, certificate_url, issued_at }
- Fuente: `issue-certificate` (system-contracts)

6.3 GET /api/certificates/:code
- Propósito: Verificación pública.
- Response 200: { valid: boolean, course_title, issued_at, public_fields }
- Nota: route `/certificates/:code` aparece en module map and contracts.

---

## 7. Notificaciones (Module: `notifications`)

7.1 GET /api/notifications[?unreadOnly]
- Headers: Authorization: Bearer {JWT}
- Response: [ { id,type,title,body,read,created_at } ]

7.2 POST /api/notifications/:id/mark-read
- Response 200

7.3 POST /api/notifications/send (internal/event)
- Body: { userId?, type, title, body, metadata }

Realtime channels: `notifications`, `progress_tracking`, `user_badges`, `user_trophies`, `evaluation_attempts` (as per contracts).

---

## 8. Admin (Module: `admin`)

8.1 PATCH /api/admin/users/:id/role
- Headers: Authorization: Bearer {JWT (admin/super_admin)}
- Body: { new_role }
- Response 200: { target_user_id, previous_role, new_role, updated_at }
- Fuente: `update-user-role` (system-contracts)

8.2 GET /api/admin/stats
- Response: { dau, wau, completion_rate, ai_costs? }

8.3 User management actions: impersonate, deactivate — implement as needed behind admin scope.

---

## 9. Moderation (Module: `moderation`)

9.1 GET /api/moderation/flags
- Headers: Authorization: Bearer {JWT (moderator)}
- Response: [ { id,type,target_type,target_id,reason,status,created_at } ]

9.2 POST /api/moderation/flags/:id/resolve
- Body: { action: 'resolved'|'dismissed', notes }
- Response 200

Note: moderators have read without edit over courses (module map).

---

## 10. (Opcional) IA Endpoints — marcar como OMITIR si 100% sin IA
- `ai-chat` (system-contracts) — POST /functions/v1/ai-chat (SSE)
- `ai-data-advisor` (spec 002) — POST /functions/v1/ai-data-advisor

Si se requiere 100% sin IA, omitir estos endpoints y deshabilitar variables/feature flags.

---

## Environment variables sugeridas (NoSQL / services)
- `USERS_DB_URI` - Usuarios (Mongo / other)
- `CONTENT_DB_URI` - Cursos / Lecciones
- `ENROLLMENT_DB_URI` - Enrollments (opcional)
- `EVALUATIONS_DB_URI` - Evaluations (opcional, aislamiento)
- `NOTIFICATIONS_DB_URI` or `REDIS_URL`
- `CERTS_STORAGE_URL`, `CERTS_STORAGE_KEY`
- `JWT_SECRET`, `JWT_EXPIRES_IN`
- `RATE_LIMIT_CONFIG` (optional)

---

## Observaciones y pasos siguientes
1. Los endpoints contractuales ya definidos en `system-contracts.md` (submit-evaluation, enroll-course, issue-certificate, update-user-role, check-achievements, verify_certificate, can_enroll) están marcados en este documento con la fuente correspondiente.
2. Las rutas CRUD detalladas son propuestas REST convencionales para implementar el flujo funcional descrito en `specs/002-spec-drfic.md` y deben formalizarse en OpenAPI para firmarlas.
3. Si confirmas stack (Express+Mongoose, Nest+TypeORM, etc.), puedo scaffoldear controllers/services/models y generar `openapi.yaml` para las rutas críticas.

---

Document generated from: `specs/001-spec-fundacional/contracts/system-contracts.md` and ` .drfic/diana-sdk/specs/002-spec-drfic.md`.
