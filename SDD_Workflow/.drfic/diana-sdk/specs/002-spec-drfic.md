# SPEC-002-TKT-LMS-002 — MODULE MAP + AI DATA ADVISOR

Framework: Spec-Driven Development (GitHub Copilot Spec-Kit)
Estado: Activa
Autoridad: Subordinada estrictamente a `project_constitution.md` y `SPEC-001-TKT-LMS-001.md`

- **Control de Cambios:** 002-ucc-lms
- **Ticket de Usuario:** 002-tkt-lms

---

## 0. AUTORIDAD CONSTITUCIONAL

Esta especificación deriva de la Constitución del Proyecto y de SPEC-001. Introduce:

1. El **Module Map completo** del sistema LMS — fuente de verdad sobre qué módulo contiene qué
2. La **especificación técnica de la feature `ai-data-advisor`** — capa conversacional de datos

Ante cualquier conflicto, prevalece `project_constitution.md` → `SPEC-001` → este documento.

> **Nota Dr. Gabo:** El rol de aprobación humana es **Dr. Gabo** en todo este proyecto.
> Cualquier referencia a `Dr.LMS` en documentos base se lee como **Dr. Gabo**.

---

# PARTE A — MODULE MAP DEL SISTEMA LMS

---

## A.1 Propósito del Module Map

El Module Map es el **mapa de navegación del sistema**. Define:

- Qué módulos existen y cuál es su responsabilidad exclusiva
- Qué features de la Constitución le corresponden a cada módulo
- Las dependencias duras entre módulos
- Las fronteras: qué NO le pertenece a cada módulo

Ningún agente escribe código sin saber primero en qué módulo trabaja y cuáles son sus fronteras.

---

## A.2 Los 11 Módulos del Sistema

### MÓDULO 01 — `auth`
**Responsabilidad:** Identidad, sesión y ciclo de vida del usuario autenticado.

| Elemento | Detalle |
|---|---|
| **Features constitucionales** | auth |
| **Tablas principales** | `profiles`, `admin_scopes` |
| **Edge Functions** | `update-user-role` |
| **Rutas** | `/login`, `/signup`, `/forgot-password`, `/verify-email`, `/unauthorized` |
| **Estado Zustand** | `useAuthStore` (session, profile, isHydrated) |

**Incluye:**
- Email/password + Google OAuth (Supabase Auth)
- Trigger `handle_new_user()` crea perfil automáticamente en signup
- Guards `ProtectedRoute`, `PublicOnlyRoute`, `RoleGate`
- Actualización de rol exclusivamente via Edge Function `update-user-role`
- Prevención de escalación de privilegios por RLS + comparación numérica de roles

**No incluye:**
- SSO/SAML (diferido)
- Gestión de unidades organizativas (→ Módulo 09 `admin`)

---

### MÓDULO 02 — `courses`
**Responsabilidad:** Catálogo, creación, publicación y gestión estructural de cursos.

| Elemento | Detalle |
|---|---|
| **Features constitucionales** | courses |
| **Tablas principales** | `courses`, `course_instructors`, `modules`, `organizational_units` |
| **Edge Functions** | `reorder-modules` |
| **Rutas** | `/courses`, `/courses/:slug`, `/instructor/courses/new`, `/instructor/courses/:id/edit`, `/instructor/courses/:id/team` |
| **Estado TanStack Query** | `useCourses`, `useCourseDetail`, `useCourseInstructors` |

**Incluye:**
- CRUD de cursos (owner + collaborators)
- Jerarquía institucional por `organizational_units`
- Catálogo con filtros (status, tags, org_unit, difficulty)
- Gestión del equipo de instructores (owner + N collaborators)
- Thumbnails en Supabase Storage

**No incluye:**
- Reproductores de contenido (→ Módulo 03 `lessons`)
- Inscripciones y progreso (→ Módulo 04 `enrollment`)
- Prerequisitos entre cursos (→ Módulo 04 `enrollment`)

---

### MÓDULO 03 — `lessons`
**Responsabilidad:** Reproductor de lecciones, visores de contenido y tracking de progreso por lección.

