# SPEC-003-TKT-LMS-003 — CONTRATO DE APIs + AI-CHAT + ARQUITECTURA NODE.JS/EXPRESS

Framework: Spec-Driven Development (GitHub Copilot Spec-Kit)
Estado: Activa
Autoridad: Subordinada estrictamente a `project_constitution.md` → `SPEC-001` → `SPEC-002`

- **Control de Cambios:** 003-ucc-lms
- **Ticket de Usuario:** 003-tkt-lms

---

## 0. AUTORIDAD CONSTITUCIONAL

Esta especificación extiende SPEC-001 y SPEC-002. Cubre tres responsabilidades:

1. **Parte A** — Contrato OpenAPI completo de las 16 Edge Functions del sistema
2. **Parte B** — Especificación técnica completa del Módulo 06 `ai-chat`
3. **Parte C** — Arquitectura Node.js + Express como implementación espejo manual

El contrato OpenAPI de la Parte A es **válido para ambas implementaciones** (Deno y Express). Solo cambia el runtime, nunca el contrato.

> **Nota Dr. Gabo:** Aprobación humana requerida antes de iniciar cualquier
> implementación de endpoints. Ningún agente escribe código sin que este
> ticket esté cerrado por Dr. Gabo.

---

# PARTE A — CONTRATO OPENAPI DE LAS 16 EDGE FUNCTIONS

---

## A.1 Convenciones Globales

### Base URLs

| Implementación | Base URL |
|---|---|
| Supabase Edge Functions (Deno) | `https://{project}.supabase.co/functions/v1` |
| Node.js + Express (manual) | `http://localhost:3000/api/v1` (dev) / `https://{dominio}/api/v1` (prod) |

### Headers Requeridos en Todas las Rutas Protegidas

```
Authorization: Bearer {JWT}     ← token de sesión Supabase Auth
Content-Type: application/json  ← siempre en requests con body
apikey: {SUPABASE_ANON_KEY}     ← solo en implementación Supabase
```

### Esquema de Errores Estándar

Todo error del sistema responde con este formato:

```json
{
  "error": {
    "code": "ERROR_CODE_SNAKE_UPPER",
    "message": "Descripción legible en español",
    "details": {}
  }
}
```

### Códigos de Error Globales

| Código HTTP | Error Code | Significado |
|---|---|---|
| 400 | `INVALID_BODY` | Body malformado o campos inválidos |
| 400 | `INVALID_UUID` | UUID con formato incorrecto |
| 401 | `AUTH_MISSING` | No hay JWT en el header |
| 401 | `AUTH_EXPIRED` | JWT expirado |
| 403 | `INSUFFICIENT_ROLE` | El rol del usuario no tiene permiso |
| 403 | `EVALUATION_ACTIVE` | Kill-switch: evaluación activa |
| 403 | `FEATURE_DISABLED` | Feature flag desactivado |
| 404 | `RESOURCE_NOT_FOUND` | El recurso solicitado no existe |
| 409 | `CONFLICT` | Conflicto de estado (ej. ciclo en prerequisitos) |
| 422 | `UNPROCESSABLE` | Datos válidos pero no procesables lógicamente |
| 429 | `RATE_LIMIT_EXCEEDED` | Límite de peticiones alcanzado |
| 500 | `INTERNAL_ERROR` | Error interno del servidor |
| 502 | `PROVIDER_ERROR` | Fallo del proveedor externo (Gemini, Resend) |

---

## A.2 MÓDULO 01 — AUTH

---

### API-001 — Actualizar Rol de Usuario

```
PATCH /update-user-role
```

**Propósito:** Único camino para cambiar el rol de un usuario en el sistema. Actualiza tanto `profiles.role` como `auth.users.raw_app_meta_data.user_role` (claim JWT). Enforza jerarquía numérica de roles: nadie puede asignar un rol superior al propio.

**Rol mínimo requerido:** `admin` (para asignar instructor/moderador/alumno) | `super_admin` (para asignar admin)

**Headers:**
```
Authorization: Bearer {JWT}    ← debe ser admin o super_admin
Content-Type: application/json
```

**Body (request):**
```json
{
  "target_user_id": "uuid",
  "new_role": "alumno | instructor | moderador | admin | super_admin"
}
```

**Response exitoso (200):**
```json
{
  "user_id": "uuid",
  "previous_role": "alumno",
  "new_role": "instructor",
  "updated_at": "2026-04-26T10:00:00Z"
}
```

**Errores específicos:**
```
403 INSUFFICIENT_ROLE     ← intenta asignar rol superior al propio
403 SELF_ROLE_CHANGE      ← intenta cambiar su propio rol
404 USER_NOT_FOUND        ← target_user_id no existe
422 SAME_ROLE             ← el usuario ya tiene ese rol
```

---

## A.3 MÓDULO 02 — COURSES

---

### API-002 — Reordenar Módulos de un Curso

```
PATCH /reorder-modules
```

**Propósito:** Permite al instructor reordenar los módulos de un curso de forma transaccional, evitando conflictos de `order_index` durante el intercambio de posiciones.

**Rol mínimo requerido:** `instructor` (owner o collaborator del curso)

**Headers:**
```
Authorization: Bearer {JWT}
Content-Type: application/json
```

**Body (request):**
```json
{
  "course_id": "uuid",
  "modules": [
    { "module_id": "uuid", "order_index": 1 },
    { "module_id": "uuid", "order_index": 2 },
    { "module_id": "uuid", "order_index": 3 }
  ]
}
```

**Response exitoso (200):**
```json
{
  "course_id": "uuid",
  "reordered_count": 3,
  "updated_at": "2026-04-26T10:00:00Z"
}
```

**Errores específicos:**
```
403 NOT_COURSE_INSTRUCTOR  ← no es instructor del curso
404 MODULE_NOT_FOUND       ← algún module_id no pertenece al curso
409 DUPLICATE_ORDER_INDEX  ← dos módulos con el mismo order_index
```

---

## A.4 MÓDULO 03 — LESSONS

---

### API-003 — Guardar Timestamp de Video

```
POST /save-video-timestamp
```

**Propósito:** Persiste el punto de reproducción actual de un video para permitir reanudación exacta. Se llama cada 5 segundos durante reproducción activa y en el evento `pause`/`ended`.

