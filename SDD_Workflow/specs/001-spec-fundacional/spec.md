# Feature Specification: SPEC-001 Fundacional LMS Escolar

**Feature Branch**: [hook-not-available]  
**Created**: 2026-04-25  
**Status**: Draft  
**Input**: User description: "Canonizar SPEC-001 fundacional desde .drfic/diana-sdk/specs/001-spec-drfic.md sin inferencias"

<<<<<<< HEAD
## Clarifications

### Session 2026-04-26

- Q: Objetivo de disponibilidad mensual del sistema en v1 → A: 99.0% mensual
- Q: Regla de resolucion de conflictos en edicion concurrente de contenido → A: Rechazar guardado por conflicto y pedir recarga
- Q: Objetivos de recuperacion ante incidentes en v1 (RTO/RPO) → A: RTO 8h y RPO 24h
- Q: Retencion de logs y metricas operativas en v1 → A: 90 dias
- Q: Marco regulatorio formal aplicable en v1 → A: Sin marco regulatorio especifico en v1; aplicar buenas practicas de seguridad y privacidad definidas

=======
>>>>>>> origin/main
## User Scenarios & Testing *(mandatory)*

### User Story 1 - Trayectoria de aprendizaje trazable (Priority: P1)

Diseñar, construir y operar una plataforma educativa LMS tipo PWA para instituciones escolares que organice cursos, modulos y lecciones, y permita progreso trazable respetando prerequisitos configurados.

**Why this priority**: Es el objetivo principal del sistema y habilita el valor academico base para alumnos e instructores.

**Independent Test**: Se valida al verificar que un alumno puede inscribirse, avanzar por contenido permitido y quedar bloqueado cuando no cumple prerequisitos.

**Acceptance Scenarios**:

1. **Given** un alumno autenticado con prerequisitos cumplidos, **When** intenta avanzar al siguiente contenido, **Then** el sistema permite progreso y registra trazabilidad.
2. **Given** un alumno sin prerequisitos cumplidos, **When** intenta acceder a contenido bloqueado, **Then** el sistema niega acceso.

---

### User Story 2 - Gestion docente de contenido (Priority: P2)

Permitir a instructores crear, publicar y gestionar contenido de cursos con cuatro tipos soportados: video, PDF, PPTX y notas web.

**Why this priority**: La creacion y mantenimiento de contenido es necesaria para que exista oferta formativa en la plataforma.

**Independent Test**: Se valida al crear y publicar contenido en los cuatro tipos declarados y consumirlo desde la experiencia del alumno.

**Acceptance Scenarios**:

1. **Given** un instructor autorizado, **When** crea y publica lecciones en los tipos soportados, **Then** quedan disponibles segun permisos y prerequisitos.

---

### User Story 3 - Integridad de evaluacion y certificacion (Priority: P3)

Proteger la integridad de evaluaciones con grading exclusivamente del lado servidor y emitir certificados o diplomas verificables publicamente con codigo unico.

**Why this priority**: Asegura confianza academica y validez institucional de resultados.

**Independent Test**: Se valida al completar una evaluacion con calificacion segura y comprobar verificacion publica del certificado.

**Acceptance Scenarios**:

1. **Given** un intento de evaluacion activo, **When** se procesa la calificacion, **Then** el grading ocurre solo en servidor y datos sensibles no llegan al cliente.
2. **Given** un certificado emitido, **When** se consulta su codigo publico, **Then** se verifica su validez sin exponer datos restringidos.

---

### Edge Cases

