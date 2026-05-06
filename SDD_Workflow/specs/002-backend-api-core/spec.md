# Feature Specification: SPEC-002 Backend API Core LMS

**Feature Branch**: [hook-not-available]  
**Created**: 2026-05-05  
**Status**: Draft  
**Input**: User description: "Crear una nueva especificacion solo para backend y APIs, tomando como base las especificaciones DRFIC 001, 002 y 003, sin frontend ni PWA"

## Clarifications

### Session 2026-05-05

- Q: Alcance de esta spec -> A: Solo backend, contratos de API, esquema de datos, RLS, RPCs y Edge Functions / servidor equivalente
- Q: Frontend y PWA -> A: Fuera de alcance en esta spec
- Q: Runtime de implementacion -> A: Opcion B: Supabase PostgreSQL + RLS + Edge Functions como runtime principal; espejo opcional Node.js/Express con contrato equivalente
- Q: IA en el sistema -> A: Solo server-side, con kill-switch durante evaluaciones activas

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Identidad, autenticacion y control de acceso (Priority: P1)

Construir el backend que gestione perfiles, autenticacion, roles jerarquicos y cambios de rol controlados de forma segura.

**Why this priority**: Sin identidad, roles y sesion seguros no pueden operar los demas modulos.

**Independent Test**: Se valida al registrar un usuario, autenticarlo, consultar su perfil y mutar roles solo por el camino permitido.

**Acceptance Scenarios**:

1. **Given** un usuario nuevo, **When** se registra, **Then** se crea su perfil y queda autenticado con su rol correcto.
2. **Given** un actor con permisos insuficientes, **When** intenta elevar un rol, **Then** el sistema rechaza la operacion.

---

### User Story 2 - Catalogo academico, contenido y progreso (Priority: P2)

Implementar las APIs de cursos, modulos, lecciones, fuentes de contenido, inscripciones, prerequisitos y tracking de progreso.

**Why this priority**: Es el nucleo academico del LMS y habilita el consumo del contenido.

**Independent Test**: Se valida al crear un curso, inscribir un alumno, consultar prerequisitos, registrar progreso y completar lecciones.

**Acceptance Scenarios**:

1. **Given** un curso publicado con prerequisitos, **When** un alumno intenta inscribirse sin cumplirlos, **Then** la API devuelve bloqueo con la lista de faltantes.
2. **Given** una leccion valida, **When** el alumno guarda progreso, **Then** el sistema persiste el estado y respeta RLS.

---

### User Story 3 - Evaluaciones seguras, certificacion y gamificacion (Priority: P3)

Construir las APIs para builder de evaluaciones, inicio y envio de intentos, grading server-side, logica de logros y emision/verificacion de certificados.

**Why this priority**: Es el flujo con mayor sensibilidad de seguridad e integridad academica.

**Independent Test**: Se valida al iniciar un intento, enviar respuestas, grader en servidor, otorgar logros y verificar un certificado publicamente.

**Acceptance Scenarios**:

1. **Given** una evaluacion activa, **When** el alumno envia respuestas, **Then** el score se calcula en servidor y `is_correct` nunca se expone al cliente.
2. **Given** un certificado emitido, **When** se consulta su codigo publico, **Then** el sistema devuelve solo campos publicos de verificacion.

---

### User Story 4 - IA, notificaciones, moderacion y administracion (Priority: P4)

Implementar los servicios backend de chat socratico, resueno de lecciones, advisor de datos, notificaciones realtime, moderacion y panel administrativo.

**Why this priority**: Completa la operacion del sistema y cubre las capacidades asistidas por IA y administracion.

**Independent Test**: Se valida al llamar endpoints de IA con rate limit y kill-switch, recibir notificaciones y ejecutar acciones de moderacion y admin.

**Acceptance Scenarios**:

1. **Given** una evaluacion activa, **When** se invoca el chat IA, **Then** la funcion se bloquea por kill-switch.
2. **Given** un moderador o admin autorizado, **When** consulta y resuelve flags, **Then** la operacion queda auditada.

## Edge Cases

- Intento de mutar rol por encima de la jerarquia permitida.
- Intento de leer `evaluation_options.is_correct` desde cliente.
- Intento de inscripcion con prerequisitos incompletos o con ciclo detectado.
- Intento de iniciar una evaluacion con intento activo previo.
- Invocacion de IA durante evaluacion activa.
- Verificacion publica de certificado con codigo invalido o inexistente.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST exponer autenticacion, perfil y control de roles por API segura.
- **FR-002**: El sistema MUST aplicar jerarquia de roles y bloquear escalacion indebida.
- **FR-003**: El sistema MUST modelar perfiles, unidades organizativas y scopes administrativos.
- **FR-004**: El sistema MUST exponer CRUD y consulta de cursos, modulos y lecciones.
- **FR-005**: El sistema MUST soportar cuatro tipos de contenido: video, PDF, PPTX y nota web.
- **FR-006**: El sistema MUST detectar proveedores de contenido por URL y guardar metadatos de fuente.
- **FR-007**: El sistema MUST exponer inscripciones, prerequisitos, rutas de aprendizaje y progress tracking.
- **FR-008**: El sistema MUST impedir inscripcion cuando los prerequisitos no se cumplan.
- **FR-009**: El sistema MUST detectar ciclos en prerequisitos antes de persistirlos.
- **FR-010**: El sistema MUST exponer builder, runner e historial de evaluaciones.
- **FR-011**: El sistema MUST realizar grading exclusivamente del lado servidor.
- **FR-012**: El sistema MUST impedir exposicion de `is_correct` al cliente por cualquier API publica.
- **FR-013**: El sistema MUST emitir certificados y diplomas verificables publicamente con codigo unico.
- **FR-014**: El sistema MUST exponer el chat IA socratico solo a traves de backend.
- **FR-015**: El sistema MUST aplicar kill-switch de IA cuando exista una evaluacion activa.
- **FR-016**: El sistema MUST aplicar rate limit a IA y a verificaciones publicas sensibles.
- **FR-017**: El sistema MUST exponer notificaciones realtime y su estado de lectura.
- **FR-018**: El sistema MUST exponer moderacion de flags y acciones administrativas con auditoria.
- **FR-019**: El sistema MUST mantener trazabilidad de eventos relevantes en el backend.
- **FR-020**: El sistema MUST operar con RLS en todas las tablas y sin secretos expuestos al cliente.
- **FR-021**: El sistema MUST definir contratos de API estables para Supabase Edge Functions o equivalente Express.

