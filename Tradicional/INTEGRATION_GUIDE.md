**Integración de APIs con `app-core` — Guía**

Ubicación: `src/app-core/`

Este documento explica cómo cualquier API en el proyecto debe consumir e integrar el módulo central `app-core`.

---

Arquitectura simplificada

```
Express Server (server.js + src/app.js)
        │
        ├─ API: supabase  ─┐
        ├─ API: ai-chat   ──► Consumen desde: src/app-core
        ├─ API: [futura]  ─┘
        │
        └─ app-core (cliente DB + modelos compartidos)
            ├─ shared/db.js              → cliente Supabase
            ├─ shared/models/index.js    → exporta modelos
            └─ shared/models/inst*.js    → implementación de modelos
```

---

Cómo crear una nueva API que use `app-core`

**Paso 1: Crear la estructura**
```
src/api/mi-nueva-api/
  src/
    routes/
    controllers/
    services/
  package.json
  README.md
```

**Paso 2: Usar imports desde app-core**
```js
// src/api/mi-nueva-api/src/services/ejemplo.service.js
import { supabase, Instituto } from '../../../app-core';

export const miServicio = async () => {
  // Aquí ya tienes acceso a:
  // - supabase (cliente DB)
  // - Instituto (modelo con getAll, getById, etc.)
  const institutos = await Instituto.getAll();
  return institutos;
};
```

**Paso 3: Registrar la API en `src/app.js`**
```js
// src/app.js
import miNuevaApiRouter from './api/mi-nueva-api/routes/index.js';

app.use('/api/mi-nueva-api', miNuevaApiRouter);
```

---

Variables de entorno compartidas

Todos las APIs usan el mismo `.env` en la raíz del proyecto:
```env
SUPABASE_URL=...
SUPABASE_KEY=...
DATABASE=...
# ... otras variables
```

El cliente Supabase se instancia una sola vez en `src/app-core/shared/db.js` y se reutiliza.

---

Migraciones y esquema

- **Responsable**: `src/app-core/migrations/`
- **Ejecución**: Antes de iniciar el servidor (`npm run dev` o scripts de CI/CD)
- **Referencia**: `src/app-core/shared/models/*.model.js` define la estructura esperada

---

Testing

Cada API debe tener sus propios tests que:
1. Importan desde `app-core`
2. Mockan o usan una BD de test
3. Verifican contratos/interfaces

Ejemplo:
```js
// src/api/mi-nueva-api/__tests__/mi-api.test.js
import { Instituto } from '../../../app-core';

describe('mi-api', () => {
  it('debería listar institutos desde app-core', async () => {
    const institutos = await Instituto.getAll();
    expect(Array.isArray(institutos)).toBe(true);
  });
});
```

---

Buenas prácticas

✅ **Siempre:**
- Usa `app-core` como fuente única de verdad para modelos y cliente DB
- Documenta cambios en `src/app-core/README.md` si modificas tablas/modelos
- Usa versionado SemVer si publicas `app-core` como paquete
- Mantén migraciones centralizadas en `app-core`

❌ **Nunca:**
- Duplicar modelos en varias APIs
- Crear conexiones separate a la BD dentro de cada API
- Ignorar validaciones/contratos definidos en `app-core`

---

Despliegue

Si despliegas múltiples APIs como microservicios:
1. Cada uno tiene su Dockerfile
2. Comparten el mismo DB (sin divergencias de esquema)
3. Comparten el mismo `.env` o variables de entorno
4. Cada uno puede escalarse independientemente

Ejemplo despliegue en Docker Compose:
```yaml
version: '3'
services:
  api-core:
    build: .
    env_file: .env
    ports: ["3000:3000"]
    
  # En el futuro si escalas:
  # api-ai-chat:
  #   build: ./src/api/ai-chat
  #   env_file: .env
  #   ports: ["3001:3000"]
```