**Rol mínimo requerido:** `alumno` (enrolled en el curso)

**Headers:**
```
Authorization: Bearer {JWT}
Content-Type: application/json
```

**Body (request):**
```json
{
  "lesson_id": "uuid",
  "video_time": 125.3,
  "duration": 540.0,
  "provider": "youtube | vimeo"
}
```

**Response exitoso (200):**
```json
{
  "lesson_id": "uuid",
  "saved_at": "2026-04-26T10:00:00Z",
  "last_position": {
    "videoTime": 125.3,
    "duration": 540.0
  }
}
```

**Errores específicos:**
```
403 NOT_ENROLLED          ← usuario no inscrito en el curso
404 LESSON_NOT_FOUND      ← lesson_id no existe
422 INVALID_TIMESTAMP     ← video_time > duration
```

---

## A.5 MÓDULO 04 — ENROLLMENT

---

### API-004 — Inscribirse en un Curso

```
POST /enroll-course
```

**Propósito:** Verifica prerequisitos, valida que no exista inscripción previa y crea el registro de inscripción activa. Es el único camino para inscribirse — no existe INSERT directo a `enrollments` por el cliente.

**Rol mínimo requerido:** `alumno`

**Headers:**
```
Authorization: Bearer {JWT}
Content-Type: application/json
```

**Body (request):**
```json
{
  "course_id": "uuid"
}
```

**Response exitoso (201):**
```json
{
  "enrollment_id": "uuid",
  "course_id": "uuid",
  "user_id": "uuid",
  "status": "active",
  "enrolled_at": "2026-04-26T10:00:00Z"
}
```

**Errores específicos:**
```
409 ALREADY_ENROLLED          ← inscripción activa o completada ya existe
422 PREREQUISITES_NOT_MET     ← prerequisitos incompletos
  {
    "error": {
      "code": "PREREQUISITES_NOT_MET",
      "message": "Debes completar los siguientes cursos antes de inscribirte",
      "details": {
        "missing": [
          { "course_id": "uuid", "title": "Fundamentos de Programación", "min_score": 70 }
        ]
      }
    }
  }
404 COURSE_NOT_FOUND          ← course_id no existe
403 COURSE_NOT_PUBLISHED      ← el curso está en draft o archivado
```

---

### API-005 — Verificar Prerequisitos de un Curso

```
GET /course-prerequisites-check?course_id={uuid}
```

**Propósito:** Consulta si el usuario autenticado cumple los prerequisitos de un curso antes de mostrar el botón "Inscribirme". El frontend llama esto para renderizar el estado del botón (activo / bloqueado + tooltip).

**Rol mínimo requerido:** `alumno`

**Headers:**
```
Authorization: Bearer {JWT}
```

**Query params:**
```
course_id: uuid    ← requerido
```

**Response exitoso (200):**
```json
{
  "course_id": "uuid",
  "allowed": false,
  "missing": [
    {
      "course_id": "uuid",
      "title": "Fundamentos de Programación",
      "min_score": 70,
      "user_score": 55,
      "completed": false
    }
  ]
}
```

**Errores específicos:**
```
404 COURSE_NOT_FOUND    ← course_id no existe
```

---

## A.6 MÓDULO 05 — EVALUATIONS

---

### API-006 — Iniciar Intento de Evaluación

```
POST /start-evaluation
```

**Propósito:** Crea un nuevo intento de evaluación, verifica que no se exceda `max_attempts`, registra el inicio y devuelve las preguntas **sin** `is_correct`. Activa el kill-switch de IA en Edge Functions de chat.

**Rol mínimo requerido:** `alumno` (enrolled en el curso)

**Headers:**
```
Authorization: Bearer {JWT}
Content-Type: application/json
```

**Body (request):**
```json
{
  "evaluation_id": "uuid"
}
```

**Response exitoso (201):**
```json
{
  "attempt_id": "uuid",
  "evaluation_id": "uuid",
  "attempt_number": 2,
  "max_attempts": 3,
  "time_limit_minutes": 60,
  "started_at": "2026-04-26T10:00:00Z",
  "expires_at": "2026-04-26T11:00:00Z",
  "questions": [
    {
      "question_id": "uuid",
      "statement": "¿Cuál es la complejidad de un algoritmo de búsqueda binaria?",
      "question_type": "multiple_choice",
      "order_index": 1,
      "options": [
        { "option_id": "uuid", "option_text": "O(n)", "order_index": 1 },
        { "option_id": "uuid", "option_text": "O(log n)", "order_index": 2 },
        { "option_id": "uuid", "option_text": "O(n²)", "order_index": 3 }
      ]
    }
  ]
}
```

**Errores específicos:**
```
403 NOT_ENROLLED           ← no inscrito en el curso
409 MAX_ATTEMPTS_REACHED   ← intentos agotados
409 ATTEMPT_IN_PROGRESS    ← ya hay un intento activo sin completar
404 EVALUATION_NOT_FOUND   ← evaluation_id no existe
```

---

### API-007 — Enviar Respuestas de Evaluación

```
POST /submit-evaluation
```

**Propósito:** Recibe las respuestas del alumno, compara contra `is_correct` usando `service_role` (el cliente nunca ve las respuestas correctas), calcula el score, marca el intento como completado, desactiva el kill-switch de IA y dispara `check-achievements`.

**Rol mínimo requerido:** `alumno`

**Headers:**
```
Authorization: Bearer {JWT}
Content-Type: application/json
```

**Body (request):**
```json
{
  "attempt_id": "uuid",
  "answers": [
    {
      "question_id": "uuid",
      "selected_option_id": "uuid"
    },
    {
      "question_id": "uuid",
      "selected_option_id": "uuid"
    }
  ]
}
```

**Response exitoso (200):**
```json
{
  "attempt_id": "uuid",
  "score": 85.5,
  "passed": true,
  "passing_score": 70,
  "correct_answers": 17,
  "total_questions": 20,
  "xp_earned": 34,
  "completed_at": "2026-04-26T10:45:00Z",
  "feedback": [
    {
      "question_id": "uuid",
      "correct": true,
      "explanation": "O(log n) es correcto porque en cada paso se descarta la mitad del espacio de búsqueda."
    }
  ]
}
```

