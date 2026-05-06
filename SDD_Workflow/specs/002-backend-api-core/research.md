# Phase 0 Research - SPEC-002 Backend API Core LMS

## Decision 1: Supabase como backend principal
- Decision: Usar Supabase PostgreSQL + RLS + Edge Functions como runtime principal.
- Rationale: Encaja con la constitucion, reduce costo operativo y concentra la seguridad cerca de los datos.
- Alternatives considered:
  - Backend Node dedicado como principal: rechazado por mayor mantenimiento y costo.
  - Firebase/NoSQL backend: rechazado por la necesidad de SQL, RLS y RPCs.

## Decision 2: Espejo opcional Node.js/Express
- Decision: Mantener un espejo opcional Node.js/Express con el mismo contrato de API.
- Rationale: Facilita pruebas locales, migracion futura y compatibilidad con clientes sin cambiar el contrato.
- Alternatives considered:
  - No tener espejo: simplifica, pero reduce flexibilidad para validacion y despliegue alterno.
  - Duplicar logica sin contrato comun: aumenta riesgo de divergencia.

## Decision 3: RLS-first y RPCs para reglas sensibles
- Decision: Implementar acceso sensible mediante RLS y RPCs/funciones security definer.
- Rationale: Minimiza exposicion accidental de datos y centraliza la logica de prerequisitos, grading y roles.
- Alternatives considered:
  - Logica de seguridad en el cliente: rechazado por inseguro.
  - Solo triggers y vistas: insuficiente para contratos complejos de API.

## Decision 4: Grading y certificados solo server-side
- Decision: Ejecutar submit-evaluation, issue-certificate y check-achievements solo en servidor.
- Rationale: Preserva integridad academica y evita filtracion de respuestas correctas o claves.
- Alternatives considered:
  - Calificacion parcial en cliente: rechazado por filtracion de is_correct.
  - Certificados generados por cliente: rechazado por falsificacion y abuso.

## Decision 5: IA con kill-switch durante evaluaciones
- Decision: Mantener ai-chat y cualquier derivado solo en backend con bloqueo durante evaluaciones activas.
- Rationale: Cumple la regla de tutor socratico no evaluador y evita trampas.
- Alternatives considered:
  - IA accesible desde el cliente: rechazado por exposicion de secretos y riesgo de abuso.
  - IA siempre activa: rechazado por conflicto directo con evaluaciones.

## Decision 6: Contratos de API como fuente de integracion
- Decision: Formalizar endpoints y RPCs en contratos documentados por modulo.
- Rationale: Reduce ambiguedad entre Supabase, Express y futuros clientes.
- Alternatives considered:
  - Implementacion sin contrato formal: rechazado por alto riesgo de divergencia.

## Decision 7: Scope de datos del backend
- Decision: Modelar 26 entidades principales ya definidas por las specs base y conservar nomenclatura consistente.
- Rationale: Permite trazabilidad completa sin introducir nuevas entidades no aprobadas.
- Alternatives considered:
  - Simplificar el dominio de datos en exceso: rechazado por perder cobertura de modulos.

## Outcome
Las decisiones de plataforma, seguridad y contratos quedan resueltas para avanzar a modelo de datos, contratos y quickstart sin frontend.