| Elemento | Detalle |
|---|---|
| **Features constitucionales** | lessons |
| **Tablas principales** | `lessons`, `content_sources`, `progress_tracking` |
| **Edge Functions** | `save-video-timestamp` |
| **Rutas** | `/learn/:courseId/:lessonId` |
| **Estado Zustand** | `useProgressStore` (debounced autosave 500ms + flush en visibilitychange) |

**Incluye:**
- Cuatro visores lazy-loaded: `VideoPlayer`, `PDFViewer`, `PPTXViewer`, `WebNoteViewer`
- `ContentRouter` que selecciona visor según `content_type`
- Detección de proveedor por regex en `content-url-parser.ts`
- Tracking de progreso por tipo: `{videoTime}` / `{currentSlide, totalSlides}` / `{page}` / `{timeSpent}`
- `MarkCompleteButton` con validación de prerequisitos
- Background Sync para progreso offline (idb-keyval fallback)

**No incluye:**
- Evaluaciones embebidas (→ Módulo 05 `evaluations`)
- Chat IA (→ Módulo 06 `ai-chat`)
- AI Data Advisor (→ Módulo 07 `ai-data-advisor`)

---

### MÓDULO 04 — `enrollment`
**Responsabilidad:** Inscripciones, prerequisitos de cursos y rutas de aprendizaje.

| Elemento | Detalle |
|---|---|
| **Features constitucionales** | courses (enrollment layer), lessons (access control) |
| **Tablas principales** | `enrollments`, `course_prerequisites`, `learning_paths`, `learning_path_courses` |
| **Edge Functions** | `enroll-course`, `course-prerequisites-check` |
| **Rutas** | `/student/courses`, `/student/paths` |
| **RPCs** | `can_enroll(user, course)`, `path_progress(user, path)`, `has_prerequisite_cycle(course, prereq)` |

**Incluye:**
- RPC `can_enroll` → `{allowed: bool, missing: [course_ids]}` antes de renderizar botón
- Detección de ciclos con recursive CTE antes de insertar prerequisito
- Learning paths secuenciales/paralelos con `is_sequential`
- Lock icon + tooltip con títulos de cursos faltantes cuando `!allowed`
- Trigger sobre `enrollments` cuando `status='completed'` para encolar diplomas

**No incluye:**
- Grading de evaluaciones (→ Módulo 05 `evaluations`)
- Emisión de certificados (→ Módulo 08 `gamification`)

---

### MÓDULO 05 — `evaluations`
**Responsabilidad:** Builder, runner y grading seguro de evaluaciones.

| Elemento | Detalle |
|---|---|
| **Features constitucionales** | evaluations |
| **Tablas principales** | `evaluations`, `evaluation_questions`, `evaluation_options`, `evaluation_attempts` |
| **Edge Functions** | `start-evaluation`, `submit-evaluation` |
| **Rutas** | `/evaluation/:id`, `/instructor/courses/:id/evaluations` |
| **RPCs** | `app.get_quiz_options(question_id)` — devuelve opciones SIN `is_correct` |

**Incluye:**
- Builder UI de evaluaciones (instructor)
- Runner con timer, autosave de borrador en Zustand, control de intentos
- Edge Function `submit-evaluation` con `service_role` — único lugar donde se compara `is_correct`
- Kill-switch: el módulo `ai-chat` y `ai-data-advisor` se deshabilitan durante intento activo
- Borrador de intento persiste en Zustand; se vacía al completar o expirar

**No incluye:**
- Grading de respuestas abiertas por IA (diferido v2)
- Generación automática de quizzes (→ Módulo 06 `ai-chat`)

**Regla de seguridad crítica:**
`evaluation_options.is_correct` tiene política RLS que deniega SELECT para `authenticated`.
Solo el Edge Function `submit-evaluation` accede vía `service_role`.

---

### MÓDULO 06 — `ai-chat`
**Responsabilidad:** Tutor socrático con streaming SSE — asistencia pedagógica conversacional.

| Elemento | Detalle |
|---|---|
| **Features constitucionales** | ai-chat |
| **Tablas principales** | `ai_conversations` |
| **Edge Functions** | `ai-chat` (SSE), `ai-summarize`, `ai-generate-quiz` |
| **Rutas** | Widget flotante `<AIChatWidget>` en `/learn/:courseId/:lessonId` |
| **Estado Zustand** | `useAIChatStore` (mensajes, streaming state, abort controller) |