- Intento de acceso a contenido sin cumplir prerequisitos.
- Intento de autoasignacion o elevacion de rol no permitida.
- Intento de uso de IA durante evaluacion activa (kill-switch obligatorio).
- Deteccion de ciclo al configurar prerequisitos de cursos.
- Consulta publica de certificado con codigo invalido o inexistente.
<<<<<<< HEAD
- Conflicto de edicion concurrente: se rechaza guardado y se solicita recarga antes de reintentar.
=======
>>>>>>> origin/main

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST organizar conocimiento en jerarquia institucional y academica (cursos, modulos, lecciones).
- **FR-002**: El sistema MUST permitir a instructores crear, publicar y gestionar contenido en tipos video, PDF, PPTX y nota web.
- **FR-003**: El sistema MUST aplicar prerequisitos para acceso y progresion de cursos.
- **FR-004**: El sistema MUST impedir promocion automatica sin superar evaluaciones configuradas.
- **FR-005**: El sistema MUST realizar grading exclusivamente del lado servidor.
- **FR-006**: El sistema MUST impedir exposicion al cliente de datos de correccion de respuestas.
- **FR-007**: El sistema MUST emitir certificados y diplomas verificables publicamente con codigo unico.
- **FR-008**: El sistema MUST integrar tutor IA en modo socratico y no como evaluador.
- **FR-009**: El sistema MUST aplicar kill-switch de IA durante evaluaciones activas.
- **FR-010**: El sistema MUST mantener control humano explicito en evaluacion y avance de fase.
- **FR-011**: El sistema MUST aplicar control de acceso por roles jerarquicos.
- **FR-012**: El sistema MUST garantizar funcionamiento como PWA instalable con modo offline basico.
- **FR-013**: El sistema MUST operar con enfoque de costo cercano a cero para volumen inicial declarado.
- **FR-014**: El sistema MUST mantener trazabilidad de progreso del alumno.

### Key Entities *(include if feature involves data)*

- **Usuario/Perfil**: Identidad del actor y rol jerarquico dentro del sistema.
- **Unidad Organizativa**: Contexto institucional para scopes administrativos.
- **Curso/Modulo/Leccion**: Estructura principal del contenido educativo.
- **Inscripcion/Progreso**: Estado de avance academico por alumno.
- **Evaluacion/Intento/Opciones**: Dominio de evaluacion y calificacion segura.
- **Badge/Trofeo/Certificado/Diploma**: Dominio de gamificacion y acreditacion.
- **Conversacion IA**: Historial y contexto del tutor socratico.
- **Notificacion/Flag de moderacion**: Eventos y control operativo.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: La plataforma cubre un volumen inicial operativo de 50 a 100 usuarios.
- **SC-002**: La experiencia PWA garantiza instalacion y modo offline basico para shell, catalogo y lecciones visitadas.
- **SC-003**: El costo operativo mensual del escenario inicial se mantiene cercano a cero para los componentes no IA.
- **SC-004**: El grading de evaluaciones ocurre en servidor en el 100% de intentos procesados.
- **SC-005**: El control de IA durante evaluaciones activas se bloquea en el 100% de intentos activos.
- **SC-006**: En cada PR de calidad final, PWA alcanza 100 y performance >= 90 en Lighthouse.
<<<<<<< HEAD
- **SC-007**: La disponibilidad objetivo mensual del sistema en v1 es 99.0%.
- **SC-008**: Recuperacion ante incidentes en v1 con RTO de 8 horas y RPO de 24 horas.
- **SC-009**: Retencion de logs y metricas operativas por 90 dias en v1.
=======
>>>>>>> origin/main

## Assumptions

- Esta especificacion es fundacional (SPEC-001) y de nivel Sistema/Vision.
- El documento project_constitution.md prevalece ante cualquier conflicto.
- Quedan fuera de alcance v1 los elementos marcados como diferidos (v2/v3).
- Se mantiene control humano explicito para cierre de fases por Dr. Gabo.
<<<<<<< HEAD
- En v1 no se fija un marco regulatorio formal especifico; se aplican las buenas practicas de seguridad y privacidad ya definidas en esta especificacion.
=======
>>>>>>> origin/main

## Canonical Source (Verbatim)

El contenido siguiente se registra como definicion canonica inicial sin alteracion de sentido:

# SPEC-001-TKT-LMS-001 — PLATAFORMA LMS ESCOLAR PWA ASISTIDA POR IA

Framework: Spec-Driven Development (GitHub Copilot Spec-Kit)
Estado: Activa
Autoridad: Subordinada estrictamente a `project_constitution.md`

- **Control de Cambios:** 001-ucc-lms
- **Ticket de Usuario:** 001-tkt-lms

---

