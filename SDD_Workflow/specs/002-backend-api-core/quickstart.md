# Quickstart - SPEC-002 Backend API Core LMS

## 1. Objetivo
Validar y arrancar la implementacion backend-only del LMS escolar con Supabase como runtime principal y, opcionalmente, con un espejo Express.

## 2. Precondiciones
- Spec backend aprobada y clarificada.
- Proyecto Supabase disponible con Auth, PostgreSQL, Storage y Edge Functions.
- Variables de entorno de servidor listas para secretos.
- Si se usa espejo, Node.js 20+ y un entorno local para Express.

## 3. Flujo recomendado por fases
1. Fase 0 Research
   - Cerrar decisiones de runtime, seguridad y contratos.
2. Fase 1 Data Model y Contracts
   - Aplicar migraciones, RLS, RPCs y contratos por modulo.
3. Fase 1 Quick Validation
   - Verificar auth, roles, grading server-side, prerequisitos y certificados.
4. Fase 2 Edge Functions
   - Implementar submit-evaluation, issue-certificate, update-user-role, check-achievements, enroll-course y ai-chat.
5. Fase 3 Observability and Hardening
   - Agregar logs, rate limits, auditoria y pruebas de contrato.

## 4. Checklist minimo de arranque tecnico
- RLS activa en todas las tablas desde el primer migration.
- `evaluation_options.is_correct` nunca expuesto por cliente ni API publica.
- `submit-evaluation` usa service role o acceso equivalente server-side.
- `ai-chat` y derivados bloqueados durante evaluaciones activas.
- `verify_certificate(code)` devuelve solo datos publicos.
- Roles mutados solo via `update-user-role`.

## 5. Validaciones de aceptacion temprana
- Un usuario puede registrarse, autenticarse y recuperar su perfil.
- Un alumno bloqueado por prerequisitos recibe respuesta de rechazo con detalles.
- Un intento de evaluacion devuelve score calculado en servidor.
- La verificacion publica de certificados responde con codigo valido/invalido.
- Los endpoints sensibles respetan rate limit y auditoria.

## 6. Resultado esperado de la fase de plan
Al terminar esta fase, el equipo puede ejecutar `/speckit.tasks` para descomponer la implementacion backend en tareas dependientes sin ambiguedades criticas.