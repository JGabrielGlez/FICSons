# T4 - Actividad 1: Desarrollo de una Aplicación RESTful API con Arquitectura de Microservicios en Express

**Docente:** Dr. Francisco Ibarra Carlos  
**App:** `AppRESTeSecurity`  
**Estrategia de separación:** Una subcarpeta y prefijo de ruta por cada base de datos  
**BDs:** MongoDB · Supabase · Neo4j · Azure Cosmos DB  

---

## Índice

1. [Parte A — Explicación teórica](#parte-a)
2. [Parte B — Crear la estructura del proyecto](#parte-b)
3. [Parte C — Clase Modelo (solo MongoDB)](#parte-c)
4. [Parte D — Variables de entorno y conexiones NoSQL](#parte-d)
5. [Parte E — Servicios por BD (Service)](#parte-e)
6. [Parte F — Controladores por BD (Controller)](#parte-f)
7. [Parte G — Ruteo por BD (Router)](#parte-g)
8. [Parte H — Configuración de Express (app.js)](#parte-h)
9. [Parte I — Servidor principal (server.js)](#parte-i)
10. [Resumen de endpoints](#endpoints)
11. [Criterios de la Rúbrica y cómo cubrirlos](#rubrica)

---

## Orden real de desarrollo (hoja de ruta)

Antes de entrar al detalle de cada parte, este es el camino a seguir desde cero:

```
[1]  Teoría (Parte A)                → entender qué vas a construir
[2]  Scaffolding (Parte B)           → npm init, dependencias, carpetas
[3]  .env (Parte D — solo el archivo)→ necesitas las credenciales de las 4 BDs  ⚠ BLOQUEANTE
[4]  db.js (Parte D — conexiones)    → con credenciales ya disponibles
[5]  Modelo MongoDB (Parte C)        → necesitas las notas del maestro FIC       ⚠ BLOQUEANTE
[6]  Services × 4 (Parte E)         → uno por BD, usan db.js y el modelo
[7]  Controllers × 4 (Parte F)      → uno por BD, llaman a su service
[8]  Routers × 4 (Parte G)          → uno por BD, llaman a su controller
[9]  app.js (Parte H)                → registra los 4 grupos de rutas
[10] server.js (Parte I)             → conecta BDs y levanta el servidor
[11] Pruebas en Postman              → verificar los 20 endpoints (5 × 4 BDs)
```

---

## Parte A — Explicación teórica: Microservicios en RESTful API con Express {#parte-a}

### ¿Qué se debe entregar?

Un texto en el reporte que explique con tus propias palabras:

1. **¿Qué es una API RESTful?**  
   Define los principios REST: sin estado (stateless), recursos identificados por URI, operaciones HTTP estándar (GET, POST, PUT, DELETE) y respuestas en JSON. Explica cómo Express los implementa mediante rutas y middlewares.

2. **¿Qué es la arquitectura de microservicios?**  
   En lugar de un monolito, la lógica se divide en módulos independientes. En esta práctica, cada "microservicio" es un conjunto de archivos (`Model → Service → Controller → Router`) que gestiona un único recurso (Institutos) contra una única BD.

3. **Ventajas en Express/Node.js:**
   - Cada módulo es independiente: se puede cambiar el Service de Neo4j sin tocar el de MongoDB.
   - Se pueden agregar nuevas BDs sin modificar las existentes.
   - Facilita las pruebas aisladas de cada capa.

4. **Flujo de una petición (diagrama para el reporte):**

```
Cliente HTTP (Postman)
        │
        ▼
┌────────────────────────────────────────────────────────┐
│                     Express Server                     │
│                                                        │
│  /api/mongo/institutos    → [ Router Mongo ]           │
│  /api/supabase/institutos → [ Router Supabase ]        │
│  /api/neo4j/institutos    → [ Router Neo4j ]           │
│  /api/azure/institutos    → [ Router Azure ]           │
│              │                                         │
│              ▼                                         │
│        [ Controller ]   ← maneja req / res             │
│              │                                         │
│              ▼                                         │
│         [ Service ]     ← lógica de acceso a la BD     │
│              │                                         │
│              ▼                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  MongoDB  │  Supabase  │  Neo4j  │  Azure Cosmos │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

> Este diagrama cuenta como el organigrama requerido en la rúbrica (categoría *Análisis y Diseño*).

---

## Parte B — Crear la estructura del proyecto {#parte-b}

### Paso 1: Inicializar el proyecto

```bash
mkdir AppRESTeSecurity
cd AppRESTeSecurity
npm init -y
```

### Paso 2: Instalar dependencias

```bash
# Core
npm install express dotenv

# Una por cada BD
npm install mongoose                  # MongoDB
npm install @supabase/supabase-js     # Supabase
npm install neo4j-driver              # Neo4j
npm install @azure/cosmos             # Azure Cosmos DB

# Desarrollo
npm install --save-dev nodemon
```

### Paso 3: Estructura de carpetas

Cada BD tiene su propia subcarpeta dentro de `institutos/`. Esto es la implementación de la separación por prefijo de ruta:

```
AppRESTeSecurity/
│
├── src/
│   ├── config/
│   │   └── db.js                              ← conexiones a las 4 BDs
│   │
│   └── institutos/                            ← recurso "Catálogo de Institutos"
│       │
│       ├── mongo/                             ← microservicio MongoDB
│       │   ├── instituto.model.js             ← esquema Mongoose (SOLO aquí existe modelo)
│       │   ├── instituto.service.js           ← lógica con Mongoose
│       │   ├── instituto.controller.js        ← req/res para mongo
│       │   └── instituto.routes.js            ← /api/mongo/institutos
│       │
│       ├── supabase/                          ← microservicio Supabase
│       │   ├── instituto.service.js           ← lógica con supabase-js
│       │   ├── instituto.controller.js
│       │   └── instituto.routes.js            ← /api/supabase/institutos
│       │
│       ├── neo4j/                             ← microservicio Neo4j
│       │   ├── instituto.service.js           ← lógica con Cypher queries
│       │   ├── instituto.controller.js
│       │   └── instituto.routes.js            ← /api/neo4j/institutos
│       │
│       └── azure/                             ← microservicio Azure Cosmos DB
│           ├── instituto.service.js           ← lógica con CosmosClient
│           ├── instituto.controller.js
│           └── instituto.routes.js            ← /api/azure/institutos
│
├── src/app.js                                 ← Express: middlewares + registro de rutas
├── .env                                       ← credenciales (NO subir a Git)
├── .gitignore
├── server.js                                  ← punto de entrada principal
└── package.json
```

> **Por qué solo `mongo/` tiene `instituto.model.js`:**  
> Mongoose (ODM de MongoDB) requiere definir un esquema antes de operar. Supabase, Neo4j y Azure trabajan directamente con objetos JSON a través de sus propios clientes, sin necesidad de un archivo de modelo separado.

### Paso 4: Scripts en `package.json`

```json
"scripts": {
  "start": "node server.js",
  "dev":   "nodemon server.js"
}
```

### Paso 5: `.gitignore`

```
node_modules/
.env
```

---

## Parte C — Clase Modelo (solo MongoDB) {#parte-c}

### Archivo: `src/institutos/mongo/instituto.model.js`

> ⚠️ **IMPORTANTE:** Los campos del Catálogo de Institutos están definidos en las **notas del maestro FIC**. No escribas campos inventados. Consulta esas notas antes de continuar con este archivo.

```javascript
// src/institutos/mongo/instituto.model.js
// Esquema Mongoose para el Catálogo de Institutos — BD: MongoDB

const mongoose = require('mongoose');

// ← Reemplaza los comentarios con los campos reales de las notas del maestro FIC
const InstitutoSchema = new mongoose.Schema(
  {
    // campo1: { type: String,  required: true  },  // descripción del campo
    // campo2: { type: Number,  required: false },  // descripción del campo
    // campo3: { type: String                   },  // descripción del campo
    // ... (definidos por el maestro)
  },
  {
    timestamps: true  // agrega createdAt y updatedAt automáticamente
  }
);

const Instituto = mongoose.model('Instituto', InstitutoSchema);

module.exports = Instituto;
```

---

## Parte D — Variables de entorno y conexiones NoSQL {#parte-d}

### Archivo: `.env`

```env
# ── Servidor ─────────────────────────────────────────────────────
PORT=3000

# ── MongoDB ──────────────────────────────────────────────────────
MONGODB_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/<nombreDB>?retryWrites=true&w=majority

# ── Supabase ─────────────────────────────────────────────────────
SUPABASE_URL=https://<tu-proyecto>.supabase.co
SUPABASE_KEY=<tu-anon-key>

# ── Neo4j ─────────────────────────────────────────────────────────
NEO4J_URI=bolt://<host>:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=<tu-password>

# ── Azure Cosmos DB ───────────────────────────────────────────────
AZURE_COSMOS_ENDPOINT=https://<tu-cuenta>.documents.azure.com:443/
AZURE_COSMOS_KEY=<tu-primary-key>
AZURE_COSMOS_DATABASE=<nombre-db>
AZURE_COSMOS_CONTAINER=institutos
```

### Archivo: `src/config/db.js`

```javascript
// src/config/db.js
// Módulo central: inicializa y exporta los clientes de las 4 BDs NoSQL

require('dotenv').config();

const mongoose         = require('mongoose');
const { createClient } = require('@supabase/supabase-js');
const neo4j            = require('neo4j-driver');
const { CosmosClient } = require('@azure/cosmos');

// ── 1. MongoDB ────────────────────────────────────────────────────
/**
 * Conecta Mongoose a MongoDB Atlas.
 * Se llama una sola vez desde server.js al arrancar.
 */
const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB conectado');
  } catch (error) {
    console.error('❌ MongoDB error:', error.message);
    process.exit(1);  // falla crítica: detiene el servidor
  }
};

// ── 2. Supabase ───────────────────────────────────────────────────
/**
 * Cliente Supabase — listo para usar sin llamada de conexión explícita.
 */
const supabaseClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// ── 3. Neo4j ──────────────────────────────────────────────────────
/**
 * Driver de Neo4j. Se verifica la conectividad al iniciar.
 */
const neo4jDriver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

const connectNeo4j = async () => {
  try {
    await neo4jDriver.verifyConnectivity();
    console.log('✅ Neo4j conectado');
  } catch (error) {
    console.error('❌ Neo4j error:', error.message);
  }
};

// ── 4. Azure Cosmos DB ────────────────────────────────────────────
/**
 * Cliente de Azure Cosmos DB.
 * Se verifica leyendo la BD configurada en .env.
 */
const cosmosClient = new CosmosClient({
  endpoint: process.env.AZURE_COSMOS_ENDPOINT,
  key:      process.env.AZURE_COSMOS_KEY
});

const connectAzure = async () => {
  try {
    const { database } = await cosmosClient
      .database(process.env.AZURE_COSMOS_DATABASE)
      .read();
    console.log(`✅ Azure Cosmos DB conectado: ${database.id}`);
  } catch (error) {
    console.error('❌ Azure Cosmos DB error:', error.message);
  }
};

module.exports = {
  connectMongoDB,
  supabaseClient,
  neo4jDriver,
  connectNeo4j,
  cosmosClient,
  connectAzure
};
```

---

## Parte E — Servicios por BD (Service) {#parte-e}

El Service es la única capa que difiere entre las 4 carpetas porque cada tecnología tiene su propio cliente y sintaxis.

---

### `src/institutos/mongo/instituto.service.js`

```javascript
// src/institutos/mongo/instituto.service.js
// Servicio MongoDB — operaciones CRUD con Mongoose

const Instituto = require('./instituto.model');

/** Retorna todos los documentos de la colección */
const getAll  = async ()         => await Instituto.find();

/** Retorna un documento por su _id de MongoDB */
const getById = async (id)       => await Instituto.findById(id);

/** Crea y persiste un nuevo documento */
const create  = async (data)     => await new Instituto(data).save();

/**
 * Actualiza un documento existente.
 * { new: true }          → devuelve el documento ya actualizado
 * { runValidators: true } → aplica las validaciones del esquema
 */
const update  = async (id, data) =>
  await Instituto.findByIdAndUpdate(id, data, { new: true, runValidators: true });

/** Elimina un documento por su _id */
const remove  = async (id)       => await Instituto.findByIdAndDelete(id);

module.exports = { getAll, getById, create, update, remove };
```

---

### `src/institutos/supabase/instituto.service.js`

```javascript
// src/institutos/supabase/instituto.service.js
// Servicio Supabase — operaciones CRUD con el cliente supabase-js

const { supabaseClient } = require('../../config/db');
const TABLE = 'institutos';  // nombre de la tabla en Supabase

/** Retorna todas las filas de la tabla */
const getAll = async () => {
  const { data, error } = await supabaseClient.from(TABLE).select('*');
  if (error) throw new Error(error.message);
  return data;
};

/** Retorna una fila por su columna id */
const getById = async (id) => {
  const { data, error } = await supabaseClient
    .from(TABLE).select('*').eq('id', id).single();
  if (error) throw new Error(error.message);
  return data;
};

/** Inserta una nueva fila */
const create = async (body) => {
  const { data, error } = await supabaseClient
    .from(TABLE).insert([body]).select().single();
  if (error) throw new Error(error.message);
  return data;
};

/** Actualiza una fila existente por id */
const update = async (id, body) => {
  const { data, error } = await supabaseClient
    .from(TABLE).update(body).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
};

/** Elimina una fila por id */
const remove = async (id) => {
  const { data, error } = await supabaseClient
    .from(TABLE).delete().eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
};

module.exports = { getAll, getById, create, update, remove };
```

---

### `src/institutos/neo4j/instituto.service.js`

```javascript
// src/institutos/neo4j/instituto.service.js
// Servicio Neo4j — operaciones CRUD con Cypher queries

const { neo4jDriver } = require('../../config/db');

/**
 * Abre una sesión, ejecuta el query Cypher y la cierra siempre.
 * Mapea los registros a objetos planos con sus propiedades.
 * @param {string} query  - Query Cypher
 * @param {Object} params - Parámetros del query
 */
const runQuery = async (query, params = {}) => {
  const session = neo4jDriver.session();
  try {
    const result = await session.run(query, params);
    return result.records.map(r => r.get('n').properties);
  } finally {
    await session.close();  // siempre se cierra, haya error o no
  }
};

/** Retorna todos los nodos con label Instituto */
const getAll = () =>
  runQuery('MATCH (n:Instituto) RETURN n');

/** Retorna un nodo por su propiedad id */
const getById = (id) =>
  runQuery('MATCH (n:Instituto {id: $id}) RETURN n', { id });

/**
 * Crea un nuevo nodo Instituto.
 * Se genera un id único usando Date.now() como string.
 */
const create = (body) =>
  runQuery(
    'CREATE (n:Instituto $props) RETURN n',
    { props: { id: Date.now().toString(), ...body } }
  );

/** Actualiza propiedades de un nodo existente (SET n += agrega sin borrar) */
const update = (id, body) =>
  runQuery(
    'MATCH (n:Instituto {id: $id}) SET n += $props RETURN n',
    { id, props: body }
  );

/** Elimina un nodo por id y retorna el conteo de eliminados */
const remove = async (id) => {
  const session = neo4jDriver.session();
  try {
    const result = await session.run(
      'MATCH (n:Instituto {id: $id}) DELETE n RETURN count(n) AS deleted',
      { id }
    );
    return { deleted: result.records[0].get('deleted').toNumber() };
  } finally {
    await session.close();
  }
};

module.exports = { getAll, getById, create, update, remove };
```

---

### `src/institutos/azure/instituto.service.js`

```javascript
// src/institutos/azure/instituto.service.js
// Servicio Azure Cosmos DB — operaciones CRUD con CosmosClient

const { cosmosClient } = require('../../config/db');

/**
 * Referencia al contenedor de Cosmos DB.
 * Se obtiene dinámicamente desde las variables de entorno.
 */
const getContainer = () =>
  cosmosClient
    .database(process.env.AZURE_COSMOS_DATABASE)
    .container(process.env.AZURE_COSMOS_CONTAINER);

/** Retorna todos los documentos del contenedor */
const getAll = async () => {
  const { resources } = await getContainer().items.readAll().fetchAll();
  return resources;
};

/** Retorna un documento por su id de Cosmos DB */
const getById = async (id) => {
  const { resource } = await getContainer().item(id, id).read();
  return resource;
};

/** Crea un nuevo documento */
const create = async (body) => {
  const { resource } = await getContainer().items.create(body);
  return resource;
};

/** Reemplaza un documento completo por id (PUT semántico) */
const update = async (id, body) => {
  const { resource } = await getContainer().item(id, id).replace({ id, ...body });
  return resource;
};

/** Elimina un documento por id */
const remove = async (id) => {
  await getContainer().item(id, id).delete();
  return { id, deleted: true };
};

module.exports = { getAll, getById, create, update, remove };
```

---

## Parte F — Controladores por BD (Controller) {#parte-f}

El Controller es **idéntico en las 4 carpetas**. Lo único que cambia es el `require` del service, que apunta al service de su propia carpeta. Crea este mismo archivo en `mongo/`, `supabase/`, `neo4j/` y `azure/`.

```javascript
// src/institutos/[mongo|supabase|neo4j|azure]/instituto.controller.js
// Controlador: recibe req/res y delega la lógica al service de esta BD

const service = require('./instituto.service');
// Al estar en la misma carpeta, cada controller usa su propio service automáticamente

/**
 * GET /api/[bd]/institutos
 * Retorna todos los institutos
 */
const getAll = async (req, res) => {
  try {
    const data = await service.getAll();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/[bd]/institutos/:id
 * Retorna un instituto por ID
 */
const getById = async (req, res) => {
  try {
    const data = await service.getById(req.params.id);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Instituto no encontrado' });
    }
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/[bd]/institutos
 * Crea un nuevo instituto con los datos del body
 */
const create = async (req, res) => {
  try {
    const data = await service.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/[bd]/institutos/:id
 * Actualiza un instituto existente
 */
const update = async (req, res) => {
  try {
    const data = await service.update(req.params.id, req.body);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Instituto no encontrado' });
    }
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * DELETE /api/[bd]/institutos/:id
 * Elimina un instituto
 */
const remove = async (req, res) => {
  try {
    const data = await service.remove(req.params.id);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Instituto no encontrado' });
    }
    res.status(200).json({ success: true, message: 'Instituto eliminado', data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAll, getById, create, update, remove };
```

> Copia este archivo exactamente igual a las 4 subcarpetas. El `require('./instituto.service')` resuelve al service de su propia carpeta en cada caso, sin necesidad de cambiar nada.

---

## Parte G — Ruteo por BD (Router) {#parte-g}

Igual que el Controller, el Router es **idéntico en las 4 carpetas**. Copia el mismo archivo en cada subcarpeta.

```javascript
// src/institutos/[mongo|supabase|neo4j|azure]/instituto.routes.js
// Ruteo: mapea cada método HTTP + URL a su función de controller

const express    = require('express');
const router     = express.Router();
const controller = require('./instituto.controller');

// GET    /       → obtener todos los institutos
router.get('/',    controller.getAll);

// GET    /:id    → obtener un instituto por ID
router.get('/:id', controller.getById);

// POST   /       → crear nuevo instituto
router.post('/',   controller.create);

// PUT    /:id    → actualizar instituto existente
router.put('/:id', controller.update);

// DELETE /:id    → eliminar instituto
router.delete('/:id', controller.remove);

module.exports = router;
```

> Copia este archivo exactamente igual a las 4 subcarpetas.

---

## Parte H — Configuración de Express (`app.js`) {#parte-h}

Aquí se registran los 4 grupos de rutas. Cada prefijo deja claro contra qué BD opera ese grupo de endpoints.

### Archivo: `src/app.js`

```javascript
// src/app.js
// Configuración de Express: middlewares y registro de los 4 grupos de rutas

const express = require('express');
const app     = express();

// ── Middlewares globales ──────────────────────────────────────────
app.use(express.json());                         // parsear body JSON
app.use(express.urlencoded({ extended: true })); // parsear form-urlencoded

// ── Registro de rutas por base de datos ──────────────────────────
const mongoRoutes    = require('./institutos/mongo/instituto.routes');
const supabaseRoutes = require('./institutos/supabase/instituto.routes');
const neo4jRoutes    = require('./institutos/neo4j/instituto.routes');
const azureRoutes    = require('./institutos/azure/instituto.routes');

app.use('/api/mongo/institutos',    mongoRoutes);
app.use('/api/supabase/institutos', supabaseRoutes);
app.use('/api/neo4j/institutos',    neo4jRoutes);
app.use('/api/azure/institutos',    azureRoutes);

// ── Ruta raíz: verifica que el servidor corre ─────────────────────
app.get('/', (req, res) => {
  res.json({
    app:    'AppRESTeSecurity',
    status: 'running ✅',
    endpoints: [
      '/api/mongo/institutos',
      '/api/supabase/institutos',
      '/api/neo4j/institutos',
      '/api/azure/institutos'
    ]
  });
});

module.exports = app;
```

---

## Parte I — Servidor principal (`server.js`) {#parte-i}

### Archivo: `server.js`

```javascript
// server.js
// Punto de entrada de AppRESTeSecurity
// Conecta las 4 BDs y levanta el servidor Express

require('dotenv').config();

const app = require('./src/app');
const {
  connectMongoDB,
  connectNeo4j,
  connectAzure
} = require('./src/config/db');
// Nota: Supabase no requiere función de conexión explícita;
// su cliente queda listo al ser importado en db.js

const PORT = process.env.PORT || 3000;

/**
 * startServer
 * Inicializa las conexiones a las 4 BDs y luego levanta el servidor HTTP.
 * MongoDB es crítico (process.exit si falla).
 * Neo4j y Azure no son críticos (solo se registra el error y continúa).
 */
const startServer = async () => {
  try {
    await connectMongoDB();  // crítico — detiene todo si falla
    await connectNeo4j();    // no crítico — continúa si falla
    await connectAzure();    // no crítico — continúa si falla

    // Supabase: el cliente ya fue instanciado al importar db.js
    console.log('✅ Supabase client listo');

    app.listen(PORT, () => {
      console.log(`🚀 AppRESTeSecurity corriendo en http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('❌ Error crítico al iniciar:', error.message);
    process.exit(1);
  }
};

startServer();
```

---

## Resumen de endpoints disponibles {#endpoints}

**20 endpoints en total** — 5 operaciones × 4 bases de datos:

| Método   | MongoDB                          | Supabase                            | Neo4j                            | Azure                            |
|----------|----------------------------------|-------------------------------------|----------------------------------|----------------------------------|
| `GET`    | `/api/mongo/institutos`          | `/api/supabase/institutos`          | `/api/neo4j/institutos`          | `/api/azure/institutos`          |
| `GET`    | `/api/mongo/institutos/:id`      | `/api/supabase/institutos/:id`      | `/api/neo4j/institutos/:id`      | `/api/azure/institutos/:id`      |
| `POST`   | `/api/mongo/institutos`          | `/api/supabase/institutos`          | `/api/neo4j/institutos`          | `/api/azure/institutos`          |
| `PUT`    | `/api/mongo/institutos/:id`      | `/api/supabase/institutos/:id`      | `/api/neo4j/institutos/:id`      | `/api/azure/institutos/:id`      |
| `DELETE` | `/api/mongo/institutos/:id`      | `/api/supabase/institutos/:id`      | `/api/neo4j/institutos/:id`      | `/api/azure/institutos/:id`      |

---

## Criterios de la Rúbrica y cómo cubrirlos {#rubrica}

### 1. Análisis y Diseño *(diagrama + organigrama)*

Incluye en el reporte:
- El **diagrama de flujo** de la Parte A (petición → Router → Controller → Service → BD).
- El **organigrama de carpetas** de la Parte B mostrando las 4 subcarpetas y sus archivos.
- El **modelo de datos** del Catálogo de Institutos con los campos definidos por el maestro.
- Las validaciones y restricciones de cada campo del esquema.

### 2. Resolución *(algoritmos adecuados)*

- Todos los services usan `async/await` con `try/catch`.
- Cada BD usa la API correcta de su cliente:
  - **MongoDB** → métodos Mongoose (`find`, `findById`, `save`, `findByIdAndUpdate`, `findByIdAndDelete`)
  - **Supabase** → encadenamiento de métodos `supabase-js` (`.from().select()`, `.insert()`, etc.)
  - **Neo4j** → queries Cypher con `session.run()` y cierre de sesión en `finally`
  - **Azure** → métodos de `CosmosClient` (`readAll`, `create`, `replace`, `delete`)
- Manejo correcto de códigos HTTP: `200`, `201`, `400`, `404`, `500`.

### 3. Funcionamiento *(los 20 endpoints deben funcionar)*

Prueba en Postman. Secuencia recomendada para cada BD:
1. `POST` → crea un instituto, copia el `id` / `_id` de la respuesta.
2. `GET` todos → verifica que aparece el registro creado.
3. `GET` por ID → usa el id copiado.
4. `PUT` → modifica un campo, verifica el cambio en la respuesta.
5. `DELETE` → elimina y verifica que ya no existe con un `GET` por ID.

### 4. Identificación de componentes, controles y variables

- Archivos: patrón `recurso.tipo.js` (`instituto.service.js`, `instituto.controller.js`, etc.)
- Variables y funciones: `camelCase` (`getAll`, `mongoRoutes`, `supabaseClient`)
- Clases y esquemas: `PascalCase` (`Instituto`, `InstitutoSchema`)
- Carpetas de BD: minúsculas (`mongo/`, `supabase/`, `neo4j/`, `azure/`)

### 5. Diseño gráfico *(aplica al reporte)*

- Capturas de Postman por cada BD y cada operación (mínimo 20 capturas).
- Organigrama de arquitectura del diagrama de la Parte A.
- Tabla de los 20 endpoints.

### 6. Documentación interna del código

- Cada archivo tiene un comentario de encabezado con su propósito.
- Cada función tiene un bloque JSDoc (`/** ... */`) con descripción, `@param` y `@returns`.
- Código correctamente indentado (2 espacios).
- Comentarios en línea donde la lógica no sea obvia, especialmente en los queries de Neo4j y Cosmos DB.

### 7. Video Explicativo

Graba un video donde muestres:
1. La estructura de carpetas completa (las 4 subcarpetas visibles).
2. El archivo `.env` con las 4 secciones (ocultando los valores reales de contraseñas).
3. `npm run dev` con los 4 mensajes de conexión exitosa en la terminal.
4. La ruta raíz `GET /` mostrando el JSON con los 4 prefijos.
5. Las 5 pruebas en Postman para **al menos 2 BDs** (idealmente las 4).
6. Explicación verbal de por qué solo `mongo/` tiene modelo y cómo difiere el service de cada BD.

### 8. Presentación / Entrega

- Formato indicado por el maestro (papel y digital).
- Contenido mínimo: portada, introducción, diagrama de arquitectura, explicación de cada capa, capturas de Postman, conclusión y glosario.

---

> **Recuerda:** Los campos del `InstitutoSchema` (Parte C) deben tomarse de las notas del maestro FIC. No se infiere ninguna estructura aquí. Una vez que tengas esa información, completa el esquema y úsalo como referencia para los documentos que insertes en Supabase, Neo4j y Azure también.