## 0. AUTORIDAD CONSTITUCIONAL

Esta especificación deriva directamente de la Constitución del Proyecto (`project_constitution.md`) y está subordinada a ella como fuente de verdad primaria. El blueprint técnico detallado vive en `Investigacion.md`.

**Reglas no negociables heredadas de la Constitución:**

- Arquitectura por features desacopladas (vertical slice)
- La IA actúa como tutor socrático, nunca como evaluador ni ejecutor de decisiones académicas
- Control humano explícito en toda evaluación y avance de fase
- Grading siempre en el servidor — `evaluation_options.is_correct` nunca llega al cliente
- API keys secretas exclusivamente en Edge Functions (Gemini, service role, Resend)
- RLS activo en todas las tablas desde el primer migration

Ante cualquier conflicto, prevalece `project_constitution.md`.

> **⚠️ Nota de nomenclatura:** El rol de aprobación humana en este proyecto se denomina
> **Dr. Gabo**, no `Dr.LMS` como figura en la Constitución base. Cualquier referencia
> a `Dr.LMS` en documentos constitucionales debe leerse como **Dr. Gabo** durante
> la ejecución de este proyecto.

---

## 1. OBJETIVO GENERAL

Diseñar, construir y operar una **Plataforma Educativa Web tipo LMS (Learning Management System)** como Progressive Web App, orientada a instituciones escolares, que:

- Organice el conocimiento en cursos → módulos → lecciones con jerarquía institucional (áreas, departamentos, carreras, especialidades)
- Permita a instructores **crear, publicar y gestionar** su propio contenido con cuatro tipos soportados: video, PDF, PPTX y notas web
- Garantice que los alumnos **progresen de forma trazable** respetando prerequisitos configurados
- Proteja la **integridad de las evaluaciones** mediante grading exclusivamente del lado servidor
- Emita **certificados y diplomas verificables públicamente** con código único
- Integre un **tutor IA socrático** (Google Gemini 2.5 Flash) sin exponer claves al cliente
- Sea **instalable, funcione offline** en modo básico y sea responsive como PWA
- Opere con **costo cercano a cero** para el volumen inicial de 50–100 usuarios

---

## 2. FILOSOFÍA DEL SISTEMA

### 2.1 Modelo Centrado en el Aprendizaje Humano

- El alumno decide su ritmo, pero la progresión respeta los prerequisitos configurados por el instructor
- El instructor define el contenido; el sistema lo organiza, rastrea y hace trazable
- No existe promoción automática sin superar evaluaciones configuradas
- No existe acceso a contenido sin cumplir los prerequisitos establecidos
- La IA nunca reemplaza la evaluación humana ni proporciona respuestas directas de exámenes
- El sistema es **andamio** del aprendizaje, no su sustituto

### 2.2 Arquitectura por Features Desacopladas (Vertical Slice)

El sistema se compone de features independientes, donde cada feature:

- Representa un **dominio funcional completo** con sus propios components, hooks, services, store, api y types
- Es **desacoplada funcional y técnicamente** del resto
- Puede desarrollarse, probarse y desplegarse de forma relativamente independiente

**Features constitucionales del sistema:**

| Feature | Responsabilidad |
|---|---|
| `auth` | Autenticación y sesión (email/password + Google OAuth) |
| `courses` | Catálogo, creación y gestión de cursos |
| `lessons` | Reproductor de lecciones con tracking de progreso |
| `evaluations` | Builder y runner de evaluaciones con grading seguro |
| `gamification` | XP, niveles, badges, trofeos, certificados, leaderboards |
| `ai-chat` | Tutor socrático con streaming SSE (proxy Edge Function) |
| `admin` | Panel de administración scoped por unidad organizativa |
| `super-admin` | Configuración global, branding, planes, gestión de admins |
| `moderation` | Cola de revisión de contenido para moderadores |
| `profile` | Perfil del usuario, avatar, estadísticas |
| `notifications` | Sistema de notificaciones realtime |

### 2.3 Rol de la Inteligencia Artificial

La IA (Google Gemini 2.5 Flash):

