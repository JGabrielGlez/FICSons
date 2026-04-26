# Phase 0 Research - SPEC-001 Fundacional LMS Escolar

## Decision 1: Arquitectura frontend PWA con vertical slice
- Decision: Adoptar React + TypeScript + Vite con organizacion por features desacopladas.
- Rationale: La constitucion exige vertical slice y permite evolucion independiente por dominio.
- Alternatives considered:
  - Monolito por capas tecnicas: rechazado por acoplamiento y menor trazabilidad por feature.
  - Microfrontends desde v1: rechazado por complejidad innecesaria para 50-100 usuarios.

## Decision 2: Backend sobre Supabase + Edge Functions
- Decision: Centralizar persistencia y operaciones sensibles en Supabase (PostgreSQL, RLS, Edge Functions, Auth, Realtime).
- Rationale: Cumple el principio de seguridad no negociable y reduce costo operativo inicial.
- Alternatives considered:
  - Backend Node dedicado: rechazado por mayor costo operativo y superficie de mantenimiento.
  - Firebase-only stack: rechazado por menor alineacion con requisitos SQL/RLS declarados.

## Decision 3: Integridad de evaluaciones con grading server-side
- Decision: Mantener grading exclusivamente en Edge Function `submit-evaluation` y bloquear exposicion de `evaluation_options.is_correct` al cliente.
- Rationale: Es regla constitucional obligatoria para integridad academica y antitrampa.
- Alternatives considered:
  - Grading en cliente con ofuscacion: rechazado por inseguro.
  - Grading mixto cliente-servidor: rechazado por riesgo de filtracion de respuestas.

## Decision 4: Tutor IA socratico con kill-switch
- Decision: Invocar Gemini solo desde Edge Function `ai-chat` con JWT, rate-limit y kill-switch durante evaluaciones activas.
- Rationale: Mantiene a la IA como apoyo pedagogico y evita contaminar procesos de evaluacion.
- Alternatives considered:
  - Consumo directo desde navegador: rechazado por exposicion de API key.
  - IA sin kill-switch: rechazado por conflicto con reglas de evaluacion.

## Decision 5: Integracion de contenido externo sin OAuth
- Decision: Usar URLs pegadas por instructor + deteccion por regex para providers (YouTube, Vimeo, Drive, Slides, OneDrive, Notion).
- Rationale: Minimiza costo, complejidad operativa y dependencia de tokens externos.
- Alternatives considered:
  - OAuth por proveedor: rechazado por overhead tecnico y de soporte.
  - Hosting de videos/PDF pesados en Storage propio: rechazado por costo de egress.

## Decision 6: Estrategia PWA/offline basica
- Decision: Aplicar Workbox con precache de shell y cache selectivo de catalogo/lecciones visitadas, dejando operaciones criticas en network-first/network-only.
- Rationale: Cumple objetivo de disponibilidad de experiencia basica sin comprometer consistencia de datos.
- Alternatives considered:
  - Offline total transaccional: rechazado por complejidad de sincronizacion en v1.
  - Sin offline: rechazado por incumplir criterio de producto.

## Decision 7: SLO operativos de v1
- Decision: Fijar disponibilidad mensual 99.0%, RTO 8h, RPO 24h, retencion de logs/metricas 90 dias.
- Rationale: Balance entre resiliencia y costo para fase fundacional.
- Alternatives considered:
  - 99.9% con RTO/RPO mas estrictos: rechazado por costo operativo temprano.
  - Best effort sin objetivos: rechazado por baja trazabilidad operativa.

## Decision 8: Cumplimiento regulatorio en v1
- Decision: No fijar marco formal unico (FERPA/GDPR/LFPDPPP) en v1; aplicar buenas practicas de seguridad y privacidad ya definidas.
- Rationale: Evita bloqueo por incertidumbre juridica institucional sin degradar postura de seguridad.
- Alternatives considered:
  - Forzar FERPA/GDPR/LFPDPPP en v1: rechazado por posible desalineacion con jurisdiccion real.

## Decision 9: Observabilidad y calidad de entrega
- Decision: Integrar Sentry + CI con lint/typecheck/test/Lighthouse desde fases iniciales.
- Rationale: Asegura evidencia verificable para cierre de fases y reduce deuda de calidad acumulada.
- Alternatives considered:
  - Posponer observabilidad a pre-lanzamiento: rechazado por riesgo de diagnostico tardio.

## Outcome
Todas las areas previamente susceptibles de clarificacion en la fase de planificacion (disponibilidad, recuperacion, retencion y marco de cumplimiento) quedaron resueltas y documentadas en la especificacion.
