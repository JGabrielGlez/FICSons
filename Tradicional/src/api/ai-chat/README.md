**AI Chat - Integración con `app-core`**

Este servicio consume el cliente DB y modelos compartidos desde `src/app-core`.

Importación recomendada (desde `src/api/ai-chat/src`):

**Opción 1: Usar el índice principal de app-core (recomendado)**
```js
import { supabase, Instituto } from '../../../app-core';
// o con named export + default
import appCore, { supabase, Instituto } from '../../../app-core';
```

**Opción 2: Importar directamente de sub-módulos**
```js
import supabase from '../../../app-core/shared/db.js';
import { Instituto } from '../../../app-core/shared/models/index.js';
```

---

Buenas prácticas

- No dupliques modelos ni lógica de acceso a datos.
- Si despliegas `ai-chat` por separado, asegúrate de que su `NODE_PATH` respete las importaciones relativas.
- Usa siempre `app-core/shared` como fuente única de verdad para cliente DB y modelos.
- Documenta aquí si añades nuevos modelos o servicios específicos del chat.

---

Estructura esperada

```
ai-chat/
  src/
    index.js          ← ejemplo de uso con imports desde app-core
    controllers/      ← lógica específica del chat
    services/         ← servicios del chat (pueden llamar a modelos compartidos)
    routes/           ← rutas del chat
  package.json
  README.md           ← este archivo
```