**Errores específicos:**
```
404 ATTEMPT_NOT_FOUND      ← attempt_id no existe o no pertenece al usuario
409 ATTEMPT_ALREADY_DONE   ← el intento ya fue enviado
422 ATTEMPT_EXPIRED        ← el tiempo límite se agotó
422 MISSING_ANSWERS        ← faltan respuestas de preguntas obligatorias
```

---

## A.7 MÓDULO 06 — AI-CHAT

---

### API-008 — Chat con Tutor IA (Streaming SSE)

```
POST /ai-chat
```

**Propósito:** Proxy socrático hacia Gemini 2.5 Flash. Inyecta el contexto de la lección en el system prompt, aplica rate limit, verifica kill-switch de evaluación activa y devuelve la respuesta en streaming SSE. El alumno nunca llama a Gemini directamente.

**Rol mínimo requerido:** `alumno` (enrolled en el curso de la lección)

**Headers:**
```
Authorization: Bearer {JWT}
Content-Type: application/json
Accept: text/event-stream         ← requerido para SSE
```

**Body (request):**
```json
{
  "message": "No entiendo por qué usamos recursión aquí",
  "lesson_id": "uuid",
  "course_id": "uuid",
  "conversation_id": "uuid | null"
}
```

**Response exitoso — Stream SSE (200):**
```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive

event: meta
data: {"conversation_id": "uuid", "tokens_used": 0}

event: chunk
data: {"text": "Buena pregunta. "}

event: chunk
data: {"text": "Pensemos juntos: ¿qué pasaría si intentaras resolver este problema sin recursión?"}

event: done
data: {"total_tokens": 312, "conversation_id": "uuid"}
```

**Errores SSE (enviados como evento `error` en el stream):**
```
event: error
data: {"code": "EVALUATION_ACTIVE", "message": "El asistente está desactivado durante una evaluación activa."}

event: error
data: {"code": "RATE_LIMIT_EXCEEDED", "message": "Alcanzaste el límite de 60 consultas diarias. Reinicia mañana."}

event: error
data: {"code": "PROVIDER_ERROR", "message": "El servicio de IA no está disponible temporalmente."}
```

**Errores HTTP (antes de abrir el stream):**
```
401 AUTH_MISSING
403 EVALUATION_ACTIVE
403 NOT_ENROLLED
429 RATE_LIMIT_EXCEEDED
```

---

### API-009 — Generar Resumen de Lección

```
POST /ai-summarize
```

**Propósito:** Genera un resumen estructurado de una lección con puntos clave y glosario. El resultado se cachea en `ai_lesson_summaries` — si ya existe un resumen válido, se devuelve sin llamar a Gemini.

**Rol mínimo requerido:** `alumno` (enrolled)

**Headers:**
```
Authorization: Bearer {JWT}
Content-Type: application/json
```

**Body (request):**
```json
{
  "lesson_id": "uuid",
  "course_id": "uuid",
  "force_regenerate": false
}
```

**Response exitoso (200):**
```json
{
  "lesson_id": "uuid",
  "summary": "En esta lección aprendiste los fundamentos de la recursión...",
  "key_points": [
    "La recursión requiere un caso base para detenerse",
    "Cada llamada recursiva reduce el problema",
    "El stack de llamadas tiene un límite de profundidad"
  ],
  "glossary": [
    { "term": "Caso base", "definition": "Condición que detiene la recursión" },
    { "term": "Stack overflow", "definition": "Error cuando la recursión es demasiado profunda" }
  ],
  "cached": true,
  "generated_at": "2026-04-25T08:00:00Z"
}
```

**Errores específicos:**
```
403 EVALUATION_ACTIVE     ← kill-switch activo
403 NOT_ENROLLED          ← no inscrito
404 LESSON_NOT_FOUND      ← lesson_id no existe
502 PROVIDER_ERROR        ← Gemini no disponible
```

---

### API-010 — Generar Quiz desde Contenido de Lección

```
POST /ai-generate-quiz
```

**Propósito:** Genera un conjunto de preguntas de opción múltiple basadas en el contenido de una lección. Usa `gemini-2.5-flash-lite` para reducir costo. Valida server-side que exactamente 1 opción sea correcta por pregunta antes de persistir.

**Rol mínimo requerido:** `instructor` (owner o collaborator del curso)

**Headers:**
```
Authorization: Bearer {JWT}
Content-Type: application/json
```

**Body (request):**
```json
{
  "lesson_id": "uuid",
  "question_count": 10,
  "difficulty": "basic | intermediate | advanced",
  "bloom_levels": ["remember", "understand", "apply"]
}
```

**Response exitoso (201):**
```json
{
  "lesson_id": "uuid",
  "generated_count": 10,
  "questions": [
    {
      "statement": "¿Cuál de los siguientes es un caso base válido para calcular el factorial?",
      "difficulty": "basic",
      "bloom_level": "remember",
      "explanation": "factorial(0) = 1 es el caso base estándar",
      "options": [
        { "text": "factorial(0) = 1", "is_correct": true },
        { "text": "factorial(1) = 0", "is_correct": false },
        { "text": "factorial(n) = n", "is_correct": false },
        { "text": "factorial(-1) = 1", "is_correct": false }
      ]
    }
  ]
}
```

**Errores específicos:**
```
403 NOT_COURSE_INSTRUCTOR  ← no es instructor del curso
404 LESSON_NOT_FOUND       ← lesson_id no existe
422 INVALID_QUESTION_COUNT ← question_count fuera del rango 1–30
422 QUIZ_VALIDATION_FAILED ← la IA generó preguntas con ≠1 respuesta correcta
502 PROVIDER_ERROR         ← Gemini no disponible
```

---

## A.8 MÓDULO 07 — AI-DATA-ADVISOR

---

### API-011 — Consulta Conversacional de Datos (Streaming SSE)

```
POST /ai-data-advisor
```

**Propósito:** Interpreta preguntas en lenguaje natural sobre datos académicos del usuario. Clasifica la intención, ejecuta RPCs de solo lectura RLS-scoped, construye el contexto para Gemini y devuelve una respuesta estructurada que el frontend renderiza como texto, tabla, gráfica o roadmap. Nunca escribe en la base de datos.