- ✅ Es un **feature adicional de apoyo pedagógico**, no el núcleo del sistema
- ✅ Actúa como **tutor socrático**: guía con preguntas, no da respuestas directas
- ✅ Genera quizzes, resúmenes y recomendaciones de aprendizaje
- ✅ Toda llamada pasa por Edge Function con JWT verificado
- ❌ Nunca responde directamente las respuestas de una evaluación activa
- ❌ Nunca se llama desde el cliente
- ❌ Su API key jamás aparece en el bundle del navegador
- ❌ No reemplaza la lógica determinística (grading, prerequisitos, progreso)

El **kill-switch de IA durante intentos de evaluación activos** es no negociable.

---

## 3. ALCANCE FUNCIONAL (VERSIÓN 1.0)

### Incluye

- Gestión completa de cursos, módulos y lecciones con contenido externo embebido
- Cuatro tipos de contenido: `video` (YouTube/Vimeo), `pdf` (Drive/Supabase), `pptx` (Slides/OneDrive), `web_note` (Notion/URL)
- Sistema de 5 roles con jerarquía institucional por unidades organizativas
- Evaluaciones con builder, runner, grading seguro y control de intentos
- Gamificación completa: XP, 30 niveles, 24 badges, 7 trofeos, certificados PDF verificables, diplomas, leaderboards
- Prerequisitos de cursos con detección de ciclos
- Rutas de aprendizaje secuenciales/paralelas
- Tutor IA socrático con streaming SSE, historial de conversación y kill-switch
- Notificaciones realtime (Supabase Realtime)
- PWA instalable con soporte offline básico (shell + catálogo + lecciones visitadas)
- Panel de moderación con cola de flags
- Verificación pública de certificados (`/certificates/:code`)

### Excluye (diferidos a versiones futuras)

- Auto-inscripción con pago (pasarela de pagos) — v2
- SSO/SAML institucional — venta institucional
- Videoconferencia integrada (Zoom/Meet embed) — v2
- Auto-grading de respuestas abiertas por IA — v2
- Foro/comunidad entre alumnos — v2
- App móvil nativa (la PWA cubre el caso inicial)
- Multi-tenant (múltiples instituciones en un deployment) — v3

---

## 4. ARQUITECTURA GENERAL

```
PWA (React + TypeScript + Vite)
    │
    ├── TanStack Query v5 (server state)
    ├── Zustand (client state: sesión, UI flags, progreso offline)
    ├── React Hook Form + Zod (formularios y validación)
    │
    └── Supabase Client (anon key, RLS enforced)
          │
          ├── PostgreSQL + RLS (26 tablas, schema public + app)
          ├── Supabase Auth (email/password + Google OAuth)
          ├── Supabase Realtime (notifications, progress, badges)
          ├── Supabase Storage (avatars, thumbnails, certificates)
          └── Edge Functions (Deno) ← API keys secretas aquí
                ├── ai-chat (Gemini SSE, rate limit, kill-switch)
                ├── submit-evaluation (grading server-side)
                ├── issue-certificate (PDF gen + verificación)
                ├── update-user-role (único camino de mutación de roles)
                ├── check-achievements (XP, badges, trofeos)
                └── enroll-course (prerequisitos + inscripción)

Vercel Pro (hosting PWA + CI/CD)
Sentry Free (error tracking)
Resend + React Email (emails transaccionales)
```

**Principio de embeds externos:** Videos y PDFs grandes nunca en Supabase Storage. YouTube/Vimeo/Drive/Slides/OneDrive/Notion = $0 de egress. Supabase Storage exclusivamente para avatares, thumbnails, badges y certificados PDF (volumen pequeño, privacidad requerida).

---

## 5. STACK TECNOLÓGICO OBLIGATORIO

### 5.1 Frontend — PWA

