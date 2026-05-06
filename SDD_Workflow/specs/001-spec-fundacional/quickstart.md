# Quickstart - SPEC-001 Fundacional LMS Escolar

## 1. Objetivo
Guiar la ejecucion inicial de la implementacion en alineacion con la constitucion y la especificacion clarificada.

## 2. Precondiciones
- Branch activa: `001-spec-fundacional`
- Artefactos disponibles:
  - `spec.md`
  - `plan.md`
  - `research.md`
  - `data-model.md`
  - `contracts/system-contracts.md`
- Cuenta y proyecto Supabase disponibles.
- Proyecto Vercel preparado para despliegue de frontend.

## 3. Flujo recomendado por fases (resumen)
1. Fase 0 Setup
   - Inicializar frontend PWA y pipeline CI.
   - Configurar Sentry y politicas base de calidad.
2. Fase 1 Auth & Users
   - Implementar autenticacion y perfiles con jerarquia de roles.
3. Fase 2-4 Core academico
   - Cursos/modulos/lecciones, inscripcion/prerequisitos, evaluaciones seguras.
4. Fase 5-7 Expansiones funcionales
   - Gamificacion, IA socratica segura, notificaciones realtime.
5. Fase 8-10 Hardening y lanzamiento
   - PWA/offline, panel admin, QA final y beta.

## 4. Checklist minimo de arranque tecnico
- RLS activa en todas las tablas desde el primer migration.
- `evaluation_options.is_correct` nunca expuesto al cliente.
- Edge Functions con secretos en entorno server-side (sin `VITE_`).
- Kill-switch de IA en evaluaciones activas.
- Estrategia de cache/offline alineada a spec.

## 5. Validaciones de aceptacion temprana
- Lighthouse: PWA 100 y performance >= 90 en CI.
- Cobertura de pruebas base disponible (unit/integration/E2E).
- Objetivos operativos declarados y monitoreables:
  - disponibilidad 99.0%
  - RTO 8h
  - RPO 24h
  - retencion de logs/metricas 90 dias

## 6. Resultado esperado de la fase de plan
Al terminar esta fase, el equipo puede ejecutar `/speckit.tasks` para descomponer implementacion en tareas dependientes sin ambiguedades criticas.