**Rol mínimo requerido:** `alumno`

**Headers:**
```
Authorization: Bearer {JWT}
Content-Type: application/json
Accept: text/event-stream
```

**Body (request):**
```json
{
  "query": "Dame el roadmap para pasar el curso de Desarrollo Web",
  "context": {
    "current_course_id": "uuid | null",
    "current_lesson_id": "uuid | null",
    "conversation_id": "uuid | null"
  }
}
```

**Response exitoso — Stream SSE (200):**
```
event: meta
data: {"conversation_id": "uuid", "intent": "course_roadmap", "rpcs_executed": ["get_course_roadmap"]}

event: chunk
data: {"text": "Aquí tienes tu roadmap para Desarrollo Web: "}

event: structured
data: {
  "response_type": "roadmap",
  "roadmap": {
    "title": "Roadmap: Desarrollo Web",
    "overall_pct": 45,
    "sections": [
      {
        "title": "Módulo 1: HTML y CSS",
        "status": "completed",
        "items": [
          { "label": "Introducción a HTML", "status": "done", "type": "lesson", "xp_reward": 10 },
          { "label": "Quiz HTML Básico", "status": "done", "type": "evaluation", "score": 90 }
        ]
      },
      {
        "title": "Módulo 2: JavaScript",
        "status": "in_progress",
        "items": [
          { "label": "Variables y tipos", "status": "done", "type": "lesson", "xp_reward": 10 },
          { "label": "Funciones", "status": "pending", "type": "lesson", "xp_reward": 10 },
          { "label": "Quiz JavaScript", "status": "locked", "type": "evaluation" }
        ]
      }
    ]
  },
  "suggested_queries": [
    "¿Cuánto XP me falta para subir de nivel?",
    "¿Cómo me ha ido en los exámenes?",
    "¿Qué cursos necesito para completar mi ruta?"
  ]
}

event: done
data: {"total_tokens": 890, "cost_usd": 0.003}
```

**Errores específicos:**
```
403 EVALUATION_ACTIVE      ← kill-switch activo
429 RATE_LIMIT_EXCEEDED    ← más de 30 consultas/día
422 INTENT_UNCLASSIFIED    ← la IA no pudo clasificar la consulta
502 PROVIDER_ERROR         ← Gemini no disponible
```

---

## A.9 MÓDULO 08 — GAMIFICATION

---

### API-012 — Verificar y Otorgar Logros

```
POST /check-achievements
```

**Propósito:** Evaluación idempotente de logros tras cada evento significativo (completar lección, aprobar evaluación, actualizar racha, completar curso). Otorga XP, badges y trofeos según los criterios configurados. Emite notificaciones realtime.

**Uso:** Llamada interna entre Edge Functions. No se expone directamente al cliente.

**Headers:**
```
Authorization: Bearer {SERVICE_ROLE_KEY}   ← solo entre Edge Functions
Content-Type: application/json
```

**Body (request):**
```json
{
  "user_id": "uuid",
  "event_type": "lesson_completed | evaluation_passed | streak_updated | course_completed | path_completed | ai_chat",
  "event_data": {
    "lesson_id": "uuid",
    "course_id": "uuid",
    "score": 95,
    "attempt_number": 1
  }
}
```

**Response exitoso (200):**
```json
{
  "user_id": "uuid",
  "xp_awarded": 45,
  "new_total_xp": 1250,
  "level_up": false,
  "badges_awarded": [
    { "badge_code": "PERFECT_SCORE", "badge_name": "Puntuación Perfecta", "xp_bonus": 10 }
  ],
  "trophies_awarded": [],
  "notifications_sent": 2
}
```

---

### API-013 — Emitir Certificado

```
POST /issue-certificate
```

**Propósito:** Verifica que el alumno completó el curso con score >= `passing_score`, genera el PDF del certificado con `@react-pdf/renderer`, lo sube a Supabase Storage (bucket `certificates`, privado), inserta el registro en `certificates` con código de verificación único y devuelve la signed URL con TTL de 24h.

**Rol mínimo requerido:** `alumno` (enrollment completado)

**Headers:**
```
Authorization: Bearer {JWT}
Content-Type: application/json
```

**Body (request):**
```json
{
  "course_id": "uuid"
}
```

**Response exitoso (201):**
```json
{
  "certificate_id": "uuid",
  "verification_code": "A3F7K2P9",
  "course_title": "Desarrollo Web Completo",
  "issued_at": "2026-04-26T10:00:00Z",
  "download_url": "https://...supabase.co/storage/v1/object/sign/certificates/...",
  "download_url_expires_at": "2026-04-27T10:00:00Z",
  "verify_url": "https://lms.escuela.edu/certificates/A3F7K2P9"
}
```

**Errores específicos:**
```
404 ENROLLMENT_NOT_FOUND    ← no está inscrito en el curso
422 COURSE_NOT_COMPLETED    ← enrollment.status != 'completed'
422 SCORE_BELOW_PASSING     ← score < passing_score del curso
409 CERTIFICATE_EXISTS      ← ya existe un certificado para este curso
502 PDF_GENERATION_ERROR    ← fallo al generar el PDF
```

---

### API-014 — Leaderboard

```
GET /leaderboard?type={global|weekly|monthly|course}&course_id={uuid}&limit={n}
```

**Propósito:** Devuelve el ranking de usuarios según XP. Los usuarios con `leaderboard_opt_in=false` aparecen como "Estudiante anónimo". Nunca expone email ni datos personales más allá del nombre visible.

**Rol mínimo requerido:** `alumno`

**Headers:**
```
Authorization: Bearer {JWT}
```

**Query params:**
```
type: global | weekly | monthly | course    ← requerido
course_id: uuid                             ← requerido si type=course
limit: number (default: 50, max: 100)       ← opcional
```

**Response exitoso (200):**
```json
{
  "type": "weekly",
  "period": "2026-04-20 / 2026-04-26",
  "user_rank": 5,
  "total_participants": 87,
  "entries": [
    {
      "rank": 1,
      "display_name": "María García",
      "avatar_url": "https://...",
      "xp": 850,
      "level": 12,
      "is_self": false
    },
    {
      "rank": 5,
      "display_name": "Tú",
      "avatar_url": "https://...",
      "xp": 620,
      "level": 10,
      "is_self": true
    }
  ]
}
```