| Tecnología | Versión | Rol |
|---|---|---|
| **Vite** | latest | Bundler y entorno de desarrollo |
| **React** | 18+ | Framework de UI |
| **TypeScript** | 5+ | Lenguaje principal |
| **shadcn/ui + Radix UI** | latest | Componentes (código propio, a11y incluida) |
| **Tailwind CSS** | 3+ | Estilos utilitarios |
| **Zustand** | 4+ | Estado cliente (sesión, UI flags, progreso offline) |
| **TanStack Query** | v5 | Estado servidor (cursos, perfil, notificaciones) |
| **React Hook Form + Zod** | latest | Formularios (schemas compartidos cliente ↔ Edge Function) |
| **vite-plugin-pwa + Workbox** | latest | Service worker y estrategias de caché |
| **React Router** | v6+ | Routing con guards por rol |
| **i18next** | latest | Internacionalización (ES default, EN scaffold desde día 1) |
| **pnpm** | latest | Package manager |

### 5.2 Backend y Base de Datos

| Tecnología | Rol |
|---|---|
| **Supabase** | PostgreSQL + RLS + Realtime + Storage + Edge Functions + Auth |
| **PostgreSQL** | Schema `public` (datos) + schema `app` (helpers `security definer`) |
| **Supabase Edge Functions (Deno)** | Lógica de negocio sensible: grading, certificados, IA, roles |
| **@google/genai v1+** | SDK Gemini — solo en Edge Functions, nunca en cliente |
| **Resend + React Email** | Emails transaccionales |

### 5.3 Infraestructura

| Tecnología | Rol |
|---|---|
| **Vercel Pro** | Hosting (Hobby prohíbe uso comercial por ToS) |
| **GitHub Actions** | CI: lint + typecheck + test + Lighthouse en cada PR |
| **Sentry** (free tier) | Error tracking y tracing |

---

## 6. MODELO DE DATOS — RESUMEN EJECUTIVO

**26 tablas en orden de dependencia:**

`profiles` → `organizational_units` → `admin_scopes` → `courses` → `course_instructors` → `modules` → `lessons` → `content_sources` → `enrollments` → `progress_tracking` → `evaluations` → `evaluation_questions` → `evaluation_options` → `evaluation_attempts` → `badges` → `user_badges` → `trophies` → `user_trophies` → `certificates` → `diplomas` → `learning_paths` → `learning_path_courses` → `course_prerequisites` → `notifications` → `ai_conversations` → `moderation_flags`

**Reglas de datos no negociables:**

- RLS activo en todas las tablas desde el primer migration
- `evaluation_options.is_correct` nunca llega al cliente vía SELECT directo — solo vía Edge Function `submit-evaluation` con `service_role`
- `auth.users.raw_app_meta_data.user_role` como claim JWT firmado, inmutable desde el cliente
- Índice parcial `(user_id, created_at desc) where read_at is null` sobre `notifications` para bell badge rápido
- GIN sobre `courses.tags` y trigram sobre `courses.title` para búsqueda eficiente
- Publicación Realtime selectiva: solo `notifications`, `progress_tracking`, `user_badges`, `user_trophies`, `evaluation_attempts`

---

## 7. ROLES DE LOS ACTORES DEL SISTEMA

El sistema define **cinco roles jerárquicos** con jerarquía numérica explícita:

| Rol | Nivel | Responsabilidad |
|---|---|---|
| `super_admin` | 5 | Configura la plataforma global: branding, planes, permisos, gestión de admins |
| `admin` | 4 | Gestiona la plataforma; scopeable a una o varias unidades organizativas |
| `instructor` | 3 | Crea y gestiona sus propios cursos (owner + collaborators) |
| `moderador` | 3 | Revisa contenido, marca flags; sin permisos de edición sobre cursos |
| `alumno` | 1 | Consume cursos, progresa, participa en evaluaciones y gamificación |

**Reglas constitucionales de roles:**

- Solo `super_admin` puede promover a `admin`
- El Edge Function `update-user-role` es el **único camino** para cambiar roles
- Un usuario no puede autoasignarse un rol superior al propio (enforced en RLS + Edge Function)
- La jerarquía numérica determina todos los permisos; un `admin` no puede elevar a nadie a `super_admin`
- Un curso puede tener exactamente un `owner` + N `collaborator` en `course_instructors`

---

## 8. INTEGRACIONES DE CONTENIDO EXTERNO

**Principio:** El sistema NO integra OAuth con ninguna plataforma de contenido. El instructor pega la URL directamente. El sistema detecta el proveedor por regex y construye la URL de embed.

