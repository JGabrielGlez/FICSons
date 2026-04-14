// src/institutos/neo4j/instituto.routes.js
// Definición de rutas para Neo4j: /api/neo4j/institutos

const express = require("express");
const router = express.Router();
const controller = require("./instituto.controller");

// GET /api/neo4j/institutos
router.get("/institutos", controller.getAll);

// GET /api/neo4j/institutos/:id
router.get("/institutos/:id", controller.getById);

// POST /api/neo4j/institutos
router.post("/institutos", controller.create);

// PUT /api/neo4j/institutos/:id
router.put("/institutos/:id", controller.update);

// DELETE /api/neo4j/institutos/:id
router.delete("/institutos/:id", controller.delete);

module.exports = router;