---

## A.10 MÓDULO 09 — ADMIN

---

### API-015 — Verificar Certificado (Público)

```
GET /verify-certificate?code={verification_code}
```

**Propósito:** Endpoint público (sin autenticación) para verificar la autenticidad de un certificado. Devuelve solo los campos públicos — nunca el registro completo ni datos privados del alumno. Rate-limit: 20 req/min por IP.

**Rol mínimo requerido:** Ninguno (público)

**Headers:**
```
(ninguno requerido)
```

**Query params:**
```
code: string    ← código de 8 caracteres del certificado
```

**Response exitoso (200):**
```json
{
  "valid": true,
  "holder_name": "Carlos Martínez López",
  "course_title": "Desarrollo Web Completo",
  "institution": "Instituto Tecnológico",
  "issued_at": "2026-03-15T00:00:00Z",
  "final_score": 92,
  "revoked": false
}
```

**Response certificado inválido (200):**
```json
{
  "valid": false,
  "reason": "Código de verificación no encontrado"
}
```

**Errores específicos:**
```
429 RATE_LIMIT_EXCEEDED    ← más de 20 req/min desde la misma IP
```

---

## A.11 MÓDULO 11 — NOTIFICATIONS

---

### API-016 — Marcar Notificaciones como Leídas

```
PATCH /notifications/read
```

**Propósito:** Marca una o todas las notificaciones del usuario autenticado como leídas. Actualiza `read_at` en la tabla `notifications`. El conteo del bell badge se actualiza vía Realtime automáticamente.

**Rol mínimo requerido:** `alumno` (cualquier usuario autenticado)

**Headers:**
```
Authorization: Bearer {JWT}
Content-Type: application/json
```

**Body (request):**
```json
{
  "notification_ids": ["uuid", "uuid"],
  "mark_all": false
}
```

**Response exitoso (200):**
```json
{
  "updated_count": 2,
  "unread_remaining": 5
}
```

---

## A.12 Resumen del Inventario de APIs

| # | Endpoint | Método | Módulo | Rol mínimo | Auth |
|---|---|---|---|---|---|
| API-001 | `/update-user-role` | PATCH | auth | admin | JWT |
| API-002 | `/reorder-modules` | PATCH | courses | instructor | JWT |
| API-003 | `/save-video-timestamp` | POST | lessons | alumno | JWT |
| API-004 | `/enroll-course` | POST | enrollment | alumno | JWT |
| API-005 | `/course-prerequisites-check` | GET | enrollment | alumno | JWT |
| API-006 | `/start-evaluation` | POST | evaluations | alumno | JWT |
| API-007 | `/submit-evaluation` | POST | evaluations | alumno | JWT |
| API-008 | `/ai-chat` | POST (SSE) | ai-chat | alumno | JWT |
| API-009 | `/ai-summarize` | POST | ai-chat | alumno | JWT |
| API-010 | `/ai-generate-quiz` | POST | ai-chat | instructor | JWT |
| API-011 | `/ai-data-advisor` | POST (SSE) | ai-data-advisor | alumno | JWT |
| API-012 | `/check-achievements` | POST | gamification | interno | service_role |
| API-013 | `/issue-certificate` | POST | gamification | alumno | JWT |
| API-014 | `/leaderboard` | GET | gamification | alumno | JWT |
| API-015 | `/verify-certificate` | GET | admin | público | ninguna |
| API-016 | `/notifications/read` | PATCH | notifications | alumno | JWT |

---

# PARTE B — ESPECIFICACIÓN COMPLETA: MÓDULO 06 `ai-chat`

---

## B.1 Objetivo del Módulo

Proveer un tutor socrático contextual a la lección activa. El alumno puede hacer preguntas sobre el contenido que está viendo y recibir orientación pedagógica que guía su comprensión sin revelar respuestas directas de evaluaciones.

---

## B.2 Componentes de UI

### `<AIChatWidget>`
Widget flotante en la página `/learn/:courseId/:lessonId`. Posición: esquina inferior derecha.

**Estados:**
- `collapsed` — solo botón flotante con ícono de chat
- `expanded` — panel de chat 380×500px con historial y input
- `disabled` — durante evaluación activa, muestra mensaje explicativo

**Props:**
```typescript
interface AIChatWidgetProps {
  courseId: string;
  lessonId: string;
  lessonTitle: string;
  evaluationActive: boolean;   // kill-switch desde el runner de evaluaciones
}
```

### `<ChatMessage>`
Renderiza mensajes del historial. Tipo `user` alineado a la derecha, tipo `assistant` a la izquierda con avatar de Ada. Soporte de markdown en mensajes del asistente.

### `<StreamingMessage>`
Renderiza el mensaje del asistente mientras llega el stream. Muestra cursor parpadeante al final. Se fusiona con `<ChatMessage>` cuando el stream termina.

---

## B.3 Estado Zustand — `useAIChatStore`

```typescript
// 🎓LMS: Manages AI chat state including streaming, history and abort control (EN)
// 🎓LMS: Gestiona el estado del chat IA incluyendo streaming, historial y control de abort (ES)
interface AIChatStore {
  // Estado
  conversationId: string | null;
  messages: ChatMessage[];
  isStreaming: boolean;
  isDisabled: boolean;        // kill-switch evaluación activa
  dailyUsageCount: number;
  abortController: AbortController | null;

  // Acciones
  sendMessage: (text: string, lessonId: string, courseId: string) => Promise<void>;
  cancelStream: () => void;
  clearConversation: () => void;
  setDisabled: (disabled: boolean) => void;
}
```

---

## B.4 Hook `useGeminiChat`