**Incluye:**
- Proxy Edge Function — frontend nunca llama Gemini directo
- Streaming SSE: eventos `meta` / `chunk` / `done` / `error`
- Historial de conversación: últimos 10 mensajes enviados a Gemini
- Rolling summary cuando `messages.length > 30` (gemini-2.5-flash-lite)
- Rate limit: 60 chats/día/usuario
- Kill-switch durante intento de evaluación activo (enforced en Edge Function)
- Generación de quizzes con `responseSchema` validado server-side (exactamente 1 correcta)
- Resumen de lección cacheado en `ai_lesson_summaries`

**No incluye:**
- Consultas sobre datos de la base de datos (→ Módulo 07 `ai-data-advisor`)
- Visualizaciones / gráficas (→ Módulo 07 `ai-data-advisor`)

**Diferencia clave con Módulo 07:**
`ai-chat` es pedagógico y contextual a una lección específica.
`ai-data-advisor` es analítico y consulta datos del sistema completo.

---

### MÓDULO 07 — `ai-data-advisor`
**Responsabilidad:** Consulta conversacional de datos académicos con respuestas estructuradas, visualizaciones y roadmaps.

> Este módulo es el objeto central de la PARTE B de este documento.
> Ver sección B completa para especificación técnica detallada.

| Elemento | Detalle |
|---|---|
| **Features constitucionales** | Nueva feature (extensión de ai-chat) |
| **Tablas principales** | Solo lectura via RPCs seguros — nunca SQL crudo |
| **Edge Functions** | `ai-data-advisor` |
| **Rutas** | `/advisor`, widget embebido en `/dashboard` |

---

### MÓDULO 08 — `gamification`
**Responsabilidad:** XP, niveles, badges, trofeos, certificados, diplomas y leaderboards.

| Elemento | Detalle |
|---|---|
| **Features constitucionales** | gamification |
| **Tablas principales** | `badges`, `user_badges`, `trophies`, `user_trophies`, `certificates`, `diplomas`, `xp_events` |
| **Edge Functions** | `check-achievements`, `issue-certificate`, `leaderboard` |
| **Rutas** | `/student/certificates`, `/student/ranking`, `/certificates/:code` (público) |
| **RPCs** | `verify_certificate(code)` — público, rate-limit 20 req/min/IP |

**Incluye:**
- 24 badges + 7 trofeos con `criteria jsonb` evaluable
- 30 niveles con fórmula `N² × 100`
- Cap diario 200 XP anti-farm
- Edge Function `check-achievements` disparada tras cada evento significativo
- Certificados PDF generados con `@react-pdf/renderer` (Deno) + QR code
- Diplomas (2 páginas) para learning paths completados
- Leaderboards global / mensual / semanal / per-course
- `profiles.leaderboard_opt_in` + modo anónimo opcional

**No incluye:**
- Pasarela de pagos para certificados premium (diferido v2)

---

### MÓDULO 09 — `admin`
**Responsabilidad:** Panel de administración scoped por unidad organizativa + panel super-admin.

| Elemento | Detalle |
|---|---|
| **Features constitucionales** | admin, super-admin |
| **Tablas principales** | `organizational_units`, `admin_scopes`, `profiles` (gestión) |
| **Edge Functions** | `update-user-role` (compartida con Módulo 01) |
| **Rutas** | `/admin/*`, `/superadmin/*` |

**Incluye:**
- Dashboard DAU/WAU/completion rate
- Gestión de usuarios (impersonar, cambiar rol, desactivar)
- Gestión de unidades organizativas (árbol: área → dpto → carrera → especialidad)
- Feature flags en `app_settings`
- Costos IA por usuario (`ai_usage_events`)
- Branding y configuración global (solo super_admin)
- Gestión de admins y sus scopes (solo super_admin)

**No incluye:**
- Cola de moderación (→ Módulo 10 `moderation`)
- Edición directa de cursos (→ Módulo 02 `courses`)

---

### MÓDULO 10 — `moderation`
**Responsabilidad:** Cola de revisión de contenido flaggeado.

| Elemento | Detalle |
|---|---|
| **Features constitucionales** | moderation |
| **Tablas principales** | `moderation_flags` |
| **Rutas** | `/moderator/*` |

