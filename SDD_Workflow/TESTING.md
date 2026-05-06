# Testing Guide - SPEC-002 Backend API Core

## Setup Inicial

### 1. Requisitos
- Node.js 18+ (para dev-mirror)
- Supabase CLI instalado
- Postman instalado
- Un proyecto Supabase (local o cloud)

### 2. Correr migraciones Supabase
```bash
cd SDD_Workflow
supabase migration up
# O si usas Supabase Cloud:
# supabase db push
```

### 3. Iniciar dev-mirror (local dev server)
```bash
cd SDD_Workflow/dev-mirror
npm install
npm run dev
# Debería output: "dev-mirror listening on 3001"
```

### 4. Obtener credenciales Supabase
En `SDD_Workflow/.env.local` o desde Supabase Dashboard:
- `SUPABASE_URL` — URL del proyecto
- `SUPABASE_ANON_KEY` — Clave pública (para cliente)
- `SUPABASE_SERVICE_ROLE_KEY` — Clave privada (para Edge Functions)

---

## Variables de Postman (Entorno)

Crea un entorno en Postman con estas variables:

```json
{
  "name": "SPEC-002 Local",
  "values": [
    {
      "key": "DEV_MIRROR_URL",
      "value": "http://localhost:3001"
    },
    {
      "key": "SUPABASE_URL",
      "value": "http://localhost:54321",
      "description": "Si usas Supabase local, o https://<PROJECT>.supabase.co"
    },
    {
      "key": "SUPABASE_ANON_KEY",
      "value": "eyJhbGc...",
      "description": "Obten de Supabase Dashboard"
    },
    {
      "key": "USER_ID",
      "value": "12345678-1234-1234-1234-123456789012",
      "description": "UUID válido (genérate uno en uuidgenerator.net)"
    },
    {
      "key": "COURSE_ID",
      "value": "87654321-4321-4321-4321-210987654321"
    },
    {
      "key": "EVALUATION_ID",
      "value": "11111111-1111-1111-1111-111111111111"
    }
  ]
}
```

---

## Endpoints - Dev-Mirror (Express Local)

### 1️⃣ Submit Evaluation (Dev-Mirror)

**POST** `{{DEV_MIRROR_URL}}/dev/submit-evaluation`

Headers:
```
Content-Type: application/json
```

Body (JSON):
```json
{
  "attempt": {
    "question_1": "A",
    "question_2": "B",
    "question_3": "C"
  },
  "user_id": "{{USER_ID}}"
}
```

**Respuesta esperada (stub actual):**
```json
{
  "message": "submit-evaluation mirror placeholder"
}
```

**Respuesta real (cuando implemente lógica):**
```json
{
  "evaluation_id": "...",
  "score": 85,
  "passed": true,
  "feedback": "Respondiste 2 de 3 correctamente"
}
```

---

### 2️⃣ Update User Role (Dev-Mirror)

**POST** `{{DEV_MIRROR_URL}}/dev/update-role`

Headers:
```
Content-Type: application/json
```

Body (JSON):
```json
{
  "user_id": "{{USER_ID}}",
  "role": "instructor"
}
```

Valores permitidos para `role`:
- `student` (default)
- `instructor`
- `admin`
- `super_admin`

**Respuesta esperada (stub):**
```json
{
  "message": "update-role mirror placeholder"
}
```

**Respuesta real:**
```json
{
  "profile": {
    "id": "{{USER_ID}}",
    "role": "instructor",
    "updated_at": "2026-05-05T22:50:00Z"
  }
}
```

---

### 3️⃣ Enroll User in Course (Dev-Mirror)

**POST** `{{DEV_MIRROR_URL}}/dev/enroll`

Headers:
```
Content-Type: application/json
```

Body (JSON):
```json
{
  "user_id": "{{USER_ID}}",
  "course_id": "{{COURSE_ID}}"
}
```

**Respuesta esperada:**
```json
{
  "message": "enroll mirror placeholder"
}
```

---

## Endpoints - Supabase Edge Functions

### 4️⃣ Submit Evaluation (Edge Function)

**POST** `{{SUPABASE_URL}}/functions/v1/submit-evaluation`

