**App core - Contratos y responsabilidades**

Propósito: Contener la lógica central, definiciones de modelos, migraciones y la configuración de acceso a datos.

Ubicación: `src/app-core`

Componentes principales:
- `shared/` : cliente DB compartido y modelos reutilizables por otros subservicios.
- `migrations/` : scripts y definiciones para mantener esquema único.
- `index.js` : punto de entrada central (exporta cliente y modelos).
- `package.json` : define la estructura de paquete con exports.

---

Cómo usar desde otro módulo

**Opción 1: Importación desde el índice principal**
```js
import { supabase, Instituto } from '../../app-core';
// o
import appCore from '../../app-core';
const { supabase, Instituto } = appCore;
```

**Opción 2: Importación directa de sub-módulos**
```js
import supabase from '../../app-core/shared/db.js';
import { Instituto } from '../../app-core/shared/models/index.js';
```

**Opción 3: Usando los exports del package.json (si instalado como paquete)**
```js
import { supabase, Instituto } from '@app-rest-security/core';
// o
import Instituto from '@app-rest-security/core/models/instituto';
```

---

Buenas prácticas

- Todas las migraciones gestionadas desde `app-core`.
- Otros módulos (por ejemplo `ai-chat`) deben importar modelos/cliente desde `app-core`.
- Documentar en este README cualquier tabla "propiedad" del core.
- No duplicar modelos ni lógica de acceso a datos en otros módulos.
- Usar versionado SemVer si se publica como paquete independiente.

---

Tablas/Recursos gestionados por `app-core`

- `institutos`: Catálogo de institutos (primaria — todas las APIs pueden leerla, solo core puede modificarla si aplica RLS)