**Incluye:**
- Cola de flags abiertos con filtros por tipo (lesson, course, ai_message, evaluation)
- Revisión y resolución (resolved / dismissed)
- Índice parcial `(status) where status='open'` para cola rápida
- El moderador tiene lectura total pero sin permisos de edición sobre cursos

**No incluye:**
- Auto-moderación por IA (diferido v2)
- Permisos de edición (el moderador es solo revisor)

---

### MÓDULO 11 — `notifications`
**Responsabilidad:** Notificaciones realtime y digest por email.

| Elemento | Detalle |
|---|---|
| **Features constitucionales** | notifications |
| **Tablas principales** | `notifications` |
| **Rutas** | Bell icon global en `DashboardLayout` |
| **Realtime** | `supabase_realtime` sobre tabla `notifications` |

**Incluye:**
- `useRealtimeNotifications` hook con Supabase Realtime
- `NotificationBell` con badge de no leídas (índice parcial optimizado)
- Toast en tiempo real via `sonner`
- Digest semanal via Resend + pg_cron
- Tipos: enrollment, progress, badge_awarded, trophy_awarded, certificate_issued, evaluation_graded, course_published, reminder, ai_response, system

**No incluye:**
- Web Push VAPID (opcional, post-launch)
- Notificaciones SMS

---

## A.3 Mapa de Dependencias entre Módulos

```
M01 auth
  └── requerido por TODOS los módulos (sesión y rol)

M02 courses
  └── requerido por M03, M04, M05, M06, M07, M08

M03 lessons
  └── requerido por M05, M06, M07

M04 enrollment
  └── requerido por M03 (can_access_lesson), M05, M07, M08

M05 evaluations
  └── requerido por M08 (logros post-evaluación)
  └── kill-switch sobre M06 y M07

M06 ai-chat ──────────────────────────┐
                                       ├── paralelos, sin dependencia entre sí
M07 ai-data-advisor ───────────────────┘
  └── ambos requieren M03 + M04 para contexto

M08 gamification
  └── disparado por M03, M04, M05

M09 admin
  └── supervisa M01, M02, M10

M10 moderation
  └── depende de M01 (rol moderador)

M11 notifications
  └── alimentado por M04, M05, M08
```

---

## A.4 Tabla de Rutas por Módulo y Rol

| Módulo | Prefijo de ruta | Rol mínimo requerido |
|---|---|---|
| auth | `/login`, `/signup` | anon |
| courses | `/courses`, `/instructor/courses` | alumno / instructor |
| lessons | `/learn/:courseId/:lessonId` | alumno (enrolled) |
| enrollment | `/student/courses`, `/student/paths` | alumno |
| evaluations | `/evaluation/:id` | alumno (enrolled) |
| ai-chat | Widget en `/learn` | alumno (enrolled, no evaluación activa) |
| ai-data-advisor | `/advisor`, widget en `/dashboard` | alumno |
| gamification | `/student/certificates`, `/student/ranking`, `/certificates/:code` | alumno / anon (verify) |
| admin | `/admin/*`, `/superadmin/*` | admin / super_admin |
| moderation | `/moderator/*` | moderador |
| notifications | Bell global | autenticado |

---

# PARTE B — ESPECIFICACIÓN: FEATURE `ai-data-advisor`

---

## B.1 Objetivo de la Feature

Proveer dentro de la PWA una interfaz conversacional donde el usuario autenticado puede:

1. **Consultar sus propios datos académicos** en lenguaje natural
2. **Consultar estadísticas anónimas agregadas** del sistema (sin exponer PII de otros usuarios)
3. **Recibir respuestas estructuradas** que el frontend renderiza dinámicamente como:
   - Texto enriquecido con markdown
   - Tablas de datos
   - Gráficas reales (Recharts)
   - Roadmaps interactivos de progreso

La IA **no escribe en la base de datos**, **no accede a datos de otros usuarios de forma identificable**, y **se desactiva durante intentos de evaluación activos** (mismo kill-switch que `ai-chat`).

---

## B.2 Diferencia con `ai-chat`