### Key Entities *(include if feature involves data)*

- **Profile**: Identidad del usuario, rol y datos de cuenta.
- **OrganizationalUnit**: Jerarquia institucional para scopes administrativos.
- **AdminScope**: Alcance de administracion por unidad.
- **Course / Module / Lesson**: Estructura academica principal.
- **ContentSource**: Fuente externa embebida y metadatos del proveedor.
- **Enrollment / ProgressTracking**: Inscripcion y trazabilidad de avance.
- **CoursePrerequisite / LearningPath**: Reglas de acceso y rutas de aprendizaje.
- **Evaluation / Question / Option / Attempt**: Dominio de evaluacion segura.
- **Badge / Trophy / Certificate / Diploma**: Logros y acreditaciones.
- **AIConversation**: Historial de chat socratico.
- **Notification**: Eventos operativos y de producto.
- **ModerationFlag**: Bandeja de revision y resolucion.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Todas las rutas contractuales del backend del sistema quedan documentadas y ejecutables sin frontend.
- **SC-002**: RLS queda activa en el 100% de las tablas definidas por el modelo de datos.
- **SC-003**: El grading de evaluaciones ocurre en servidor en el 100% de intentos procesados.
- **SC-004**: `evaluation_options.is_correct` nunca se expone por SELECT o API publica.
- **SC-005**: El control de IA durante evaluaciones activas se bloquea en el 100% de intentos activos.
- **SC-006**: La verificacion publica de certificados responde solo con campos publicos y con rate limit.
- **SC-007**: Los contratos de API de cada modulo mantienen consistencia entre la implementacion principal y cualquier espejo Express.
- **SC-008**: Las operaciones sensibles quedan auditadas con trazabilidad suficiente para diagnostico y control.

## Non-Goals

- No se incluye frontend, PWA, routing de UI ni experiencia visual.
- No se incluye maquetacion, componentes o estado de cliente.
- No se incluye app movil nativa.
- No se incluyen flujos de pago o SSO/SAML en esta primera version.

## Assumptions

- Esta especificacion es la base backend para el sistema LMS completo y deriva de las specs DRFIC 001, 002 y 003.
- La implementacion principal usa Supabase PostgreSQL, RLS y Edge Functions.
- El contrato de API puede reflejarse en Node.js + Express, pero el contrato no cambia entre runtimes.
- Las APIs se consumiran despues por un frontend u otros clientes, pero esta spec no define UI.
- La autoridad constitucional y las restricciones de seguridad del proyecto prevalecen sobre cualquier decision local.

## Canonical Source (Derived)

Esta especificacion se deriva y consolida a partir de:

- `SDD_Workflow/.drfic/diana-sdk/specs/001-spec-drfic.md`
- `SDD_Workflow/.drfic/diana-sdk/specs/002-spec-drfic.md`
- `SDD_Workflow/.drfic/diana-sdk/specs/003-spec-drfic.md`

## Backend Scope Summary

### Module Coverage

- `auth`: login, signup, profile, role mutation, scope control.
- `courses`: catalog, course CRUD, module CRUD, team management, reorder.
- `lessons`: lesson CRUD, content sources, progress persistence, timestamps.
- `enrollment`: prereq checks, enrollment, learning paths, cycle detection.
- `evaluations`: builder, runner, attempts, grading, attempt history.
- `ai-chat`: tutor socratico, summaries, quiz generation, kill-switch.
- `ai-data-advisor`: data conversations, dashboards, structured analytic answers.
- `gamification`: XP, badges, trophies, certificates, diplomas, verification.
- `notifications`: realtime feed, unread state, mark-read.
- `admin`: user management, role management, metrics, org units.
- `moderation`: flags, queue, resolve, dismiss.

### API Principles

- Contract-first: OpenAPI or equivalent API contract is the source for backend endpoints.
- Server-only trust boundary: client never receives secrets, service role keys or grading answers.
- Stable error model: all APIs return structured errors with code, message and details.
- RLS-first data access: database policies enforce security even if client calls database directly.
- Backend-only IA: all Gemini or similar calls run only on server-side functions.

### Operational Constraints

- Rate limit public verification and IA endpoints.
- Audit role changes, grading actions, certificate issuance and moderation decisions.
- Keep secrets in server env only; never in client bundles.
- Prefer low-cost serverless execution and database-native logic where possible.