```typescript
// 🎓LMS: Custom hook that handles SSE streaming from ai-chat Edge Function (EN)
// 🎓LMS: Hook personalizado que maneja el streaming SSE desde la Edge Function ai-chat (ES)
// ⚠️LMS: Uses fetch + ReadableStream, NOT EventSource — EventSource doesn't support Auth headers (EN)
// ⚠️LMS: Usa fetch + ReadableStream, NO EventSource — EventSource no soporta headers de Auth (ES)
export function useGeminiChat(lessonId: string, courseId: string) {
  const store = useAIChatStore();

  const sendMessage = async (text: string) => {
    const abortController = new AbortController();
    store.setAbortController(abortController);
    store.setIsStreaming(true);

    // Agrega mensaje del usuario al historial
    store.addMessage({ role: 'user', content: text });

    // Agrega placeholder del asistente
    const placeholderId = store.addStreamingPlaceholder();

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({
          message: text,
          lesson_id: lessonId,
          course_id: courseId,
          conversation_id: store.conversationId,
        }),
        signal: abortController.signal,
      });

      // Parseo de stream SSE
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const frames = buffer.split('\n\n');
        buffer = frames.pop() ?? '';

        for (const frame of frames) {
          const eventLine = frame.split('\n').find(l => l.startsWith('event:'));
          const dataLine  = frame.split('\n').find(l => l.startsWith('data:'));
          if (!eventLine || !dataLine) continue;

          const event = eventLine.replace('event: ', '').trim();
          const data  = JSON.parse(dataLine.replace('data: ', '').trim());

          if (event === 'meta')       store.setConversationId(data.conversation_id);
          if (event === 'chunk')      store.appendToPlaceholder(placeholderId, data.text);
          if (event === 'done')       store.finalizeMessage(placeholderId);
          if (event === 'error')      store.setError(data.message);
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        store.setError('Error de conexión. Intenta de nuevo.');
      }
    } finally {
      store.setIsStreaming(false);
    }
  };

  return { sendMessage, cancelStream: store.cancelStream };
}
```

---

## B.5 Edge Function `ai-chat` — Flujo Interno

```
1. Verificar JWT → obtener user_id y role
2. Verificar kill-switch:
   SELECT id FROM evaluation_attempts
   WHERE user_id = $1 AND status = 'in_progress'
   LIMIT 1
   → Si existe → SSE event:error EVALUATION_ACTIVE → cerrar stream

3. Verificar rate limit:
   SELECT COUNT(*) FROM ai_usage_events
   WHERE user_id = $1
     AND feature = 'chat'
     AND created_at >= now() - interval '24 hours'
   → Si >= 60 → SSE event:error RATE_LIMIT_EXCEEDED → cerrar stream

4. Cargar contexto de lección:
   SELECT l.title, l.content_type, cs.metadata,
          COALESCE(als.summary, '') as lesson_summary
   FROM lessons l
   LEFT JOIN content_sources cs ON cs.lesson_id = l.id
   LEFT JOIN ai_lesson_summaries als ON als.lesson_id = l.id
   WHERE l.id = $lesson_id

5. Cargar historial de conversación (últimos 10 mensajes):
   SELECT messages FROM ai_conversations
   WHERE id = $conversation_id AND user_id = $user_id

6. Si messages.length > 30:
   → Resumir los 20 más viejos con gemini-2.5-flash-lite
   → Reemplazar en ai_conversations.messages

7. Construir system prompt con contexto de lección

8. Llamar Gemini 2.5 Flash con generateContentStream()

9. SSE event:meta → enviar conversation_id al cliente

10. Por cada chunk de Gemini:
    → SSE event:chunk → enviar texto al cliente

11. Al completar:
    → Persistir mensaje en ai_conversations.messages
    → Registrar en ai_usage_events (feature='chat', tokens, cost_usd)
    → SSE event:done

12. Registrar en audit log
```

---

## B.6 Manejo del Rolling Summary

```typescript
// 🎓LMS: Compresses old messages to stay within Gemini context window (EN)
// 🎓LMS: Comprime mensajes viejos para mantenerse dentro del context window de Gemini (ES)
// 💡LMS: Uses flash-lite for summarization to reduce cost (3x cheaper than flash) (EN)
// 💡LMS: Usa flash-lite para resumir y reducir costo (3x más barato que flash) (ES)
async function compressConversationHistory(messages: ChatMessage[]): Promise<ChatMessage[]> {
  if (messages.length <= 30) return messages;

  const toCompress = messages.slice(0, 20);
  const toKeep     = messages.slice(20);

  const summaryPrompt = `Resume esta conversación de tutoría en máximo 150 palabras,
    preservando los conceptos clave discutidos y el nivel de comprensión del alumno:\n
    ${toCompress.map(m => `${m.role}: ${m.content}`).join('\n')}`;

  const summaryResponse = await geminiLite.generateContent(summaryPrompt);
  const summary = summaryResponse.response.text();

  return [
    { role: 'system', content: `[Resumen de conversación anterior]: ${summary}` },
    ...toKeep,
  ];
}
```

---

# PARTE C — ARQUITECTURA NODE.JS + EXPRESS (IMPLEMENTACIÓN ESPEJO)

---

## C.1 Propósito

Implementación manual del mismo contrato de APIs definido en la Parte A, usando Node.js + Express. Sirve para:

- Aprender el patrón estructurado Modelo → Servicio → Controlador → Ruteo de forma explícita
- Tener un backend independiente de Supabase como plataforma (se conecta a Supabase solo como DB)
- Cubrir los requisitos académicos del ejercicio del Dr. FIC (puntos A–G)
- Operar en paralelo con la implementación Deno — mismo contrato OpenAPI, diferente runtime

---

## C.2 Estructura de Carpetas del Backend Express