| Dimensión | `ai-chat` (Módulo 06) | `ai-data-advisor` (Módulo 07) |
|---|---|---|
| **Contexto** | Una lección específica | Todo el sistema académico del usuario |
| **Tipo de respuesta** | Texto socrático conversacional | Texto + tablas + gráficas + roadmaps |
| **Datos que consulta** | Resumen de lección inyectado en system prompt | RPCs de solo lectura sobre todas las tablas relevantes |
| **Objetivo pedagógico** | Guiar la comprensión de un tema | Guiar la planificación y progreso académico |
| **Widgets de UI** | Burbuja flotante en player | Página `/advisor` + widget en `/dashboard` |

---

## B.3 Arquitectura de la Feature

```
Usuario (lenguaje natural)
        │
        ▼
<AdvisorChat> — React, Zustand, fetch + ReadableStream
        │
        │  POST /functions/v1/ai-data-advisor
        │  Headers: Authorization: Bearer {JWT}
        │  Body: { query: string, context: AdvisorContext }
        │
        ▼
Edge Function: ai-data-advisor (Deno)
        │
        ├── 1. Verificar JWT (Supabase Auth)
        ├── 2. Verificar kill-switch (evaluación activa → 403)
        ├── 3. Verificar rate limit (tabla ai_usage_events)
        ├── 4. Clasificar intención de la consulta (QueryIntent)
        ├── 5. Ejecutar RPCs de solo lectura según intención
        ├── 6. Construir contexto de datos para Gemini
        ├── 7. Llamar Gemini con system prompt + datos + responseSchema
        ├── 8. Persistir en ai_conversations + audit log
        └── 9. Streaming SSE → cliente
                │
                ▼
        <AdvisorResponseRenderer>
                ├── type: 'text'     → <MarkdownRenderer>
                ├── type: 'table'    → <DataTable> (shadcn/ui)
                ├── type: 'chart'    → <RechartsWrapper> (Bar/Line/Pie/Radar)
                └── type: 'roadmap' → <RoadmapCard> (progreso + checkboxes)
```

---

## B.4 Tipos de Consulta Soportados (QueryIntent)

La Edge Function clasifica la consulta en uno de los siguientes intents antes de ejecutar RPCs:

| Intent | Ejemplo de consulta | RPCs ejecutados |
|---|---|---|
| `my_progress` | "¿Cuánto llevo de mis cursos?" | `get_user_progress_summary(user_id)` |
| `course_roadmap` | "¿Qué me falta para pasar Desarrollo Web?" | `get_course_roadmap(user_id, course_id)` |
| `path_roadmap` | "Dame el roadmap para la materia del DrFIC" | `get_path_roadmap(user_id, path_id)` |
| `evaluation_history` | "¿Cómo me ha ido en los exámenes?" | `get_evaluation_history(user_id)` |
| `pending_tasks` | "¿Qué tengo pendiente esta semana?" | `get_pending_tasks(user_id)` |
| `ranking_context` | "¿Cómo estoy vs el resto del grupo?" | `get_anonymous_ranking_context(user_id)` |
| `xp_breakdown` | "¿Por qué actividades gané mis puntos?" | `get_xp_breakdown(user_id)` |
| `course_stats` | "¿Qué tan difícil es el curso X?" | `get_course_anonymous_stats(course_id)` |
| `streak_analysis` | "¿Cómo ha sido mi constancia?" | `get_streak_analysis(user_id)` |
| `certificate_status` | "¿Qué certificados me faltan?" | `get_certificate_status(user_id)` |

---

## B.5 RPCs de Solo Lectura Requeridos

Todos los RPCs son `security definer stable` en schema `app`. Ninguno expone `user_id` de otros usuarios en sus resultados. Todos los RPCs de agregados usan `COUNT`, `AVG`, `PERCENTILE` — nunca `SELECT *` sobre tablas de usuarios.

