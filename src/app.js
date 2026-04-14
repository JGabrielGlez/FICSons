// src/app.js
// Configuración de Express - middlewares y registro de rutas

const express = require("express");
const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Importar routers
const mongoRouter = require("./institutos/mongo/instituto.routes");
const supabaseRouter = require("./institutos/supabase/instituto.routes");
const neo4jRouter = require("./institutos/neo4j/instituto.routes");
const azureRouter = require("./institutos/azure/instituto.routes");

// Registrar rutas
app.use("/api/mongo", mongoRouter);
app.use("/api/supabase", supabaseRouter);
app.use("/api/neo4j", neo4jRouter);
app.use("/api/azure", azureRouter);

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({ mensaje: "AppRESTeSecurity - API RESTful con Microservicios" });
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

module.exports = app;
