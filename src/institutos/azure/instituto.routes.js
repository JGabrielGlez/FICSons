// src/institutos/azure/instituto.routes.js
// Definición de rutas para Azure Cosmos DB: /api/azure/institutos

const express = require("express");
const router = express.Router();
const controller = require("./instituto.controller");

// GET /api/azure/institutos
router.get("/institutos", controller.getAll);

// GET /api/azure/institutos/:id
router.get("/institutos/:id", controller.getById);

// POST /api/azure/institutos
router.post("/institutos", controller.create);

// PUT /api/azure/institutos/:id
router.put("/institutos/:id", controller.update);

// DELETE /api/azure/institutos/:id
router.delete("/institutos/:id", controller.delete);

module.exports = router;