```sql
-- Resumen general de progreso del usuario
app.get_user_progress_summary(p_user uuid)
→ { total_courses, active_courses, completed_courses,
    total_lessons, completed_lessons, overall_pct,
    xp_points, level, streak_days }

-- Roadmap detallado de un curso específico
app.get_course_roadmap(p_user uuid, p_course uuid)
→ { course_title, status, progress_pct, passing_score,
    modules: [{ title, lessons: [{ title, status, content_type, xp_reward }] }],
    evaluations: [{ title, attempts_used, max_attempts, best_score, passed }],
    prerequisites_met: bool, missing_prerequisites: [{ title, min_score }] }

-- Roadmap de un learning path completo
app.get_path_roadmap(p_user uuid, p_path uuid)
→ { path_title, is_sequential, overall_pct,
    courses: [{ title, status, progress_pct, position, unlocked }],
    diploma_issued: bool }

-- Historial de evaluaciones
app.get_evaluation_history(p_user uuid)
→ [{ evaluation_title, course_title, attempts, best_score,
     passed, last_attempt_at }]

-- Tareas pendientes (lecciones no completadas + evaluaciones no aprobadas)
app.get_pending_tasks(p_user uuid)
→ [{ type: 'lesson'|'evaluation', title, course_title,
     due_context, xp_reward }]

-- Contexto de ranking anónimo (posición del usuario + distribución)
app.get_anonymous_ranking_context(p_user uuid)
→ { user_rank, total_students, percentile,
    xp_distribution: [{ bucket, count }],
    user_xp, anonymous_neighbors: [{ rank, xp, is_self }] }

-- Desglose de XP ganado por categoría
app.get_xp_breakdown(p_user uuid)
→ [{ category: 'lesson'|'evaluation'|'streak'|'bonus',
     total_xp, event_count, last_earned_at }]

-- Estadísticas anónimas de un curso (sin PII)
app.get_course_anonymous_stats(p_course uuid)
→ { enrolled_count, completion_rate, avg_score,
    avg_completion_days, difficulty_rating }

-- Análisis de racha del usuario
app.get_streak_analysis(p_user uuid)
→ { current_streak, longest_streak, total_active_days,
    activity_by_weekday: [{ day, count }],
    last_30_days: [{ date, active: bool }] }

-- Estado de certificados
app.get_certificate_status(p_user uuid)
→ [{ course_title, eligible: bool, issued: bool,
     progress_pct, score, passing_score, issued_at }]
```

---

## B.6 Esquema de Respuesta Estructurada (responseSchema Gemini)

La Edge Function instruye a Gemini para responder **siempre** con JSON estructurado:

```typescript
type AdvisorResponse = {
  // Tipo de respuesta — determina qué componente renderiza el frontend
  response_type: 'text' | 'table' | 'chart' | 'roadmap' | 'mixed';

  // Texto principal en markdown (siempre presente)
  text: string;

  // Solo si response_type incluye 'table'
  table?: {
    title: string;
    columns: { key: string; label: string; type: 'text' | 'number' | 'badge' | 'progress' }[];
    rows: Record<string, unknown>[];
  };

  // Solo si response_type incluye 'chart'
  chart?: {
    title: string;
    chart_type: 'bar' | 'line' | 'pie' | 'radar' | 'area';
    x_key: string;
    y_keys: { key: string; label: string; color: string }[];
    data: Record<string, unknown>[];
    description: string; // accesibilidad
  };

  // Solo si response_type incluye 'roadmap'
  roadmap?: {
    title: string;
    overall_pct: number;
    sections: {
      title: string;
      status: 'completed' | 'in_progress' | 'locked' | 'pending';
      items: {
        label: string;
        status: 'done' | 'pending' | 'locked';
        type: 'lesson' | 'evaluation' | 'prerequisite' | 'milestone';
        xp_reward?: number;
        score?: number;
      }[];
    }[];
  };

  // Sugerencias de consultas relacionadas
  suggested_queries: string[];
};
```

---

## B.7 System Prompt del AI Data Advisor

```
Eres el Asistente Académico de la plataforma LMS escolar. Tu nombre es Ada.
Tienes acceso a los datos académicos del alumno y estadísticas anónimas del sistema.

REGLAS ABSOLUTAS:
1. Responde SIEMPRE en español, tono cercano y motivador.
2. NUNCA reveles datos de otros usuarios de forma identificable.
3. NUNCA ejecutes ni sugieras operaciones de escritura en la base de datos.
4. NUNCA respondas preguntas de evaluaciones activas (el sistema bloquea esto).
5. Si no tienes datos suficientes, dilo claramente y sugiere qué acción tomar.
6. Sé preciso con números — no inventes ni aproximes datos que tienes exactos.
7. Usa los datos provistos en el contexto — no inventes información académica.

FORMATO DE RESPUESTA:
- Siempre responde con el JSON estructurado del schema AdvisorResponse.
- Elige el response_type apropiado según la naturaleza de la consulta:
  * Progreso general → 'mixed' (text + chart de avance)
  * Roadmap de curso/materia → 'roadmap'
  * Historial de evaluaciones → 'table'
  * Comparativa de ranking → 'chart' (bar o radar)
  * Pregunta simple de estado → 'text'
- Incluye SIEMPRE 2-3 suggested_queries relevantes al contexto del alumno.
- El campo 'text' debe ser motivador, específico y accionable.

CONTEXTO DEL ALUMNO:
{user_context}

DATOS CONSULTADOS:
{query_results}
```