Headers:
```
Content-Type: application/json
Authorization: Bearer {{SUPABASE_ANON_KEY}}
```

Body (JSON):
```json
{
  "attempt": {
    "q1": "A",
    "q2": "B"
  },
  "user_id": "{{USER_ID}}"
}
```

**Respuesta esperada (stub):**
```json
{
  "message": "submit-evaluation placeholder"
}
```

**Respuesta real (con lógica):**
```json
{
  "evaluation": {
    "id": "eva-123",
    "user_id": "{{USER_ID}}",
    "payload": {
      "q1": "A",
      "q2": "B"
    },
    "created_at": "2026-05-05T22:50:00Z"
  }
}
```

---

### 5️⃣ Update User Role (Edge Function)

**POST** `{{SUPABASE_URL}}/functions/v1/update-user-role`

Headers:
```
Content-Type: application/json
Authorization: Bearer {{SUPABASE_ANON_KEY}}
```

Body (JSON):
```json
{
  "user_id": "{{USER_ID}}",
  "role": "instructor"
}
```

**Respuesta:**
```json
{
  "profile": {
    "id": "{{USER_ID}}",
    "role": "instructor"
  }
}
```

---

## Tests con Postman (verificación automática)

Para cada request, agrega este script en la pestaña **Tests**:

```javascript
// Test 1: Verificar status code 200 o 201
pm.test("Status is 200 or 201", function () {
  pm.expect(pm.response.code).to.be.oneOf([200, 201]);
});

// Test 2: Verificar que es JSON
pm.test("Response is JSON", function () {
  pm.response.to.be.json;
});

// Test 3: Verificar campo específico
pm.test("Response has 'message' or 'evaluation' field", function () {
  const jsonData = pm.response.json();
  pm.expect(jsonData).to.have.property(
    pm.variables.get("FIELD_NAME")
  );
});
```

---

## Flujo de Testing Completo

### Escenario 1: Crear usuario y cambiar rol

```
1. POST /dev/update-role
   {
     "user_id": "{{USER_ID}}",
     "role": "instructor"
   }
   
2. POST /functions/v1/update-user-role (Edge Function)
   {
     "user_id": "{{USER_ID}}",
     "role": "admin"
   }
```

### Escenario 2: Enviar evaluación

```
1. POST /dev/submit-evaluation
   {
     "attempt": {
       "q1": "A"
     },
     "user_id": "{{USER_ID}}"
   }
   
2. POST /functions/v1/submit-evaluation (Edge Function)
   {
     "attempt": {
       "q1": "A"
     },
     "user_id": "{{USER_ID}}"
   }
```

---

## Debugging

### No conecta a dev-mirror
```bash
# Verificar que dev-mirror está corriendo
netstat -ano | findstr :3001  # Windows
lsof -i :3001                 # Mac/Linux

# Reiniciar
cd dev-mirror
npm run dev
```

### No conecta a Supabase
```bash
# Verificar credenciales en .env.local
cat .env.local

# Si usas Supabase local
supabase status

# Si usas Supabase Cloud
# Verifica SUPABASE_URL y claves en Dashboard
```

### Error "Unauthorized"
- Verifica que `SUPABASE_ANON_KEY` es correcta
- Las RLS policies pueden estar bloqueando — revisa `supabase/migrations/20260505_001_schema.sql`

### Error "Relation does not exist"
- Verifica que las migraciones se corrieron: `supabase migration list`
- Corre nuevamente: `supabase migration up`

---

## Próximos pasos (cuando implemente lógica real)

1. **Implementar grading server-side** en `submit-evaluation`
2. **Escribir pgTAP tests** para RLS policies
3. **Tests de integración** en dev-mirror con vitest
4. **AI endpoints** con rate-limiting y kill-switch

---

## Archivos clave para testing

- Dev-mirror server: `SDD_Workflow/dev-mirror/src/server.ts`
- Edge Functions: `SDD_Workflow/supabase/functions/*/index.ts`
- Migrations: `SDD_Workflow/supabase/migrations/20260505_001_schema.sql`
- Tests unitarios: `SDD_Workflow/dev-mirror/tests/submit-evaluation.spec.ts`