| Proveedor | Tipo | Progreso API | Costo |
|---|---|---|---|
| **YouTube** | Video | ✅ IFrame API | $0 |
| **Vimeo** | Video (sin ads, privacidad real) | ✅ SDK | $20+/mes |
| **Google Drive** | PDF embed | ❌ heurística (tiempo) | $0 |
| **Google Slides** | Presentaciones | ❌ navegación padre | $0 |
| **OneDrive / SharePoint** | PPTX nativo | ❌ navegación padre | $0 |
| **Notion** | Notas web (solo `notion.site`) | ❌ tiempo | $0 |

**Videos → NUNCA en Supabase Storage.** La matemática de egress es prohibitiva a escala.

---

## 9. PERSISTENCIA Y SEGURIDAD DE DATOS

**Fuentes de datos:**

- **Supabase PostgreSQL:** usuarios, cursos, módulos, lecciones, inscripciones, progreso, evaluaciones, gamificación, notificaciones, conversaciones IA
- **Supabase Storage:** avatares, thumbnails de cursos, badges SVG, certificados PDF (privados, signed URLs TTL 1h), recursos de lección (privados, enrolled-only)

**Reglas de seguridad no negociables:**

1. RLS en todas las tablas desde el primer migration — no existe tabla sin política
2. `evaluation_options.is_correct` nunca al cliente — solo Edge Function `submit-evaluation` con `service_role`
3. Gemini API key nunca en el bundle del navegador — solo en variables de entorno de Edge Functions (sin prefijo `VITE_`)
4. Supabase service role key nunca en el cliente
5. Content Security Policy en producción — solo dominios exactos necesarios (YouTube, Vimeo, Drive, Slides, OneDrive, Notion)
6. Signed URLs con TTL corto (1h) para recursos privados en Supabase Storage
7. Rate limit IA: 60 chats/día/usuario en Edge Function — kill-switch durante evaluaciones activas
8. Certificados verificables por RPC público `verify_certificate(code)` — nunca expone el registro completo
9. PITR activado en Supabase Pro + backup nightly `pg_dump` a S3/R2 encriptado
10. Jerarquía de roles enforzada en Edge Function + RLS, nunca solo en frontend

---

## 10. INTELIGENCIA ARTIFICIAL (TUTOR SOCRÁTICO)

**Rol constitucional:**

- Feature adicional de apoyo pedagógico — no el núcleo del sistema
- Confirmador contextual, generador de quizzes y resúmenes
- Tutor socrático que guía con preguntas, nunca con respuestas directas
- Nunca evaluador ni ejecutor de decisiones académicas
- Nunca fuente única de verdad académica

**Capacidades:**

- Chat socrático en tiempo real con streaming SSE (solo en Edge Function)
- Generación de quizzes desde contenido de lección (`ai-generate-quiz`)
- Resumen de lección con glosario (`ai-summarize`, cacheado en DB)
- Historial de conversación con rolling summary para context window management
- Rate limiting: 60 chats/día/usuario; kill-switch durante evaluaciones activas

**Ruteo por tarea y costo estimado (100 usuarios × 20 interacciones/día × 30 días):**

| Tarea | Modelo | Costo estimado/mes |
|---|---|---|
| Chat tutor (80%) | `gemini-2.5-flash` | ~$76.80 |
| Quiz generation (15%) | `gemini-2.5-flash-lite` | ~$8.10 |
| Summarization (5%) | `gemini-2.5-flash` (cacheable) | ~$12.75 |
| **Total** | | **~$97/mes** |

Reducible a ~$60–80 con Batch tier + context caching.

---

## 11. GAMIFICACIÓN

### Sistema XP

| Acción | XP | Nota |
|---|---|---|
| Completar lección | 10 | `xp_override` por lección permitido |
| Video visto ≥95% | +5 bonus | detecta watch genuino |
| Aprobar evaluación | 15–40 | escala lineal con score |
| Primer intento aprobado | +10 bonus | |
| Completar curso | 100 | |
| Completar learning path | 500 | + diploma |
| Cap diario | 200 XP | anti-farm |

