# System Contracts - SPEC-001 Fundacional LMS Escolar

## 1. Objetivo
Definir los contratos funcionales externos e internos de alto nivel necesarios para ejecutar la version fundacional sin detallar implementacion de codigo.

## 2. Contratos de Edge Functions

### 2.1 `submit-evaluation`
- Purpose: Calificar intentos de evaluacion de forma segura en servidor.
- Input contract:
  - identity: JWT valido de usuario autenticado
  - payload: evaluation_id, answers[], attempt_context
- Output contract:
  - attempt_id, score, passed, feedback_summary
- Security contract:
  - acceso a respuestas correctas solo con service role
  - bloqueo de lectura directa de `is_correct` desde cliente

### 2.2 `ai-chat`
- Purpose: Tutor socratico con streaming.
- Input contract:
  - identity: JWT valido
  - payload: conversation_id, lesson_context, user_message
- Output contract:
  - stream de respuesta socratica + metadatos de uso
- Safety contract:
  - kill-switch cuando existe evaluacion activa
  - rate limit diario por usuario

### 2.3 `issue-certificate`
- Purpose: Emision de certificado verificable.
- Input contract:
  - identity con permisos de emision
  - payload: user_id, course_id|learning_path_id
- Output contract:
  - verification_code, certificate_url (signed), issued_at

### 2.4 `update-user-role`
- Purpose: Mutar roles de usuario segun jerarquia.
- Input contract:
  - identity de actor (`super_admin` o `admin` segun jerarquia)
  - payload: target_user_id, new_role
- Output contract:
  - target_user_id, previous_role, new_role, updated_at
- Security contract:
  - impide elevacion por encima del rol del actor

### 2.5 `check-achievements`
- Purpose: Calcular otorgamiento de XP, badges y trofeos.
- Input contract: user_id, event_type, event_payload
- Output contract: xp_delta, badges_awarded[], trophies_awarded[]

### 2.6 `enroll-course`
- Purpose: Procesar inscripcion validando prerequisitos.
- Input contract: user_id, course_id
- Output contract: enrollment_status, missing_prerequisites[]

## 3. Contratos RPC de Base de Datos

### 3.1 `verify_certificate(code)`
- Purpose: Verificacion publica de certificados.
- Input contract: verification_code
- Output contract: solo campos publicos de validez
- Privacy contract: nunca expone registro completo privado

### 3.2 `can_enroll(user, course)`
- Purpose: Evaluar si un usuario puede inscribirse.
- Input contract: user_id, course_id
- Output contract: `{ allowed: boolean, missing: course_id[] }`

## 4. Contratos de Realtime
- Canales permitidos: notifications, progress_tracking, user_badges, user_trophies, evaluation_attempts.
- Reglas:
  - solo eventos autorizados por RLS
  - no publicar datos sensibles (respuestas correctas, secretos)

## 5. Contrato de Verificacion Publica
- Ruta funcional: `/certificates/:code`
- Comportamiento esperado:
  - muestra estado valido/invalido
  - presenta datos publicos del certificado
  - aplica rate-limit por IP para abuso

## 6. Criterios de Conformidad de Contratos
- Ningun contrato debe exponer secretos o datos de evaluacion sensible.
- Todo contrato sensible requiere JWT valido y controles de rol/alcance.
- Todo contrato debe ser trazable con logs y metadatos de auditoria.
