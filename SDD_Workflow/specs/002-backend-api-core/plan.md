# Implementation Plan: SPEC-002 Backend API Core LMS

**Branch**: `002-backend-api-core` | **Date**: 2026-05-05 | **Spec**: `/specs/002-backend-api-core/spec.md`
**Input**: Feature specification from `/specs/002-backend-api-core/spec.md`

## Summary

Construir el backend central del LMS escolar como un conjunto de contratos de API, esquema de datos, RLS, RPCs y Edge Functions server-side. La implementacion principal usa Supabase PostgreSQL + RLS + Edge Functions, con un espejo opcional Node.js/Express que respeta el mismo contrato. El alcance excluye frontend y PWA y se enfoca en auth, cursos, lecciones, progreso, evaluaciones seguras, certificacion, IA server-side, notificaciones, administracion y moderacion.

## Technical Context

**Language/Version**: TypeScript 5+, SQL/PostgreSQL, Deno para Edge Functions; Node.js 20+ solo como espejo opcional
**Primary Dependencies**: Supabase Auth, Supabase PostgreSQL, Supabase RLS, Supabase Realtime, Supabase Storage, Supabase Edge Functions, @supabase/supabase-js, Zod, Vitest, node:test o equivalente para espejo opcional
**Storage**: PostgreSQL administrado por Supabase + Supabase Storage para certificados, avatares y artefactos pequenos
**Testing**: Contract tests de API, pruebas de integracion de Edge Functions, validacion SQL/RLS y pruebas de verificacion publica
**Target Platform**: Supabase Cloud como runtime principal; Node.js/Express opcional para espejo local o despliegue equivalente
**Project Type**: web-service/backend-api
**Performance Goals**: grading server-side y verificacion publica con respuestas consistentes; endpoints sensibles con p95 bajo y rate limits definidos
**Constraints**: RLS en todas las tablas, secretos solo server-side, `evaluation_options.is_correct` nunca al cliente, kill-switch de IA en evaluaciones activas, no frontend ni PWA en este alcance
**Scale/Scope**: Volumen inicial de 50-100 usuarios, 26 tablas de dominio, 11 modulos funcionales y una capa de API estable

### Technical Context Amendment

**Node.js/Express local mirror — in scope (local dev only)**

A lightweight Node.js/Express mirror of the Supabase Edge Functions
is in scope for local development and testing purposes only.

Rationale:
	- Supabase Edge Functions run on Deno; local `supabase functions serve`
		requires Docker and adds friction for rapid iteration
	- Express mirror allows faster local testing of Edge Function logic
		without Docker dependency
	- Production deployment remains exclusively on Supabase Edge Functions
		(Deno) — the Express mirror is never deployed to Vercel or any
		public environment

Constraints:
	- Mirror must stay in sync with Edge Function logic manually
	- Any security-sensitive logic (grading, role mutation, AI proxy)
		must be validated against the Deno version before closing a task
	- Mirror lives in `/dev-mirror/` directory, excluded from production
		build via `.vercelignore` and `.gitignore` for secrets

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Gate 1 - Spec-first delivery: PASS. Existe una especificacion backend dedicada derivada de las specs DRFIC.
- Gate 2 - Security by default: PASS. El diseno fuerza RLS, grading server-side y secretos fuera del cliente.
- Gate 3 - AI as server-side tutor only: PASS. IA restringida a backend con kill-switch durante evaluaciones activas.
- Gate 4 - API contract stability: PASS. El contrato de API se mantiene estable para Supabase y el espejo Express opcional.
- Gate 5 - Operational practicality: PASS. La arquitectura prioriza costo bajo, trazabilidad y validacion automatizable.

Resultado pre-Phase 0: PASS.

Re-check post-Phase 1 design: PASS. Los artefactos de datos y contratos no introducen violaciones constitucionales.

## Project Structure

### Documentation (this feature)

```text
specs/002-backend-api-core/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api-contracts.md
│   ├── supabase-queries.md
│   └── system-contracts.md
└── tasks.md
```

### Source Code (repository root)

```text
supabase/
├── migrations/
├── functions/
│   ├── ai-chat/
│   ├── submit-evaluation/
│   ├── issue-certificate/
│   ├── update-user-role/
│   ├── check-achievements/
│   └── enroll-course/
└── seed/

backend/
├── src/
│   ├── api/
│   ├── services/
│   ├── middleware/
│   └── lib/
└── tests/

dev-mirror/
├── src/
└── tests/
```

**Structure Decision**: Se adopta una arquitectura backend-first con Supabase como runtime principal para datos, autenticacion, RLS y Edge Functions. Adicionalmente, se incluye un espejo opcional Node.js/Express solo para desarrollo local y pruebas, ubicado en `dev-mirror/` y excluido de despliegues publicos via `.vercelignore` y `.gitignore`. No se incluye frontend ni PWA en este alcance.

## Complexity Tracking

No se registran violaciones constitucionales que requieran justificacion.