### Niveles — fórmula `N² × 100`

30 niveles desde Aprendiz (1-4) hasta Leyenda (30+). Cada tier desbloquea beneficios visuales y funcionales.

### Catálogo

- **24 badges** en categorías: progress, mastery, habits, social, special
- **7 trofeos** de tier superior: PATH_DIPLOMA, TOP_3_MONTHLY, TOP_1_MONTHLY, STREAK_365, ALL_COURSES, PERFECT_PATH, LEVEL_30

### Certificados y diplomas

- Emisión vía Edge Function `issue-certificate` con `@react-pdf/renderer`
- Template A4 landscape con QR code que linkea a `/certificates/:code`
- Verificación pública vía RPC `verify_certificate(code)` — devuelve solo campos públicos
- Rate-limit: 20 req/min por IP en verificación pública

---

## 12. PRERREQUISITOS Y RUTAS DE APRENDIZAJE

- Detección de ciclos mediante recursive CTE en PostgreSQL antes de insertar cualquier prerequisito
- RPC `can_enroll(user, course)` devuelve `{allowed: bool, missing: [course_ids]}`
- Frontend consume `can_enroll` antes de renderizar el botón "Inscribirme" — lock icon + tooltip si blocked
- Learning paths con `is_sequential` — solo se desbloquea el siguiente curso no completado con menor `position`
- Trigger sobre `enrollments` cuando `status='completed'` encola emisión de diplomas

---

## 13. PWA Y OFFLINE

**Estrategias de caché (Workbox):**

| Asset | Estrategia | TTL |
|---|---|---|
| Shell HTML/JS/CSS/fonts/icons | Precache | vida del SW |
| `/rest/v1/courses`, `/rest/v1/lessons` | StaleWhileRevalidate | 6h |
| `/rest/v1/*` GET genérico | NetworkFirst 4s | 24h |
| `/auth/v1/*` | NetworkOnly | — |
| `/functions/v1/ai-chat` | NetworkOnly | — |
| Imágenes (avatares, thumbs) | CacheFirst | 30d |
| YouTube/Vimeo/Drive iframes | NetworkOnly | — |
| POST/PATCH progreso de lección | NetworkOnly + BackgroundSync | 24h retry |

**Offline garantizado:** app shell, catálogo de cursos, lecciones visitadas (metadata), perfil, badges.

**Background Sync** `lesson-progress-queue` — respaldo en IndexedDB vía `idb-keyval` para Safari pre-18.

**Manifest:** `display: 'standalone'`, `start_url: '/dashboard'`, 3 shortcuts (Cursos, Ranking, Perfil), icono maskable 512×512.

---

## 14. GOBIERNO DE AGENTES

### Agentes oficiales del proyecto

| Agente | Rol |
|---|---|
| **Picoro** | Análisis, investigación, diseño de features, redacción de specs y migrations SQL |
| **Goku** | Implementación frontend (React, Zustand, hooks, visores de contenido) |
| **Vegeta** | Optimización, seguridad (RLS, CSP, Edge Functions, bundle size) |
| **Krilin** | Base de datos (migrations, RLS policies, RPCs, Supabase Edge Functions) |
| **Bulma** | Validación, testing (Vitest, Playwright, Lighthouse, Security Advisor) |
| **Dr. Gabo** | ✅ Aprobación y validación humana explícita — cierra tickets y fases |

### Orden operativo constitucional obligatorio

```
Picoro → (Goku ∥ Krilin) → (Vegeta ∥ Bulma) → Dr. Gabo ✅
```

### Reglas obligatorias para todo agente

- ✅ DEBE declarar explícitamente el skill activo
- ✅ DEBE mostrar cabecera de actividad con fase y feature
- ✅ DEBE dejar evidencia verificable de salida (SQL, TypeScript, tests)
- ✅ DEBE respetar el estándar de comentarios `🎓LMS:`
- ❌ NO puede ejecutar trabajo fuera de su fase asignada
- ❌ NO puede generar código sin spec previa aprobada

---

## 15. ESTÁNDAR DE COMENTARIOS DE CÓDIGO