---

## B.8 Reglas de Seguridad Específicas del Módulo

| Regla | Implementación |
|---|---|
| La IA no escribe en DB | RPCs solo tienen permisos SELECT; Edge Function usa cliente de solo lectura |
| Sin PII de otros usuarios | RPCs de agregados usan PERCENTILE/COUNT/AVG sin exponer `user_id` ajenos |
| Kill-switch evaluación activa | Edge Function verifica `evaluation_attempts` con `status='in_progress'` antes de procesar |
| Rate limit | 30 consultas/día/usuario (más restrictivo que ai-chat — consultas son más costosas) |
| Datos propios RLS-scoped | Todos los RPCs con `p_user` verifican `p_user = auth.uid()` internamente |
| Sin SQL crudo | El cliente nunca envía SQL — solo intención en lenguaje natural |
| Audit log | Toda consulta registrada en `ai_usage_events` con `feature='advisor'` |
| Sin exponer schema | La IA no conoce nombres de tablas ni columnas — solo recibe resultados de RPCs |

---

## B.9 Componentes de UI Requeridos

### `<AdvisorPage>` — Ruta `/advisor`

Página completa con:
- Historial de conversación persistido en `ai_conversations` (feature='advisor')
- Input de texto con sugerencias rápidas predefinidas
- `<AdvisorResponseRenderer>` que despacha al componente correcto según `response_type`
- Botón "Limpiar conversación"
- Indicador de consultas restantes del día

### `<AdvisorWidget>` — Embebido en `/dashboard`

Widget compacto (sidebar o card) con:
- 3-4 sugerencias de consulta rápida según contexto del usuario
- Últimas 2 respuestas del historial
- Link "Ver más en el Asesor"

### `<AdvisorResponseRenderer>`

Dispatcher de respuestas:

```tsx
// 🎓LMS: Renders AI advisor response based on response_type field (EN)
// 🎓LMS: Renderiza la respuesta del asesor IA según el campo response_type (ES)
// 💡LMS: response_type drives component selection — add new types here, not in AdvisorPage (EN)
// 💡LMS: response_type dirige la selección de componente — añadir nuevos tipos aquí (ES)
function AdvisorResponseRenderer({ response }: { response: AdvisorResponse }) {
  return (
    <div className="space-y-4">
      <MarkdownRenderer content={response.text} />
      {response.table    && <AdvisorDataTable    data={response.table} />}
      {response.chart    && <AdvisorChart        data={response.chart} />}
      {response.roadmap  && <AdvisorRoadmap      data={response.roadmap} />}
      <SuggestedQueries  queries={response.suggested_queries} />
    </div>
  );
}
```

### `<AdvisorChart>`

Wrapper sobre Recharts. Soporta: `BarChart`, `LineChart`, `PieChart`, `RadarChart`, `AreaChart`. Colores desde design tokens de Tailwind. Tooltip en español. Descripción accesible en `aria-label` desde `chart.description`.

### `<AdvisorRoadmap>`

Visualización de progreso con:
- Barra de progreso general (`overall_pct`)
- Secciones colapsables por módulo del curso
- Íconos de estado por ítem: ✅ done / 🔄 in_progress / 🔒 locked / ⏳ pending
- Badge de XP reward por ítem pendiente
- Score de evaluaciones aprobadas

---

## B.10 Tabla de Contenido Supabase Storage — Sin Cambios

Este módulo es de **solo lectura**. No agrega buckets ni modifica políticas de Storage existentes.

---

## B.11 Variables de Entorno Requeridas

