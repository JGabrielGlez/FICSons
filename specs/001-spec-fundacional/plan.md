# Implementation Plan: SPEC-001 Fundacional LMS Escolar

**Branch**: `001-spec-fundacional` | **Date**: 2026-04-26 | **Spec**: `/specs/001-spec-fundacional/spec.md`
**Input**: Feature specification from `/specs/001-spec-fundacional/spec.md`

## Summary

Construir una plataforma LMS escolar tipo PWA con arquitectura por features desacopladas, seguridad estricta en Supabase (RLS desde el primer migration), grading de evaluaciones exclusivamente en servidor, progresion academica con prerequisitos, gamificacion y certificados verificables, e integracion de tutor IA socratico en Edge Functions con kill-switch durante evaluaciones activas.

La implementacion prioriza costo operativo inicial bajo para 50-100 usuarios, continuidad de servicio definida (99.0% mensual, RTO 8h, RPO 24h), y trazabilidad completa de progreso academico.

## Technical Context

**Language/Version**: TypeScript 5+, SQL (PostgreSQL administrado por Supabase), Deno para Edge Functions  
**Primary Dependencies**: React 18+, Vite, Tailwind CSS, shadcn/ui + Radix UI, Zustand, TanStack Query v5, React Hook Form + Zod, vite-plugin-pwa + Workbox, Supabase, @google/genai, Resend + React Email  
**Storage**: Supabase PostgreSQL (26 tablas) + Supabase Storage (avatares, thumbnails, badges, certificados)  
**Testing**: Vitest + React Testing Library (unit/integration), Playwright (E2E), Lighthouse en CI  
**Target Platform**: Navegador web moderno como PWA + despliegue en Vercel Pro + backend serverless en Supabase  
**Project Type**: web-application (frontend SPA/PWA + BaaS/Edge Functions)  
**Performance Goals**: Lighthouse PWA 100 y performance >= 90 en PR; disponibilidad mensual 99.0%  
**Constraints**: Grading solo servidor, `evaluation_options.is_correct` nunca al cliente, kill-switch IA durante evaluaciones, RLS en todas las tablas, retencion de logs/metricas 90 dias, RTO 8h, RPO 24h, offline basico garantizado  
**Scale/Scope**: 50-100 usuarios en v1, 26 entidades de dominio, 11 features constitucionales

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Gate 1 - Spec-first delivery: PASS. Existe especificacion fundacional aprobada y clarificada.
- Gate 2 - Seguridad de datos y secretos: PASS. Plan mantiene RLS total, grading server-side y secretos fuera del cliente.
- Gate 3 - Arquitectura por features desacopladas: PASS. Estructura de implementacion propuesta mantiene vertical slice.
- Gate 4 - IA como tutor socratico no evaluador: PASS. IA restringida a Edge Functions con kill-switch en evaluaciones.
- Gate 5 - Calidad y evidencia: PASS. Estrategia de testing y objetivos Lighthouse definidos.

Resultado pre-Phase 0: PASS.

Re-check post-Phase 1 design: PASS. Artefactos de datos y contratos no introducen violaciones constitucionales.

## Project Structure

### Documentation (this feature)

```text
specs/001-spec-fundacional/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── system-contracts.md
└── tasks.md
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── features/
│   │   ├── auth/
│   │   ├── courses/
│   │   ├── lessons/
│   │   ├── evaluations/
│   │   ├── gamification/
│   │   ├── ai-chat/
│   │   ├── admin/
│   │   ├── super-admin/
│   │   ├── moderation/
│   │   ├── profile/
│   │   └── notifications/
│   ├── shared/
│   └── app/
└── tests/
    ├── unit/
    └── integration/

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

tests/
└── e2e/
```

**Structure Decision**: Se adopta estructura web-app con frontend desacoplado por features y backend en Supabase (migrations + Edge Functions) para cumplir constitucion, escalabilidad funcional y bajo costo operativo.

## Complexity Tracking

No se registran violaciones constitucionales que requieran justificacion.