Todo código generado deberá cumplir obligatoriamente con el siguiente estándar:

```ts
// 🎓LMS: Saves lesson progress with debounce to avoid excessive DB writes (EN)
// 🎓LMS: Guarda el progreso de lección con debounce para evitar escrituras excesivas (ES)
// 🔒LMS: RLS enforces user can only update their own progress_tracking rows (EN)
// 🔒LMS: RLS garantiza que el usuario solo actualiza sus propias filas de progress_tracking (ES)
export function useProgressStore() { ... }
```

| Emoji | Uso |
|---|---|
| 🎓 | Explicación de lógica educativa |
| ⚠️ | Advertencia o restricción de seguridad |
| 🔒 | Lógica de RLS o permisos |
| 🤖 | Integración con IA |
| 🐛 | Workaround de bug conocido |
| 💡 | Decisión de arquitectura no obvia |

La ausencia de este estándar en lógica crítica **bloquea el cierre de tickets**.

---

## 16. PLAN DE FASES DE IMPLEMENTACIÓN

| Fase | Nombre | Duración estimada | Dependencias |
|---|---|---|---|
| 0 | Setup (repo, CI, Supabase, Vercel, lint, auth shell) | 1–2 sem | — |
| 1 | Auth & Users (email + Google OAuth, roles, profiles) | 1–2 sem | F0 |
| 2 | Course & Content Core (CRUD, 4 viewers, player shell) | 3–4 sem | F1 |
| 3 | Enrollment & Prerequisites (progreso, prereqs, paths) | 2–3 sem | F2 |
| 4 | Evaluations (builder, runner, grading seguro) | 2 sem | F3 |
| 5 | Gamification (XP, badges, trofeos, certificados, ranking) | 2 sem | F3+F4 |
| 6 | AI Integration (chat SSE, summarize, quiz gen, kill-switch) | 1–2 sem | F4–F5 (paralela) |
| 7 | Notifications & Realtime | 1 sem | F5 |
| 8 | PWA & Offline (Workbox, manifest, install prompt, sync) | 1 sem | F2 (paralela) |
| 9 | Admin Panel (DAU, users, moderation, feature flags) | 1–2 sem | F7 |
| 10 | QA & Launch (E2E, Lighthouse, Security Advisor, beta) | 1–2 sem | F9 |

**Total estimado:** 17–22 semanas-persona (4.5–5.5 meses con 1 dev; 2.5–3 meses con 2 devs).

---

## 17. CRITERIOS DE ACEPTACIÓN GLOBALES

- Respeto total a la Constitución del Proyecto (`project_constitution.md`)
- IA no responde directamente evaluaciones activas — kill-switch enforzado
- Grading siempre en servidor — `is_correct` nunca al cliente
- `evaluation_options.is_correct` protegida por RLS + RPC `security definer`
- Roles enforzados en Edge Function + RLS, no solo frontend
- Credenciales secretas solo en variables de entorno sin prefijo `VITE_`
- Evidencia funcional verificable antes de cerrar cada fase
- Lighthouse PWA ≥ 90 performance, 100 PWA en cada PR (GitHub Action)
- Cobertura Vitest + 10 flows E2E Playwright en fase 10
- Logs y trazabilidad activos desde fase 0 (Sentry)
- Estándar `🎓LMS:` aplicado en toda lógica crítica

---

## 18. DECLARACIÓN FINAL

Este documento:

- Es un único archivo Markdown subordinado a `project_constitution.md`
- Está listo para ejecutarse con agentes Spec-Kit
- Es constitucionalmente válido y ejecutable por agentes IA
- Representa fielmente el estado actual del proyecto LMS escolar en su versión 1.0

**El aprendizaje es un proceso humano. La plataforma es su andamio — no su sustituto.**

---

**Estado:** ✅ Activa
**Versión:** 1.0
**Rol:** Primera especificación ejecutable del proyecto LMS
**Framework:** Spec-Driven Development (SpecKit / OpenSpec)
**Constitución de referencia:** `project_constitution.md`
**Blueprint técnico de referencia:** `Investigacion.md`
**Aprobación humana:** Dr. Gabo