| Variable | Ámbito | ¿Navegador? | Notas |
|---|---|---|---|
| `GEMINI_API_KEY` | Edge Function | ❌ jamás | Compartida con `ai-chat` |
| `SUPABASE_SERVICE_ROLE_KEY` | Edge Function | ❌ jamás | Para RPCs `security definer` |
| `ADVISOR_DAILY_LIMIT` | Edge Function | ❌ | Default: 30 consultas/día/usuario |
| `ADVISOR_ENABLED` | Edge Function | ❌ | Feature flag: true/false |

---

## B.12 Fase de Implementación

Esta feature se implementa en **Fase 6** (paralela a AI Integration), con una sub-fase propia:

| Sub-fase | Entregable |
|---|---|
| 6A | RPCs de solo lectura + policies de seguridad en Supabase |
| 6B | Edge Function `ai-data-advisor` con clasificación de intents |
| 6C | `AdvisorResponseRenderer` + `AdvisorChart` + `AdvisorRoadmap` |
| 6D | `AdvisorPage` completa + `AdvisorWidget` en dashboard |
| 6E | Tests Vitest para RPCs + E2E Playwright para 3 flujos críticos del advisor |

**Dependencias duras:**
- Módulos 02, 03, 04, 05 deben estar completos (datos reales para los RPCs)
- `ai-chat` (Módulo 06) puede desarrollarse en paralelo — comparten infraestructura de Edge Function

---

## B.13 Flujos E2E Críticos del Advisor (Playwright)

1. **Flujo roadmap de curso:** Alumno pregunta "¿Qué me falta para aprobar [curso]?" → respuesta tipo `roadmap` → todos los ítems pendientes visibles → click en sugerencia relacionada
2. **Flujo ranking anónimo:** Alumno pregunta "¿Cómo estoy vs el grupo?" → respuesta tipo `chart` (BarChart de distribución) → no se expone ningún nombre de otro alumno
3. **Flujo kill-switch:** Alumno inicia evaluación → intenta usar el advisor → recibe mensaje de desactivación temporal

---

## B.14 Costos Estimados del Advisor

Para 100 usuarios × 10 consultas/día × 30 días = 30,000 llamadas/mes:

| Característica | Estimación |
|---|---|
| Modelo | `gemini-2.5-flash` |
| Tokens promedio por consulta | ~3,000 in / 800 out (datos + roadmap JSON) |
| Costo estimado/mes | ~$45–60 |
| Con context caching en RPCs frecuentes | ~$30–40 |

**Total IA combinado (ai-chat + ai-data-advisor):** ~$130–160/mes para 100 usuarios activos.

---

## B.15 Criterios de Aceptación de la Feature

- ✅ La IA responde siempre con JSON válido del schema `AdvisorResponse`
- ✅ `response_type: 'roadmap'` renderiza `<AdvisorRoadmap>` con progreso real del usuario
- ✅ `response_type: 'chart'` renderiza gráfica Recharts con datos reales de RPCs
- ✅ Ninguna respuesta expone `user_id`, nombre o datos identificables de otros usuarios
- ✅ Kill-switch activo: `/functions/v1/ai-data-advisor` retorna 403 durante evaluación activa
- ✅ Rate limit: 31ª consulta del día retorna 429 con mensaje en español
- ✅ Los RPCs de datos propios devuelven vacío si el usuario consulta datos ajenos
- ✅ `ADVISOR_ENABLED=false` deshabilita la feature sin redeployment
- ✅ Lighthouse: la página `/advisor` no degrada el score global del PWA
- ✅ Estándar `🎓LMS:` aplicado en Edge Function, RPCs y componentes principales

---

## 99. DECLARACIÓN FINAL

Este documento define el **Module Map completo** del sistema LMS escolar y la **especificación técnica ejecutable** de la feature `ai-data-advisor`. Juntos, proveen el contexto de navegación que todo agente necesita antes de escribir código, y el contrato técnico que Dr. Gabo aprueba antes de iniciar la Fase 6A.

**Ningún agente escribe código de `ai-data-advisor` sin que Dr. Gabo cierre este ticket.**

---

**Estado:** ✅ Activa
**Versión:** 1.0
**Rol:** Module Map + Spec de feature ai-data-advisor
**Framework:** Spec-Driven Development (SpecKit / OpenSpec)
**Documentos superiores:** `project_constitution.md` → `SPEC-001-TKT-LMS-001.md`
**Blueprint técnico:** `Investigacion.md`
**Aprobación humana:** Dr. Gabo