```
backend/
├── src/
│   ├── config/
│   │   ├── supabase.ts          ← cliente Supabase con service role key
│   │   ├── env.ts               ← validación de variables de entorno con Zod
│   │   └── gemini.ts            ← cliente Google GenAI
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts   ← verifica JWT de Supabase
│   │   ├── role.middleware.ts   ← enforza rol mínimo requerido
│   │   ├── rateLimit.middleware.ts
│   │   └── killSwitch.middleware.ts  ← evalúa si hay evaluación activa
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.model.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.controller.ts
│   │   │   └── auth.routes.ts
│   │   │
│   │   ├── courses/
│   │   │   ├── courses.model.ts
│   │   │   ├── courses.service.ts
│   │   │   ├── courses.controller.ts
│   │   │   └── courses.routes.ts
│   │   │
│   │   ├── lessons/
│   │   │   ├── lessons.model.ts
│   │   │   ├── lessons.service.ts
│   │   │   ├── lessons.controller.ts
│   │   │   └── lessons.routes.ts
│   │   │
│   │   ├── enrollment/
│   │   │   ├── enrollment.model.ts
│   │   │   ├── enrollment.service.ts
│   │   │   ├── enrollment.controller.ts
│   │   │   └── enrollment.routes.ts
│   │   │
│   │   ├── evaluations/
│   │   │   ├── evaluations.model.ts
│   │   │   ├── evaluations.service.ts
│   │   │   ├── evaluations.controller.ts
│   │   │   └── evaluations.routes.ts
│   │   │
│   │   ├── ai-chat/
│   │   │   ├── aiChat.model.ts
│   │   │   ├── aiChat.service.ts
│   │   │   ├── aiChat.controller.ts
│   │   │   └── aiChat.routes.ts
│   │   │
│   │   ├── ai-data-advisor/
│   │   │   ├── advisor.model.ts
│   │   │   ├── advisor.service.ts
│   │   │   ├── advisor.controller.ts
│   │   │   └── advisor.routes.ts
│   │   │
│   │   ├── gamification/
│   │   │   ├── gamification.model.ts
│   │   │   ├── gamification.service.ts
│   │   │   ├── gamification.controller.ts
│   │   │   └── gamification.routes.ts
│   │   │
│   │   └── notifications/
│   │       ├── notifications.model.ts
│   │       ├── notifications.service.ts
│   │       ├── notifications.controller.ts
│   │       └── notifications.routes.ts
│   │
│   ├── shared/
│   │   ├── errors/
│   │   │   ├── AppError.ts      ← clase base de errores del sistema
│   │   │   └── errorHandler.ts  ← middleware global de errores
│   │   ├── types/
│   │   │   └── index.ts         ← tipos compartidos entre módulos
│   │   └── utils/
│   │       ├── response.ts      ← helpers success() y error() estandarizados
│   │       └── logger.ts        ← wrapper de Sentry + console
│   │
│   └── server.ts                ← entry point — registra rutas y middlewares
│
├── .env                         ← variables de entorno (nunca en git)
├── .env.example                 ← template sin valores reales
├── package.json
├── tsconfig.json
└── README.md
```

---

## C.3 Patrón Modelo → Servicio → Controlador → Ruteo

### Modelo (`*.model.ts`)
Define las interfaces TypeScript y los schemas Zod de validación. No contiene lógica de negocio ni acceso a DB.

```typescript
// 🎓LMS: Defines data shapes and validation schemas for the enrollment module (EN)
// 🎓LMS: Define las formas de datos y schemas de validación para el módulo de inscripción (ES)
import { z } from 'zod';

export const EnrollCourseSchema = z.object({
  course_id: z.string().uuid('course_id debe ser un UUID válido'),
});

export type EnrollCourseInput  = z.infer<typeof EnrollCourseSchema>;
export type EnrollmentResponse = {
  enrollment_id: string;
  course_id: string;
  user_id: string;
  status: 'active';
  enrolled_at: string;
};
```

### Servicio (`*.service.ts`)
Contiene toda la lógica de negocio. Habla con Supabase, verifica reglas, ejecuta RPCs. No conoce Express (sin `req`/`res`).

```typescript
// 🎓LMS: Contains business logic for enrollment — prerequisite check and enrollment creation (EN)
// 🎓LMS: Contiene la lógica de negocio de inscripción — verificación de prereqs y creación (ES)
// 🔒LMS: Uses service role to read is_correct and check prerequisites server-side (EN)
// 🔒LMS: Usa service role para leer is_correct y verificar prerequisitos en el servidor (ES)
export class EnrollmentService {
  async enrollUser(userId: string, courseId: string): Promise<EnrollmentResponse> {
    // 1. Verificar prerequisitos via RPC
    const { data: prereqCheck } = await supabase
      .rpc('can_enroll', { p_user: userId, p_course: courseId });

    if (!prereqCheck.allowed) {
      throw new AppError('PREREQUISITES_NOT_MET', 422, {
        missing: prereqCheck.missing
      });
    }

    // 2. Verificar inscripción existente
    const { data: existing } = await supabase
      .from('enrollments')
      .select('id, status')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    if (existing) throw new AppError('ALREADY_ENROLLED', 409);

    // 3. Crear inscripción
    const { data: enrollment, error } = await supabase
      .from('enrollments')
      .insert({ user_id: userId, course_id: courseId, status: 'active' })
      .select()
      .single();

    if (error) throw new AppError('INTERNAL_ERROR', 500);

    return enrollment;
  }
}
```

### Controlador (`*.controller.ts`)
Traduce entre Express (`req`/`res`) y el Servicio. Valida el body con Zod, llama al servicio y responde. No contiene lógica de negocio.

```typescript
// 🎓LMS: Translates Express request/response to service calls (EN)
// 🎓LMS: Traduce el request/response de Express a llamadas al servicio (ES)
export class EnrollmentController {
  constructor(private service: EnrollmentService) {}

  enrollCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = EnrollCourseSchema.safeParse(req.body);
      if (!parsed.success) {
        return next(new AppError('INVALID_BODY', 400, parsed.error.flatten()));
      }

      const result = await this.service.enrollUser(
        req.user.id,           // inyectado por auth.middleware
        parsed.data.course_id
      );

      return res.status(201).json(success(result));
    } catch (err) {
      next(err);
    }
  };
}
```

### Ruteo (`*.routes.ts`)
Registra los endpoints y asocia middlewares específicos del módulo.

```typescript
// 🎓LMS: Registers enrollment routes with auth and role guards (EN)
// 🎓LMS: Registra las rutas de inscripción con guards de auth y rol (ES)
import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { roleMiddleware } from '../../middleware/role.middleware';
import { EnrollmentService }    from './enrollment.service';
import { EnrollmentController } from './enrollment.controller';

const router = Router();
const controller = new EnrollmentController(new EnrollmentService());

router.post(
  '/enroll-course',
  authMiddleware,
  roleMiddleware(['alumno', 'instructor', 'admin', 'super_admin']),
  controller.enrollCourse
);

router.get(
  '/course-prerequisites-check',
  authMiddleware,
  roleMiddleware(['alumno', 'instructor', 'admin', 'super_admin']),
  controller.checkPrerequisites
);

export default router;
```

