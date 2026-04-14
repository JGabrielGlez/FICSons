// src/institutos/mongo/instituto.routes.js
// Definición de rutas para MongoDB: /api/mongo/institutos

const express = require("express");
const router = express.Router();
const controller = require("./instituto.controller");

// GET /api/mongo/institutos
router.get("/institutos", controller.getAll);

// GET /api/mongo/institutos/:id
router.get("/institutos/:id", controller.getById);

// POST /api/mongo/institutos
router.post("/institutos", controller.create);

// PUT /api/mongo/institutos/:id
router.put("/institutos/:id", controller.update);

// DELETE /api/mongo/institutos/:id
router.delete("/institutos/:id", controller.delete);

module.exports = router;