---

## C.4 Server Principal (`server.ts`)

```typescript
// 🎓LMS: Main Express server — registers all module routes and global middleware (EN)
// 🎓LMS: Servidor Express principal — registra todas las rutas de módulos y middleware global (ES)
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './shared/errors/errorHandler';
import authRoutes         from './modules/auth/auth.routes';
import coursesRoutes      from './modules/courses/courses.routes';
import lessonsRoutes      from './modules/lessons/lessons.routes';
import enrollmentRoutes   from './modules/enrollment/enrollment.routes';
import evaluationsRoutes  from './modules/evaluations/evaluations.routes';
import aiChatRoutes       from './modules/ai-chat/aiChat.routes';
import advisorRoutes      from './modules/ai-data-advisor/advisor.routes';
import gamificationRoutes from './modules/gamification/gamification.routes';
import notificationsRoutes from './modules/notifications/notifications.routes';

const app = express();

// Middleware global
app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') }));
app.use(express.json());

// Rutas por módulo
const BASE = '/api/v1';
app.use(BASE, authRoutes);
app.use(BASE, coursesRoutes);
app.use(BASE, lessonsRoutes);
app.use(BASE, enrollmentRoutes);
app.use(BASE, evaluationsRoutes);
app.use(BASE, aiChatRoutes);
app.use(BASE, advisorRoutes);
app.use(BASE, gamificationRoutes);
app.use(BASE, notificationsRoutes);

// Error handler global (siempre al final)
app.use(errorHandler);

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => console.log(`🎓LMS API corriendo en puerto ${PORT}`));

export default app;
```

---

## C.5 Variables de Entorno del Backend Express

```bash
# .env.example — copiar a .env y completar con valores reales

# Supabase (conexión como DB externa)
SUPABASE_URL=https://{project}.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...    # NUNCA exponer al cliente

# IA
GEMINI_API_KEY=AIza...              # NUNCA exponer al cliente

# Email
RESEND_API_KEY=re_...               # NUNCA exponer al cliente

# Servidor
PORT=3000
ALLOWED_ORIGINS=http://localhost:5173,https://lms.escuela.edu
NODE_ENV=development

# Límites de IA
ADVISOR_DAILY_LIMIT=30
CHAT_DAILY_LIMIT=60
ADVISOR_ENABLED=true

# Sentry
SENTRY_DSN=https://...
```

---

## C.6 Mapeo Edge Function → Módulo Express

| API | Supabase Edge Function | Módulo Express | Archivo de Controlador |
|---|---|---|---|
| API-001 | `update-user-role` | `auth` | `auth.controller.ts` |
| API-002 | `reorder-modules` | `courses` | `courses.controller.ts` |
| API-003 | `save-video-timestamp` | `lessons` | `lessons.controller.ts` |
| API-004 | `enroll-course` | `enrollment` | `enrollment.controller.ts` |
| API-005 | `course-prerequisites-check` | `enrollment` | `enrollment.controller.ts` |
| API-006 | `start-evaluation` | `evaluations` | `evaluations.controller.ts` |
| API-007 | `submit-evaluation` | `evaluations` | `evaluations.controller.ts` |
| API-008 | `ai-chat` | `ai-chat` | `aiChat.controller.ts` |
| API-009 | `ai-summarize` | `ai-chat` | `aiChat.controller.ts` |
| API-010 | `ai-generate-quiz` | `ai-chat` | `aiChat.controller.ts` |
| API-011 | `ai-data-advisor` | `ai-data-advisor` | `advisor.controller.ts` |
| API-012 | `check-achievements` | `gamification` | `gamification.controller.ts` |
| API-013 | `issue-certificate` | `gamification` | `gamification.controller.ts` |
| API-014 | `leaderboard` | `gamification` | `gamification.controller.ts` |
| API-015 | `verify-certificate` | `gamification` | `gamification.controller.ts` |
| API-016 | `notifications/read` | `notifications` | `notifications.controller.ts` |

---

## C.7 Stack del Backend Express

| Tecnología | Versión | Rol |
|---|---|---|
| **Node.js** | 20 LTS | Runtime |
| **Express** | 4+ | Framework HTTP |
| **TypeScript** | 5+ | Lenguaje |
| **Zod** | 3+ | Validación de schemas (compartidos con frontend) |
| **supabase-js** | 2+ | Cliente hacia Supabase como DB |
| **@google/genai** | 1+ | SDK Gemini (solo para módulos IA) |
| **cors** | latest | Control de origen |
| **helmet** | latest | Headers de seguridad HTTP |
| **express-rate-limit** | latest | Rate limiting por IP |
| **pnpm** | latest | Package manager |
| **tsx** | latest | Ejecución TypeScript en desarrollo |
| **Sentry Node SDK** | latest | Error tracking |

---

## 99. DECLARACIÓN FINAL

Este documento cubre los tres gaps identificados tras SPEC-002:

1. ✅ **Contrato OpenAPI completo** — 16 endpoints con propósito, headers, body, response y errores
2. ✅ **Spec completa de `ai-chat`** — componentes, estado Zustand, hook SSE, flujo interno de Edge Function y rolling summary
3. ✅ **Arquitectura Node.js + Express** — estructura de carpetas, patrón Modelo → Servicio → Controlador → Ruteo, server principal y mapeo completo de endpoints

**El contrato de APIs (Parte A) es el contrato único** — válido para Supabase Edge Functions y para el backend Express. Ambas implementaciones deben producir exactamente los mismos requests y responses.

---

**Estado:** ✅ Activa
**Versión:** 1.0
**Rol:** Contrato de APIs + Spec ai-chat + Arquitectura Express
**Framework:** Spec-Driven Development (SpecKit / OpenSpec)
**Documentos superiores:** `project_constitution.md` → `SPEC-001` → `SPEC-002`
**Blueprint técnico:** `Investigacion.md`
**Aprobación humana:** Dr. Gabo
